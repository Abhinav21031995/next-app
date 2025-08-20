interface RemoteContainer {
  init(shareScope: unknown): Promise<void>;
  get(module: string): Promise<() => { default: React.ComponentType }>;
}

declare global {
  interface Window {
    [scope: string]: RemoteContainer | undefined;
    __webpack_init_sharing__?: (scope: string) => Promise<void>;
    __webpack_share_scopes__?: { default: unknown };
  }
}
