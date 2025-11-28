/**
 * Retry utility for database operations with exponential backoff
 * Helps handle connection timeouts on Supabase FREE tier
 */

interface RetryOptions {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 100,
  maxDelay: 2000,
  backoffMultiplier: 2
}

/**
 * Execute a database operation with automatic retry on connection errors
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options }
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error

      // Check if it's a connection error that we should retry
      const isConnectionError =
        error?.code === 'P1001' || // Can't reach database server
        error?.code === 'P2024' || // Timed out fetching a new connection
        error?.message?.includes("Can't reach database") ||
        error?.message?.includes('timed out') ||
        error?.message?.includes('Connection terminated')

      if (!isConnectionError || attempt >= opts.maxAttempts) {
        // Not a connection error or out of retries, throw immediately
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelay
      )

      console.warn(
        `Database connection error (attempt ${attempt}/${opts.maxAttempts}), ` +
        `retrying in ${delay}ms...`,
        error.message
      )

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Retry failed')
}
