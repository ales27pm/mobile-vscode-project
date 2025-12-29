import 'react-native-get-random-values';
import 'react-native-url-polyfill';

// If *anything* tries to overwrite crypto later, it can trigger "property is not writable".
// Keeping the polyfills minimal and first reduces that risk.
