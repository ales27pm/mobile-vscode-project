package expo.modules.mobilevscodesecurestore

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyPermanentlyInvalidatedException
import android.security.keystore.KeyProperties
import android.util.Base64
import android.util.Log
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.types.OptimizedRecord
import org.json.JSONException
import org.json.JSONObject
import java.io.Serializable
import java.nio.charset.StandardCharsets
import java.security.GeneralSecurityException
import java.security.KeyStore
import java.security.MessageDigest
import java.security.UnrecoverableKeyException
import javax.crypto.AEADBadTagException
import javax.crypto.BadPaddingException
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

@OptimizedRecord
internal class MobileVSCodeSecureStoreOptions(
  @Field var keychainService: String = DEFAULT_KEYCHAIN_SERVICE
) : Record, Serializable

internal class MobileVSCodeSecureStoreException(message: String, cause: Throwable? = null) :
  CodedException(message, cause)

class MobileVSCodeSecureStoreModule : Module() {
  private val cryptoLock = Any()

  private val reactContext: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("MobileVSCodeSecureStore")

    AsyncFunction("getValueWithKeyAsync") { key: String, options: MobileVSCodeSecureStoreOptions ->
      validate(key, options.keychainService)
      getValue(key, options.keychainService)
    }

    AsyncFunction("setValueWithKeyAsync") { value: String, key: String, options: MobileVSCodeSecureStoreOptions ->
      validate(key, options.keychainService)
      setValue(key, value, options.keychainService)
      true
    }

