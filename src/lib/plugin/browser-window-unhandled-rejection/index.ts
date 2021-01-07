import { ICrashHunter } from '../../interface';
import { IPlugin } from '../../interface/i-plugins';

export default class BrowserWindowUnhandledRejectionPlugin implements IPlugin {
  private _handler?: (this: Window, event: PromiseRejectionEvent) => void;

  setup(client: ICrashHunter): void {
    this._handler = (event: PromiseRejectionEvent) => {
      client.captureMessage(event.reason, {}, 'unhandledrejection');
    };

    window.addEventListener('unhandledrejection', this._handler);
  }
  destory(): void {
    if (this._handler) {
      window.removeEventListener('unhandledrejection', this._handler);
    }
  }
}
