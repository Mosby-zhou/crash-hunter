import { ICrashHunter } from '../../interface';
import { IPlugin } from '../../interface/i-plugins';

export default class BrowserWindowUnhandledRejectionPlugin implements IPlugin {
  private _handler?: (this: Window, event: PromiseRejectionEvent) => void;

  setup(client: ICrashHunter): void {
    this._handler = (event: PromiseRejectionEvent) => {
      if (typeof event.reason === 'string') {
        client.captureMessage(event.reason, {}, 'unhandledrejection');
      } else {
        client.captureException(event.reason, {});
      }
    };

    window.addEventListener('unhandledrejection', this._handler);
  }
  destory(): void {
    if (this._handler) {
      window.removeEventListener('unhandledrejection', this._handler);
    }
  }
}
