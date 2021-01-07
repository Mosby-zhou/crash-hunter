let debug = false;

const methods = ['log', 'info', 'warn', 'error'] as const;

export type GetLogger = () => Record<
  'log' | 'info' | 'warn' | 'error',
  {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
  }
> & {
  setDebug: (debug: boolean) => void;
};

const getLogger: GetLogger = () => {
  const result: Record<typeof methods[number], typeof console.log> & {
    setDebug: (debug: boolean) => void;
  } = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    setDebug: (_debug: boolean) => {
      debug = _debug;
    },
  };
  methods.forEach((method) => {
    result[method] = (...args: unknown[]) => {
      // error 一定会打印
      if (!debug && method !== 'error') {
        return;
      }
      console[method](...args);
    };
  });
  return result;
};

export default getLogger;
