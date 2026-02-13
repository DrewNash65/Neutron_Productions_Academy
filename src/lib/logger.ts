type LogLevel = "info" | "warn" | "error";

function write(level: LogLevel, message: string, metadata?: Record<string, unknown>) {
  const payload = {
    level,
    message,
    metadata: metadata ?? {},
    timestamp: new Date().toISOString(),
  };

  if (level === "error") {
    console.error(JSON.stringify(payload));
    return;
  }

  if (level === "warn") {
    console.warn(JSON.stringify(payload));
    return;
  }

  console.log(JSON.stringify(payload));
}

export function logInfo(message: string, metadata?: Record<string, unknown>) {
  write("info", message, metadata);
}

export function logWarn(message: string, metadata?: Record<string, unknown>) {
  write("warn", message, metadata);
}

export function logError(message: string, metadata?: Record<string, unknown>) {
  write("error", message, metadata);
}
