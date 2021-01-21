import { ICrashHunter } from '../../interface';
import { IPlugin } from '../../interface/i-plugins';

export default class NodeUncaughtExceptionPlugin implements IPlugin {
  private _handler?: NodeJS.UncaughtExceptionListener;
  setup(client: ICrashHunter): void {
    this._handler = (err: Error) => {
      typeof err === 'string' ? client.captureMessage(err) : client.captureException(err);
      if (!client.getOption().node_config.not_exit_on_uncaught_exception) {
        client.flush().then(() => process.exit(1));
      }
    };
    process.on('uncaughtException', this._handler);
  }
  destory(): void {
    if (this._handler) {
      process.removeListener('uncaughtException', this._handler);
    }
  }
}
