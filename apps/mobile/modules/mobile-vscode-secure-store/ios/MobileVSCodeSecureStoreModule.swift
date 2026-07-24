import ExpoModulesCore
import Security

internal struct MobileVSCodeSecureStoreOptions: Record {
  @Field
  var keychainService: String = "mobile-vscode.session"
}

public final class MobileVSCodeSecureStoreModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MobileVSCodeSecureStore")

    AsyncFunction("getValueWithKeyAsync") { (key: String, options: MobileVSCodeSecureStoreOptions) -> String? in
      try validate(key: key, service: options.keychainService)
      return try getValue(for: key, service: options.keychainService)
    }

    AsyncFunction("setValueWithKeyAsync") { (value: String, key: String, options: MobileVSCodeSecureStoreOptions) -> Bool in
      try validate(key: key, service: options.keychainService)
      try setValue(value, for: key, service: options.keychainService)
      return true
    }

    AsyncFunction("deleteValueWithKeyAsync") { (key: String, options: MobileVSCodeSecureStoreOptions) in
      try validate(key: key, service: options.keychainService)
      try deleteValue(for: key, service: options.keychainService)
    }
  }

  private func validate(key: String, service: String) throws {
    guard !key.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
      throw secureStoreError(operation: "validate", status: errSecParam, detail: "The key cannot be empty.")
    }

    guard !service.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
      throw secureStoreError(operation: "validate", status: errSecParam, detail: "The keychain service cannot be empty.")
    }
  }

  private func baseQuery(for key: String, service: String) -> [String: Any] {
    return [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: key
    ]
  }

  private func getValue(for key: String, service: String) throws -> String? {
    var query = baseQuery(for: key, service: service)
    query[kSecMatchLimit as String] = kSecMatchLimitOne
    query[kSecReturnData as String] = kCFBooleanTrue

    var result: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &result)

    switch status {
    case errSecSuccess:
      guard let data = result as? Data, let value = String(data: data, encoding: .utf8) else {
        throw secureStoreError(operation: "read", status: errSecDecode, detail: "The stored value is not valid UTF-8.")
      }
      return value
    case errSecItemNotFound:
      return nil
    default:
      throw secureStoreError(operation: "read", status: status)
    }
  }

  private func setValue(_ value: String, for key: String, service: String) throws {
    let valueData = Data(value.utf8)
    let query = baseQuery(for: key, service: service)
    var addQuery = query
    addQuery[kSecValueData as String] = valueData
    addQuery[kSecAttrAccessible as String] = kSecAttrAccessibleWhenUnlockedThisDeviceOnly

    let addStatus = SecItemAdd(addQuery as CFDictionary, nil)

    switch addStatus {
    case errSecSuccess:
      return
    case errSecDuplicateItem:
      // Match Keychain's supported update path: keep the item's immutable
      // accessibility metadata and replace only its secret value.
      let updateAttributes = [kSecValueData as String: valueData]
      let updateStatus = SecItemUpdate(query as CFDictionary, updateAttributes as CFDictionary)
      guard updateStatus == errSecSuccess else {
        throw secureStoreError(operation: "update", status: updateStatus)
      }
    default:
      throw secureStoreError(operation: "write", status: addStatus)
    }
  }

  private func deleteValue(for key: String, service: String) throws {
    let status = SecItemDelete(baseQuery(for: key, service: service) as CFDictionary)

    if status != errSecSuccess && status != errSecItemNotFound {
      throw secureStoreError(operation: "delete", status: status)
    }
  }

  private func secureStoreError(
    operation: String,
    status: OSStatus,
    detail: String? = nil
  ) -> NSError {
    let systemMessage = SecCopyErrorMessageString(status, nil) as String? ?? "Unknown Keychain error"
    let message = detail ?? systemMessage

    return NSError(
      domain: "MobileVSCodeSecureStore",
      code: Int(status),
      userInfo: [NSLocalizedDescriptionKey: "Secure storage \(operation) failed: \(message)"]
    )
  }
}
