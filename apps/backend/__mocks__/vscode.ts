export const workspace = { getConfiguration: () => ({ get: () => undefined }) };
export const window = { 
  showInformationMessage: jest.fn(), 
  createStatusBarItem: jest.fn(() => new StatusBarItem()) 
};
export const StatusBarAlignment = { Right: 0 };
export class ThemeColor {
  constructor(public id: string) {}
}
export class StatusBarItem {
  text = '';
  tooltip = '';
  command: string | undefined;
  backgroundColor: any = undefined;
  show() {
    /* noop */
  }
}
