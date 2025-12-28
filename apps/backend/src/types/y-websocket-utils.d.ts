declare module "y-websocket/bin/utils" {
  import type http from "http";

  export function setupWSConnection(
    req: http.IncomingMessage,
    socket: any,
    head: Buffer,
    opts?: any
  ): void;

  // Your repo's bindState/unbindState are void (not Promise-based)
  export function setPersistence(persistence: {
    bindState: (docName: string, doc: any) => void;
    writeState: (docName: string, doc?: any) => void;
  }): void;
}
