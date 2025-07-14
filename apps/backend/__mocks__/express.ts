const use = jest.fn();
const json = jest.fn(() => 'json');
const expressMock: any = jest.fn(() => ({ use }));
expressMock.json = json;
(expressMock as any).__mocks = { use, json, expressMock };
export = expressMock;
