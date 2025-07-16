const debounce = (fn: (...args: any[]) => any) => {
  const wrapped: any = (...args: any[]) => fn(...args);
  wrapped.cancel = jest.fn();
  wrapped.flush = jest.fn();
  return wrapped;
};
module.exports = debounce;
