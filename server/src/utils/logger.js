const { env } = require('../config/env');

function formatMessage(args) {
  return args
    .map((arg) => {
      if (arg instanceof Error) {
        return arg.stack || arg.message;
      }
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(' ');
}

const logger = {
  info(...args) {
    console.log(`[INFO] ${formatMessage(args)}`);
  },
  warn(...args) {
    console.warn(`[WARN] ${formatMessage(args)}`);
  },
  error(...args) {
    console.error(`[ERROR] ${formatMessage(args)}`);
  },
  debug(...args) {
    if (env.nodeEnv !== 'production') {
      console.debug(`[DEBUG] ${formatMessage(args)}`);
    }
  },
};

module.exports = logger;
