module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^vscode$': '<rootDir>/__mocks__/vscode.ts',
    '^y-websocket/bin/utils.js$': '<rootDir>/__mocks__/y-websocket-utils.ts',
    '^yjs$': '<rootDir>/__mocks__/yjs.ts',
    '^lodash.debounce$': '<rootDir>/__mocks__/lodash.debounce.ts',
  },
};
