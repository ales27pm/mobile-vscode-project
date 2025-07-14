const listen = jest.fn((port: number, cb: () => void) => cb());
const close = jest.fn((cb: () => void) => cb());
const on = jest.fn();
export const __mocks = { listen, close, on };
export const createServer = jest.fn(() => ({ listen, close, on }));
