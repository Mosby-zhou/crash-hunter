import { ICrashHunter } from '../../interface';
import { IPlugin } from '../../interface/i-plugins';

export default class BrowserWindowOnerrorPlugin implements IPlugin {
  private _handler?: OnErrorEventHandler;
  private _prevHandler?: OnErrorEventHandler;

  setup(client: ICrashHunter): void {
    const that = this;

    this._handler = function (this: Window, messageOrEvent, url, lineNo, charNo, error) {
      // Ignore errors with no info due to CORS settings
      if (lineNo === 0 && /Script error\.?/.test(messageOrEvent as string)) {
        client.getLogger().warn('Ignoring cross-domain or eval script error.');
      } else {
        if (typeof messageOrEvent === 'string') {
          client.captureMessage(messageOrEvent, {}, 'window.onerror');
        } else {
          client.captureException(messageOrEvent);
        }
      }

      if (typeof that._prevHandler === 'function') that._prevHandler.apply(this, arguments as any);
    };

    this._prevHandler = window.onerror;
    window.onerror = this._handler;
  }
  destory(): void {
    if (this._handler) {
      window.onerror = this._prevHandler || null;
    }
  }
}
