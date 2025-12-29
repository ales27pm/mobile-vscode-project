import Constants from 'expo-constants';

const LOCAL_IP = Constants.expoConfig?.extra?.LOCAL_IP || 'localhost';

if (LOCAL_IP === 'YOUR_COMPUTER_IP_HERE') {
  console.warn("Please update the LOCAL_IP in your .env file. It is still set to the placeholder value.");
}

const PORT = 4000;

export const GRAPHQL_URL = `https://${LOCAL_IP}:${PORT}/graphql`;
export const WS_URL = `wss://${LOCAL_IP}:${PORT}/graphql`;
export const YJS_URL = `wss://${LOCAL_IP}:${PORT}/yjs`;
