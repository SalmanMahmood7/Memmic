type Level = "INFO" | "WARNING" | "ERROR" | "DEBUG";

function log(level: Level, name: string, message: unknown): void {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  // eslint-disable-next-line no-console
  console.log(`${timestamp} [${name}] ${level}: ${message}`);
}

export const logger = {
  info: (message: unknown) => log("INFO", "app", message),
  warning: (message: unknown) => log("WARNING", "app", message),
  error: (message: unknown) => log("ERROR", "app", message),
  debug: (message: unknown) => log("DEBUG", "app", message),
};
