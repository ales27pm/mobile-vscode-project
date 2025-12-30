const listen = jest.fn((port: number, hostOrCb: any, maybeCb?: any) => {
  const cb = typeof hostOrCb === 'function' ? hostOrCb : maybeCb;
  if (typeof cb === 'function') cb();
});

const close = jest.fn((cb?: () => void) => {
  if (cb) {
    cb();
  }
});
const on = jest.fn();
const address = jest.fn(() => ({ address: '127.0.0.1', port: 4000 }));
export const __mocks = { listen, close, on, address };
export const createServer = jest.fn(() => ({ listen, close, on, address }));
