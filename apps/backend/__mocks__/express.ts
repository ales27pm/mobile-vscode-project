const use = jest.fn();
const json = jest.fn(() => 'json');

interface ExpressMock extends jest.Mock {
  json: jest.Mock;
  __mocks: { use: jest.Mock; json: jest.Mock; expressMock: jest.Mock };
}

const expressMock = jest.fn(() => ({ use })) as ExpressMock;
expressMock.json = json;
expressMock.__mocks = { use, json, expressMock };

export = expressMock;
