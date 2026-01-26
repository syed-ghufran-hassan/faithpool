import { useState, useCallback, useEffect, useRef } from 'react';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  status: AsyncStatus;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
}

export interface UseAsyncReturn<T, Args extends unknown[] = []> extends AsyncState<T> {
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for managing async operations with loading, error, and success states
 * 
 * @param asyncFn - The async function to execute
 * @param options - Configuration options
 * @returns Async state and execute function
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error, execute } = useAsync(
 *   async (circleId: number) => fetchCircle(circleId)
 * );
 * 
 * // Execute manually
 * <button onClick={() => execute(1)}>Load Circle</button>
 * 
 * // With immediate execution
 * const { data, isLoading } = useAsync(fetchCircles, { immediate: true });
 * ```
 */
export function useAsync<T, Args extends unknown[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
  options: {
    immediate?: boolean;
    args?: Args;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
): UseAsyncReturn<T, Args> {
  const { immediate = false, args = [] as unknown as Args, onSuccess, onError } = options;
  
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    status: 'idle',
    isLoading: false,
    isSuccess: false,
    isError: false,
    isIdle: true,
  });

  const mountedRef = useRef(true);

  const execute = useCallback(
    async (...executeArgs: Args): Promise<T | null> => {
      setState({
        data: null,
        error: null,
        status: 'loading',
        isLoading: true,
        isSuccess: false,
        isError: false,
        isIdle: false,
      });

      try {
        const data = await asyncFn(...executeArgs);
        
        if (mountedRef.current) {
          setState({
            data,
            error: null,
            status: 'success',
            isLoading: false,
            isSuccess: true,
            isError: false,
            isIdle: false,
          });
          onSuccess?.(data);
        }
        
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        if (mountedRef.current) {
          setState({
            data: null,
            error,
            status: 'error',
            isLoading: false,
            isSuccess: false,
            isError: true,
            isIdle: false,
          });
          onError?.(error);
        }
        
        return null;
      }
    },
    [asyncFn, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      status: 'idle',
      isLoading: false,
      isSuccess: false,
      isError: false,
      isIdle: true,
    });
  }, []);

  // Execute immediately if specified
  useEffect(() => {
    if (immediate) {
      execute(...args);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for retrying failed async operations
 * 
 * @param asyncFn - The async function to execute
 * @param options - Retry configuration
 * 
 * @example
 * ```tsx
 * const { data, isLoading, retry, retryCount } = useAsyncRetry(
 *   fetchData,
 *   { maxRetries: 3, retryDelay: 1000 }
 * );
 * ```
 */
export function useAsyncRetry<T>(
  asyncFn: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number) => void;
  } = {}
) {
  const { maxRetries = 3, retryDelay = 1000, onRetry } = options;
  const [retryCount, setRetryCount] = useState(0);
  
  const asyncState = useAsync(asyncFn);

  const retry = useCallback(async () => {
    if (retryCount >= maxRetries) return null;
    
    setRetryCount(prev => prev + 1);
    onRetry?.(retryCount + 1);
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    
    return asyncState.execute();
  }, [retryCount, maxRetries, retryDelay, onRetry, asyncState]);

  const resetRetry = useCallback(() => {
    setRetryCount(0);
    asyncState.reset();
  }, [asyncState]);

  return {
    ...asyncState,
    retry,
    retryCount,
    canRetry: retryCount < maxRetries,
    resetRetry,
  };
}

/**
 * Hook for mutation operations (POST, PUT, DELETE)
 * 
 * @param mutationFn - The mutation function
 * 
 * @example
 * ```tsx
 * const { mutate, isLoading } = useMutation(
 *   async (data: CreateCircleData) => createCircle(data)
 * );
 * 
 * const handleSubmit = async () => {
 *   const result = await mutate(formData);
 *   if (result) navigate('/circles');
 * };
 * ```
 */
export function useMutation<T, Args extends unknown[] = []>(
  mutationFn: (...args: Args) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
  } = {}
) {
  const { onSuccess, onError, onSettled } = options;
  
  const asyncState = useAsync(mutationFn, { onSuccess, onError });

  const mutate = useCallback(
    async (...args: Args): Promise<T | null> => {
      const result = await asyncState.execute(...args);
      onSettled?.();
      return result;
    },
    [asyncState, onSettled]
  );

  return {
    ...asyncState,
    mutate,
  };
}

export default useAsync;
