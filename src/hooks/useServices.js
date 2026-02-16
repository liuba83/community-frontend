import { useState, useEffect } from 'react';
import { fetchServices } from '../services/api';

export function useServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchServices();
        if (!cancelled) {
          setServices(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { services, loading, error, refetch: () => {
    setLoading(true);
    fetchServices().then(setServices).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }};
}
