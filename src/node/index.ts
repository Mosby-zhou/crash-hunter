import CrashHunterBase from '../lib/core/crash-hunter';
import { AnyMap, CrashEvent, CrashHunterClientInitOptions, CrashHunterClientOptions, ICrashHunter, RequiredOptionKey } from '../lib/interface';
import { IPlugin } from '../lib/interface/i-plugins';
import NodeUncaughtExceptionPlugin from '../lib/plugin/node-uncaught-exception';
import NodeUnhandledRejectionPlugin from '../lib/plugin/node-unhandled-rejection';
import { GetLogger } from '../lib/tools/logger';

const CrashHunter = {
  init<Context extends AnyMap, Metadata extends AnyMap>(
    options: CrashHunterClientInitOptions<Context, Metadata>,
    plugins: IPlugin[] = [new NodeUncaughtExceptionPlugin(), new NodeUnhandledRejectionPlugin()],
  ): ICrashHunter<Context, Metadata> {
    return new CrashHunterBase<Context, Metadata>(options, plugins);
  },
};

export {
  CrashHunter,
  AnyMap,
  CrashHunterClientInitOptions,
  IPlugin,
  ICrashHunter,
  CrashHunterClientOptions,
  RequiredOptionKey,
  CrashEvent,
  GetLogger,
};
