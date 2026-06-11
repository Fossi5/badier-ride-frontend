import { useState, useEffect, useCallback } from 'react';

export function useAsync(asyncFn, deps = [], refreshInterval = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setError(null);
    try {
      const result = await asyncFn();
      setData(result.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    execute();
    if (refreshInterval) {
      const id = setInterval(execute, refreshInterval);
      return () => clearInterval(id);
    }
  }, [execute, refreshInterval]);

  return { data, loading, error, refetch: execute };
}
