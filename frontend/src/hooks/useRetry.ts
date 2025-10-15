import { useState, useCallback } from 'react'

interface UseRetryOptions {
  maxRetries?: number
  delay?: number
  onRetry?: () => void
}

export function useRetry(options: UseRetryOptions = {}) {
  const { maxRetries = 3, delay = 1000, onRetry } = options
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const retry = useCallback(async (fn: () => Promise<any> | any) => {
    setIsRetrying(true)
    
    try {
      const result = await fn()
      setRetryCount(0)
      setIsRetrying(false)
      return result
    } catch (error) {
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1)
        onRetry?.()
        
        await new Promise(resolve => setTimeout(resolve, delay))
        return retry(fn)
      } else {
        setIsRetrying(false)
        throw error
      }
    }
  }, [retryCount, maxRetries, delay, onRetry])

  const reset = useCallback(() => {
    setRetryCount(0)
    setIsRetrying(false)
  }, [])

  return {
    retry,
    reset,
    retryCount,
    isRetrying,
    canRetry: retryCount < maxRetries
  }
}
