import { GetLogger } from '../tools/logger';

export type CrashHunterClientOptions<Context extends AnyMap = AnyMap, Metadata extends AnyMap = AnyMap> = {
  /**
   * Enable debug log. Defaults to `false`.
   */
  debug: boolean;

  /**
   * SDK Metadata. Defaults to `{}`.
   */
  metadata: Metadata;

  /**
   * Error cache list max size. Defaults to 20.
   */
  max_size: number;

  /**
   * Error cache list flush interval. Defaults to 1000.
   */
  interval: number;

  /**
   * SDK request method.
   */
  request: (data: CrashEvent<Context, Metadata>[]) => Promise<void>;

  // /**
  //  * SDK EventEmitter method.
  //  */
  // EventEmitter: typeof EventEmitter;

  /**
   * SDK node special config args.
   */
  node_config: {
    /**
     * not_exit_on_uncaught_exception. Defaults to false.
     */
    not_exit_on_uncaught_exception: boolean;
    /**
     * not_exit_on_uncaught_exception. Defaults to false.
     */
    not_exit_on_unhandled_rejection: boolean;
  };
};

export type RequiredOptionKey = 'request';

export type CrashHunterClientInitOptions<Context extends AnyMap = AnyMap, Metadata extends AnyMap = AnyMap> = Partial<
  Omit<CrashHunterClientOptions<Context, Metadata>, RequiredOptionKey>
> &
  Pick<CrashHunterClientOptions<Context, Metadata>, RequiredOptionKey>;

// export enum CrashHunterClientEvent {
//   NETWORK_ERROR = 'NETWORK_ERROR',
// }

export type AnyMap = Record<string, unknown>;

export type CrashEvent<Context extends AnyMap = AnyMap, Metadata extends AnyMap = AnyMap> = {
  event_id?: string;
  timestamp?: number;
  name?: string;
  stacktrace?: string;
  message?: string;
  context?: Context;
  metadata?: Metadata;
};

export interface ICrashHunter<Context extends AnyMap = AnyMap, Metadata extends AnyMap = AnyMap> {
  /**
   * 获取SDK版本号
   * @returns SDK版本号
   */
  getSDKVersion(): string;

  /**
   * 开关Debug Log
   * @param enable - 是否打开debug log
   * @returns void
   */
  enableDebugLog(enable: boolean): void;

  /**
   * 设置 SDK Metadata value
   * @param key - SDK Metadata key
   * @param value - SDK Metadata value
   * @returns void
   */
  setMetadataValue(key: keyof Metadata, value: Metadata[typeof key]): void;

  /**
   * 获取SDK option
   * @returns SDK option
   */
  getOption(): CrashHunterClientOptions<Context, Metadata>;

  /**
   * 获取SDK logger
   * @returns SDK logger
   */
  getLogger(): ReturnType<GetLogger>;

  // /**
  //  * 添加事件监听
  //  * @param event - 事件
  //  * @param callback - 事件回调
  //  * @returns 取消事件函数
  //  */
  // on(event: CrashHunterClientEvent.NETWORK_ERROR, callback: (error: Error) => void): () => void;

  /**
   * Captures an exception event and sends it to Sentry.
   *
   * @param exception - An exception-like object.
   * @param context - May contain additional information about the original exception.
   * @returns The event id
   */
  captureException(exception: any, context?: Context): string | undefined;

  /**
   * Captures a message event and sends it to Sentry.
   *
   * @param message - The message to send to Sentry.
   * @param context - May contain additional information about the original exception.
   * @param name - The error name.
   * @param stacktrace - Stacktrace.
   * @returns The event id
   */
  captureMessage(message: string, context?: Context, name?: string, stacktrace?: string): string | undefined;

  /**
   * A promise that resolves when all current events have been sent.
   * If you provide a timeout and the queue takes longer to drain the promise returns false.
   *
   * @param timeout - Maximum time in ms the client should wait.
   */
  close(timeout?: number): Promise<boolean>;

  /**
   * A promise that resolves when all current events have been sent.
   * If you provide a timeout and the queue takes longer to drain the promise returns false.
   *
   * @param timeout - Maximum time in ms the client should wait.
   */
  flush(timeout?: number): Promise<boolean>;

  /**
   * @param func - Attempt function
   * @param args - Attempt function args
   */
  attempt<TResult>(func: (...args: any[]) => TResult, ...args: any[]): TResult | Error;

  /**
   * @param func - Attempt function
   * @param args - Attempt function args
   */
  asyncAttempt<TResult>(func: (...args: any[]) => Promise<TResult>, ...args: any[]): Promise<TResult | Error>;
}
