import { ICrashHunter } from '../../interface';
import { IPlugin } from '../../interface/i-plugins';

export default class NodeUnhandledRejectionPlugin implements IPlugin {
  private _handler?: NodeJS.UnhandledRejectionListener;
  setup(client: ICrashHunter): void {
    this._handler = (reason) => {
      typeof reason === 'string' ? client.captureMessage(reason, {}, 'unhandledRejection') : client.captureException(reason);
      if (!client.getOption().node_config.not_exit_on_unhandled_rejection) {
        client.flush().then(() => process.exit(1));
      }
    };
    process.on('unhandledRejection', this._handler);
  }
  destory(): void {
    if (this._handler) {
      process.removeListener('unhandledRejection', this._handler);
    }
  }
}
