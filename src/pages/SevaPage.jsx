import { useEffect, useState } from 'react';
import SevaForm from '../components/SevaForm';
import { createSeva, getSevas } from '../services/api';
import { getErrorMessage } from '../utils/errorMessage';

function SevaPage() {
  const [sevas, setSevas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSevas = async () => {
    try {
      const response = await getSevas();
      setSevas(response.data.data || []);
      setError('');
    } catch (loadError) {
      setSevas([]);
      setError(getErrorMessage(loadError, 'Unable to load sevas from backend.'));
    }
  };

  useEffect(() => {
    loadSevas();
  }, []);

  const onSubmit = async (payload) => {
    setLoading(true);
    setError('');
    try {
      const response = await createSeva(payload);
      if (!response.data?.success) {
        setError(response.data?.message || 'Unable to create seva.');
        return;
      }
      await loadSevas();
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Unable to create seva.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <SevaForm onSubmit={onSubmit} loading={loading} />
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Seva List</h2>
        <div className="space-y-2 pt-3">
          {sevas.map((seva) => (
            <article className="rounded-lg bg-slate-50 p-3" key={seva.seva_id}>
              <p className="font-medium">{seva.seva_name}</p>
              <p className="text-sm">{seva.start_time} - {seva.end_time}</p>
              <p className="text-xs text-slate-500">Days: {seva.recurrence_days}</p>
            </article>
          ))}
          {sevas.length === 0 && <p className="text-sm text-slate-500">No sevas found.</p>}
        </div>
      </div>
    </section>
  );
}

export default SevaPage;
