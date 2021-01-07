import CrashHunterBase from '../lib/core/crash-hunter';
import { AnyMap, CrashHunterClientInitOptions, ICrashHunter } from '../lib/interface';
import { IPlugin } from '../lib/interface/i-plugins';
import BrowserWindowOnerrorPlugin from '../lib/plugin/browser-window-onerror';
import BrowserWindowUnhandledRejectionPlugin from '../lib/plugin/browser-window-unhandled-rejection';

const CrashHunter = {
  init<Context extends AnyMap, Metadata extends AnyMap>(
    options: CrashHunterClientInitOptions<Context, Metadata>,
    plugins: IPlugin[] = [new BrowserWindowOnerrorPlugin(), new BrowserWindowUnhandledRejectionPlugin()],
  ): ICrashHunter<Context, Metadata> {
    return new CrashHunterBase<Context, Metadata>(options, plugins);
  },
};

export { CrashHunter };
