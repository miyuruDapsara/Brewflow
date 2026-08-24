import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import { getErrorMessage } from '../utils/errorHandler';

export default function useFetch(url, { enabled = true, method = 'get' } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled && url));

  const refetch = useCallback(async () => {
    if (!url) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiRequest({ method, url });
      setData(result);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, method]);

  useEffect(() => {
    if (!enabled || !url) {
      setLoading(false);
      return;
    }

    refetch().catch(() => {});
  }, [enabled, url, refetch]);

  return { data, error, loading, refetch };
}
