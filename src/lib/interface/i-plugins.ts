import { ICrashHunter } from './i-crash-hunter';

export interface IPlugin {
  /**
   * 初始化插件
   * @returns void
   */
  setup(client: ICrashHunter): void;

  /**
   * 销毁插件
   * @returns void
   */
  destory(): void;
}
