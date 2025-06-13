interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  data?: unknown
  duration?: number
  source?: string
}

interface LoggerOptions {
  minLevel: 'info' | 'warn' | 'error' | 'debug'
  maxEntries?: number
  persistLogs?: boolean
}

class Logger {
  private logs: LogEntry[] = []
  private readonly minLevel: string
  private readonly maxEntries?: number
  private readonly persistLogs: boolean

  constructor(options: LoggerOptions) {
    this.minLevel = options.minLevel
    this.maxEntries = options.maxEntries
    this.persistLogs = options.persistLogs || false
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.minLevel)
  }

  private addLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return

    this.logs.push(entry)
    
    if (this.maxEntries && this.logs.length > this.maxEntries) {
      this.logs = this.logs.slice(-this.maxEntries)
    }

    if (this.persistLogs) {
      this.persistLog(entry)
    }

    // In development, also log to console
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = entry.level === 'error' ? 'error' : 
                           entry.level === 'warn' ? 'warn' : 
                           entry.level === 'debug' ? 'debug' : 'log'
      
      console[consoleMethod](
        `[${entry.timestamp}] ${entry.level.toUpperCase()} ${entry.source ? `(${entry.source})` : ''}: ${entry.message}`,
        entry.data || '',
        entry.duration ? `(${entry.duration}ms)` : ''
      )
    }
  }

  private persistLog(entry: LogEntry): void {
    try {
      const existingLogs = localStorage.getItem('app_logs')
      const logs = existingLogs ? JSON.parse(existingLogs) : []
      logs.push(entry)
      localStorage.setItem('app_logs', JSON.stringify(logs))
    } catch (error) {
      console.error('Failed to persist log:', error)
    }
  }

  info(message: string, data?: unknown, source?: string): void {
    this.addLog({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      data,
      source
    })
  }

  warn(message: string, data?: unknown, source?: string): void {
    this.addLog({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      data,
      source
    })
  }

  error(message: string, data?: unknown, source?: string): void {
    this.addLog({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      data,
      source
    })
  }

  debug(message: string, data?: unknown, source?: string): void {
    this.addLog({
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      data,
      source
    })
  }

  logApiCall(method: string, url: string, duration: number, status: number, error?: unknown): void {
    const level = status >= 400 ? 'error' : 'info'
    const message = `${method} ${url} - ${status}`
    
    this.addLog({
      timestamp: new Date().toISOString(),
      level,
      message,
      data: { method, url, status, error },
      duration,
      source: 'api'
    })
  }

  getLogs(level?: string): LogEntry[] {
    return level ? this.logs.filter(log => log.level === level) : this.logs
  }

  clearLogs(): void {
    this.logs = []
    if (this.persistLogs) {
      localStorage.removeItem('app_logs')
    }
  }
}

// Create logger instances for different purposes
export const apiLogger = new Logger({
  minLevel: 'info',
  maxEntries: 1000,
  persistLogs: true
})

export const authLogger = new Logger({
  minLevel: 'warn',
  maxEntries: 500,
  persistLogs: true
})

export const performanceLogger = new Logger({
  minLevel: 'info',
  maxEntries: 200,
  persistLogs: false
})

// Helper function to measure execution time
export async function measureExecutionTime<T>(
  fn: () => Promise<T>,
  logger: Logger,
  operation: string
): Promise<T> {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = performance.now() - start
    logger.info(`Operation completed: ${operation}`, { duration }, 'performance')
    return result
  } catch (error) {
    const duration = performance.now() - start
    logger.error(`Operation failed: ${operation}`, { error, duration }, 'performance')
    throw error
  }
} 
