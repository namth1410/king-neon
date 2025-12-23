import { useCallback, useRef } from "react";
import { AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Custom hook that provides API request methods with automatic abort handling.
 * When a new request is made, any pending request with the same key is automatically aborted.
 *
 * @example
 * ```tsx
 * const { request, abortAll } = useApiRequest();
 *
 * // In useEffect for fetching data
 * useEffect(() => {
 *   const fetchData = async () => {
 *     const response = await request('products', () =>
 *       api.get('/products', { params: { search } })
 *     );
 *     if (response) {
 *       setProducts(response.data);
 *     }
 *   };
 *   fetchData();
 *   return () => abortAll(); // Cleanup on unmount
 * }, [search]);
 * ```
 */
export function useApiRequest() {
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const requestIdsRef = useRef<Map<string, number>>(new Map());

  /**
   * Make an API request with automatic abort handling
   * @param key - Unique key to identify this request type (used for aborting previous requests)
   * @param requestFn - Function that makes the API call, receives an AbortSignal
   * @returns Promise that resolves to the response, or null if aborted
   */
  const request = useCallback(
    async <T = unknown>(
      key: string,
      requestFn: (signal: AbortSignal) => Promise<AxiosResponse<T>>
    ): Promise<AxiosResponse<T> | null> => {
      // Generate unique request ID for race condition detection
      const requestId = Date.now() + Math.random();
      requestIdsRef.current.set(key, requestId);

      // Abort any existing request with the same key
      const existingController = abortControllersRef.current.get(key);
      if (existingController) {
        existingController.abort();
        abortControllersRef.current.delete(key);
      }

      // Create new abort controller
      const controller = new AbortController();
      abortControllersRef.current.set(key, controller);

      try {
        const response = await requestFn(controller.signal);

        // Check if this request is still the current one (race condition check)
        if (requestIdsRef.current.get(key) !== requestId) {
          // A newer request has been made, discard this response
          return null;
        }

        // Clean up on success
        abortControllersRef.current.delete(key);
        return response;
      } catch (error: unknown) {
        // Always clean up the controller on error
        abortControllersRef.current.delete(key);

        // Don't throw if request was aborted
        if (error instanceof Error && error.name === "AbortError") {
          return null;
        }
        // Check if it's an axios cancel error
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code: string }).code === "ERR_CANCELED"
        ) {
          return null;
        }
        // Check if a newer request superseded this one
        if (requestIdsRef.current.get(key) !== requestId) {
          return null;
        }
        // Rethrow other errors
        throw error;
      }
    },
    []
  );

  /**
   * Abort all pending requests - useful for cleanup on unmount
   */
  const abortAll = useCallback(() => {
    abortControllersRef.current.forEach((controller) => {
      controller.abort();
    });
    abortControllersRef.current.clear();
    requestIdsRef.current.clear();
  }, []);

  /**
   * Abort a specific request by key
   */
  const abort = useCallback((key: string) => {
    const controller = abortControllersRef.current.get(key);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(key);
    }
    requestIdsRef.current.delete(key);
  }, []);

  return { request, abort, abortAll };
}

/**
 * Helper to add abort signal to axios config
 */
export function withSignal(
  signal: AbortSignal,
  config?: AxiosRequestConfig
): AxiosRequestConfig {
  return { ...config, signal };
}

export default useApiRequest;
