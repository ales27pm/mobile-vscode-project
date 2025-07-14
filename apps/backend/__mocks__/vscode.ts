export const workspace = { getConfiguration: () => ({ get: () => undefined }) };
const statusBarItem = new StatusBarItem();
export const window = { 
  showInformationMessage: jest.fn(), 
  createStatusBarItem: jest.fn(() => statusBarItem) 
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
