import { Injectable, LoggerService } from '@nestjs/common';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export interface LogContext {
  service?: string;
  method?: string;
  userId?: string;
  requestId?: string;
  correlationId?: string;
  [key: string]: any;
}

@Injectable()
export class AppLogger implements LoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = this.context ? `[${this.context}]` : '';
    const additionalContext = context ? ` ${JSON.stringify(context)}` : '';

    return `${timestamp} ${level.toUpperCase()} ${contextStr} ${message}${additionalContext}`;
  }

  log(message: string, context?: LogContext) {
    console.log(this.formatMessage(LogLevel.INFO, message, context));
  }

  error(message: string, trace?: string, context?: LogContext) {
    console.error(this.formatMessage(LogLevel.ERROR, message, context));
    if (trace) {
      console.error(`Trace: ${trace}`);
    }
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage(LogLevel.WARN, message, context));
  }

  debug(message: string, context?: LogContext) {
    console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
  }

  verbose(message: string, context?: LogContext) {
    console.log(this.formatMessage(LogLevel.VERBOSE, message, context));
  }

  // Specialized logging methods for different scenarios
  logHttpRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LogContext,
  ) {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `${method} ${url} - ${statusCode} (${duration}ms)`;
    console.log(this.formatMessage(level, message, context));
  }

  logServiceCall(
    serviceName: string,
    method: string,
    statusCode: number,
    duration: number,
    context?: LogContext,
  ) {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `Service call: ${serviceName}.${method} - ${statusCode} (${duration}ms)`;
    console.log(this.formatMessage(level, message, context));
  }

  logError(error: any, context?: LogContext) {
    const message = error.message || 'Unknown error occurred';
    const trace = error.stack;
    this.error(message, trace, context);
  }
}
