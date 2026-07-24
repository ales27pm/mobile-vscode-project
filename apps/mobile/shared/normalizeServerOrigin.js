const INVALID_URL_MESSAGE =
  'MobileVSCode server URL must include an http:// or https:// scheme.';

function normalizeServerOrigin(rawValue) {
  if (typeof rawValue !== 'string') {
    throw new Error(INVALID_URL_MESSAGE);
  }

  const value = rawValue.trim();

  if (value.includes('YOUR_COMPUTER_IP_HERE')) {
    throw new Error('Replace YOUR_COMPUTER_IP_HERE in the MobileVSCode server URL.');
  }

  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(value)) {
    throw new Error(INVALID_URL_MESSAGE);
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(INVALID_URL_MESSAGE);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('MobileVSCode server URL must use http:// or https://.');
  }

  if (url.username || url.password || url.search || url.hash) {
    throw new Error(
      'MobileVSCode server URL must be a plain origin without credentials, query, or fragment.'
    );
  }

  if (url.pathname !== '/' && url.pathname !== '') {
    throw new Error('MobileVSCode server URL must not include /graphql, /yjs, or another path.');
  }

  return `${url.protocol}//${url.host}`;
}

module.exports = { normalizeServerOrigin };
