import { AnyMap, CrashEvent, CrashHunterClientInitOptions, CrashHunterClientOptions, ICrashHunter } from '../interface';
import { IPlugin } from '../interface/i-plugins';
import getLogger, { GetLogger } from '../tools/logger';

/**
 * A CrashHunter library.
 */
export default class CrashHunter<Context extends AnyMap, Metadata extends AnyMap> implements ICrashHunter<Context, Metadata> {
  private static SDK_VERSION: string = (process.env.SDK_VERSION as unknown) as string;

  private options: CrashHunterClientOptions<Context, Metadata>;
  private _enable: boolean;
  private _timer?: null | NodeJS.Timeout;
  private _headCrashEventList: CrashEvent[];
  private _tailCrashEventList: CrashEvent[];
  private _pulgins: IPlugin[];

  constructor(options: CrashHunterClientInitOptions<Context, Metadata>, plugins: IPlugin[] = []) {
    getLogger().setDebug(!!options.debug);
    getLogger().log(`[CrashHunter] new CrashHunter`);
    this._enable = true;
    this._headCrashEventList = [];
    this._tailCrashEventList = [];
    this.options = {
      debug: false,
      metadata: {} as Metadata,
      max_size: 100,
      interval: 5000,
      ...options,
      node_config: {
        not_exit_on_uncaught_exception: false,
        not_exit_on_unhandled_rejection: false,
        ...options.node_config,
      },
    };
    this._pulgins = plugins;
    this._pulgins.map((plugin) => plugin.setup(this as ICrashHunter));
  }
  getSDKVersion(): string {
    return CrashHunter.SDK_VERSION;
  }
  getOption(): CrashHunterClientOptions<Context, Metadata> {
    return this.options;
  }
  getLogger(): ReturnType<GetLogger> {
    return getLogger();
  }
  enableDebugLog(enable: boolean): void {
    getLogger().setDebug(enable);
  }
  setMetadataValue(key: keyof Metadata, value: Metadata[typeof key]): void {
    getLogger().info(`[CrashHunter] setMetadataValue key: ${key}, value: ${value}`);
    this.options.metadata[key] = value;
  }
  private addCrashToList(crash: CrashEvent) {
    const preListSize = this.options.max_size / 2;
    if (this._headCrashEventList.length < preListSize) {
      this._headCrashEventList.push(crash);
    } else if (this._tailCrashEventList.length < preListSize) {
      this._tailCrashEventList.push(crash);
    } else {
      this._tailCrashEventList.shift();
      this._tailCrashEventList.push(crash);
    }
    if (!this._timer && this._enable) {
      this._timer = setTimeout(async () => {
        await this._send();
        this._timer = null;
      }, this.options.interval);
    }
  }
  captureException(exception: Error, context: Context = {} as Context): string | undefined {
    getLogger().info(`[CrashHunter] captureException exception: ${exception}, context: ${context}`);
    this.addCrashToList({
      timestamp: new Date().getTime(),
      name: exception.name || '',
      message: exception.message || '',
      stacktrace: exception.stack || '',
      metadata: this.options.metadata,
      context: context,
    });
    return;
  }
  captureMessage(message: string, context: Context = {} as Context, name: string = '', stacktrace: string = ''): string | undefined {
    getLogger().info(`[captureMessage] captureException message: ${message}, context: ${context}`);
    this.addCrashToList({
      timestamp: new Date().getTime(),
      name: name,
      message: message || '',
      stacktrace: stacktrace,
      metadata: this.options.metadata,
      context: context,
    });
    return;
  }
  attempt<TResult>(func: (...args: any[]) => TResult, ...args: any[]): Error | TResult {
    try {
      return func(...args);
    } catch (e) {
      this.captureException(e);
      return e;
    }
  }
  async asyncAttempt<TResult>(func: (...args: any[]) => Promise<TResult>, ...args: any[]): Promise<Error | TResult> {
    try {
      return await func(...args);
    } catch (e) {
      this.captureException(e);
      return e;
    }
  }
  private async _send() {
    try {
      const _crashEventList: CrashEvent[] = this._headCrashEventList.concat(this._tailCrashEventList);
      getLogger().info(`[captureMessage] send crashEventList event count: ${_crashEventList.length}`);
      if (_crashEventList.length) {
        const events = _crashEventList;
        this._headCrashEventList = [];
        this._tailCrashEventList = [];
        await this.options.request(events as CrashEvent<Context, Metadata>[]);
      }
    } catch (e) {
      getLogger().error(`[CrashHunter] send crash event error: ${e}`);
    }
  }
  async close(timeout: number = 5000): Promise<boolean> {
    getLogger().info(`[captureMessage] close`);
    this._enable = false;
    this._pulgins.map((plugin) => plugin.destory?.());
    return await this.flush(timeout);
  }
  flush(timeout: number = 5000): Promise<boolean> {
    getLogger().info(`[captureMessage] flush`);
    return new Promise<boolean>(async (resolve) => {
      const timer = setTimeout(() => {
        resolve(false);
      }, timeout);
      if (this._timer) {
        clearTimeout(this._timer);
      }
      await this._send();
      clearTimeout(timer);
      resolve(true);
    });
  }
}
