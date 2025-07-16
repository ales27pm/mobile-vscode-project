const workspace = {
    getConfiguration: jest.fn(() => ({ get: jest.fn() })),
};

const vscodeWindow = {
    showWarningMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
};

module.exports = { workspace, window: vscodeWindow };