    AsyncFunction("deleteValueWithKeyAsync") { key: String, options: MobileVSCodeSecureStoreOptions ->
      validate(key, options.keychainService)
      deleteValue(key, options.keychainService)
    }
  }

  private fun validate(key: String, service: String) {
    if (key.isBlank()) {
      throw MobileVSCodeSecureStoreException("Secure storage keys cannot be empty.")
    }
    if (service.isBlank()) {
      throw MobileVSCodeSecureStoreException("The secure storage keychain service cannot be empty.")
    }
  }

  private fun preferences() = reactContext.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)

  private fun storageKey(key: String, service: String): String {
    val bytes = MessageDigest.getInstance("SHA-256")
      .digest("$service\u0000$key".toByteArray(StandardCharsets.UTF_8))
    return Base64.encodeToString(bytes, Base64.NO_WRAP or Base64.NO_PADDING or Base64.URL_SAFE)
  }

  private fun keyStoreAlias(service: String) = "$KEYSTORE_ALIAS_PREFIX:$service"

  private fun loadKeyStore(): KeyStore = KeyStore.getInstance(ANDROID_KEYSTORE).apply {
    load(null)
  }

  private fun getOrCreateSecretKey(alias: String): SecretKey {
    val keyStore = loadKeyStore()
    (keyStore.getKey(alias, null) as? SecretKey)?.let { return it }

    val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)
    val keySpec = KeyGenParameterSpec.Builder(
      alias,
      KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
    )
      .setKeySize(AES_KEY_SIZE_BITS)
      .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
      .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
      .setRandomizedEncryptionRequired(true)
      .setUserAuthenticationRequired(false)
      .build()

    keyGenerator.init(keySpec)
    return keyGenerator.generateKey()
  }

  private fun existingSecretKey(alias: String): SecretKey? {
    val keyStore = loadKeyStore()
    if (!keyStore.containsAlias(alias)) return null
    return keyStore.getKey(alias, null) as? SecretKey
  }

  private fun setValue(key: String, value: String, service: String) = synchronized(cryptoLock) {
    val alias = keyStoreAlias(service)
    try {
      val cipher = Cipher.getInstance(AES_CIPHER)
      cipher.init(Cipher.ENCRYPT_MODE, getOrCreateSecretKey(alias))
      val ciphertext = cipher.doFinal(value.toByteArray(StandardCharsets.UTF_8))
      val encoded = JSONObject()
        .put(VERSION_PROPERTY, CURRENT_VERSION)
        .put(CIPHERTEXT_PROPERTY, Base64.encodeToString(ciphertext, Base64.NO_WRAP))
        .put(IV_PROPERTY, Base64.encodeToString(cipher.iv, Base64.NO_WRAP))
        .put(TAG_LENGTH_PROPERTY, GCM_TAG_LENGTH_BITS)
        .toString()

      val committed = preferences().edit().putString(storageKey(key, service), encoded).commit()
      if (!committed) {
        throw MobileVSCodeSecureStoreException("Secure storage could not persist key '$key'.")
      }
    } catch (error: MobileVSCodeSecureStoreException) {
      throw error
    } catch (error: GeneralSecurityException) {
      throw MobileVSCodeSecureStoreException("Secure storage encryption failed for key '$key'.", error)
    } catch (error: JSONException) {
      throw MobileVSCodeSecureStoreException("Secure storage could not encode key '$key'.", error)
    }
  }

  private fun getValue(key: String, service: String): String? = synchronized(cryptoLock) {
    val persistedKey = storageKey(key, service)
    val encoded = preferences().getString(persistedKey, null) ?: return@synchronized null
    val alias = keyStoreAlias(service)

    try {
      val secretKey = existingSecretKey(alias)
      if (secretKey == null) {
        preferences().edit().remove(persistedKey).commit()
        return@synchronized null
      }

      val item = JSONObject(encoded)
      if (item.optInt(VERSION_PROPERTY, -1) != CURRENT_VERSION) {
        preferences().edit().remove(persistedKey).commit()
        return@synchronized null
      }

      val tagLength = item.getInt(TAG_LENGTH_PROPERTY)
      if (tagLength < MIN_GCM_TAG_LENGTH_BITS) {
        throw MobileVSCodeSecureStoreException("Secure storage authentication tag is too short.")
      }

      val ciphertext = Base64.decode(item.getString(CIPHERTEXT_PROPERTY), Base64.DEFAULT)
      val iv = Base64.decode(item.getString(IV_PROPERTY), Base64.DEFAULT)
      val cipher = Cipher.getInstance(AES_CIPHER)
      cipher.init(Cipher.DECRYPT_MODE, secretKey, GCMParameterSpec(tagLength, iv))
      return@synchronized String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8)
    } catch (error: KeyPermanentlyInvalidatedException) {
      Log.w(TAG, "Secure storage key was permanently invalidated.", error)
      invalidateValue(persistedKey, alias)
      return@synchronized null
    } catch (error: AEADBadTagException) {
      Log.w(TAG, "Secure storage authentication failed.", error)
      invalidateValue(persistedKey, alias)
      return@synchronized null
    } catch (error: BadPaddingException) {
      Log.w(TAG, "Secure storage padding validation failed.", error)
      invalidateValue(persistedKey, alias)
      return@synchronized null
    } catch (error: UnrecoverableKeyException) {
      Log.w(TAG, "Secure storage key could not be recovered.", error)
      invalidateValue(persistedKey, alias)
      return@synchronized null
    } catch (error: JSONException) {
      Log.w(TAG, "Secure storage payload was invalid JSON.", error)
      preferences().edit().remove(persistedKey).commit()
      return@synchronized null
    } catch (error: IllegalArgumentException) {
      Log.w(TAG, "Secure storage payload was malformed.", error)
      preferences().edit().remove(persistedKey).commit()
      return@synchronized null
    } catch (error: MobileVSCodeSecureStoreException) {
      throw error
    } catch (error: GeneralSecurityException) {
      throw MobileVSCodeSecureStoreException("Secure storage decryption failed for key '$key'.", error)
    }
  }

  private fun invalidateValue(persistedKey: String, alias: String) {
    preferences().edit().remove(persistedKey).commit()
    try {
      loadKeyStore().deleteEntry(alias)
    } catch (_: GeneralSecurityException) {
      // The stored value is already unusable; re-pairing will create a fresh key.
    }
  }

  private fun deleteValue(key: String, service: String) {
    val removed = preferences().edit().remove(storageKey(key, service)).commit()
    if (!removed) {
      throw MobileVSCodeSecureStoreException("Secure storage could not delete key '$key'.")
    }
  }

  companion object {
    private const val TAG = "MVSC-SecureStore"
    private const val ANDROID_KEYSTORE = "AndroidKeyStore"
    private const val PREFERENCES_NAME = "MobileVSCodeSecureStore"
    private const val KEYSTORE_ALIAS_PREFIX = "mobile-vscode-secure-store"
    private const val AES_CIPHER = "AES/GCM/NoPadding"
    private const val AES_KEY_SIZE_BITS = 256
    private const val GCM_TAG_LENGTH_BITS = 128
    private const val MIN_GCM_TAG_LENGTH_BITS = 96
    private const val CURRENT_VERSION = 1
    private const val VERSION_PROPERTY = "v"
    private const val CIPHERTEXT_PROPERTY = "ct"
    private const val IV_PROPERTY = "iv"
    private const val TAG_LENGTH_PROPERTY = "tlen"
  }
}

private const val DEFAULT_KEYCHAIN_SERVICE = "mobile-vscode.session"
