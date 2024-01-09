import chalk from "chalk";

enum LOG_LEVELS  {
  "debug" = 1,
  "info",
  "warn",
  "err"
}

const logLevel = LOG_LEVELS[(process.env.LOG_LEVEL || '').toLowerCase()] || LOG_LEVELS.info;

export function debug(...params: any[]) {
  if (logLevel <= LOG_LEVELS.debug) console.debug(chalk.gray(params.join(" ")));
}

export function info(...params: any[]) {
  if (logLevel <= LOG_LEVELS.info) console.info(chalk.blue(params.join(" ")));
}

export function warn(...params: any[]) {
  if (logLevel <= LOG_LEVELS.warn) console.warn(chalk.yellow(params.join(" ")));
}

export function err(...params: any[]) {
  console.error(chalk.red(params.join(" ")));
}