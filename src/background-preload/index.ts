import { ipcRenderer } from 'electron';
import { parse } from 'url';

import { getAPI } from '../api';
import { IpcExtension } from '../models/ipc-extension';

declare const window: any;
declare const global: any;

// https://github.com/electron/electron/issues/11290#issuecomment-362301961
Object.defineProperty(window.navigator, 'userAgent', {
  value: window.navigator.userAgent.replace(/Electron\/\S*\s/, ''),
  configurable: false,
  writable: false,
});

ipcRenderer.setMaxListeners(0);

const extensionId = parse(window.location.href).hostname;

const sessionId: number = ipcRenderer.sendSync('get-session-id');

const extension: IpcExtension = ipcRenderer.sendSync(
  `get-extension-${sessionId}`,
  extensionId,
);

process.once('loaded', () => {
  const api = getAPI(extension, sessionId);

  window.chrome = api;
  window.browser = api;

  process.once('loaded', () => {
    delete global.require;
    delete global.module;
    delete global.Buffer;
    delete global.setImmediate;
    delete global.clearImmediate;
    delete global.global;
  });
});