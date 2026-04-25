import { useEffect, useState } from 'react';
import SevaForm from '../components/SevaForm';
import { createSeva, deleteSeva, getSevas, updateSeva } from '../services/api';
import { getErrorMessage } from '../utils/errorMessage';

function SevaPage() {
  const [sevas, setSevas] = useState([]);
  const [editingSeva, setEditingSeva] = useState(null);
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
      const response = editingSeva?.seva_id
        ? await updateSeva({ ...payload, seva_id: editingSeva.seva_id })
        : await createSeva(payload);

      if (!response.data?.success) {
        setError(response.data?.message || 'Unable to save seva.');
        return;
      }
      setEditingSeva(null);
      await loadSevas();
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Unable to save seva.'));
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (sevaId) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this seva?');
    if (!shouldDelete) return;

    setLoading(true);
    setError('');
    try {
      const response = await deleteSeva(sevaId);
      if (!response.data?.success) {
        setError(response.data?.message || 'Unable to delete seva.');
        return;
      }
      if (editingSeva?.seva_id === sevaId) {
        setEditingSeva(null);
      }
      await loadSevas();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Unable to delete seva.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <SevaForm onSubmit={onSubmit} loading={loading} initialData={editingSeva} onCancel={() => setEditingSeva(null)} />
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Seva List</h2>
        <div className="space-y-2 pt-3">
          {sevas.map((seva) => (
            <article className="rounded-lg bg-slate-50 p-3" key={seva.seva_id}>
              <p className="font-medium">{seva.seva_name}</p>
              <p className="text-sm">{seva.start_time} - {seva.end_time}</p>
              <p className="text-xs text-slate-500">Days: {seva.recurrence_days}</p>
              <div className="mt-3 flex gap-2">
                <button className="rounded border px-3 py-1 text-sm" disabled={loading} onClick={() => setEditingSeva(seva)} type="button">Edit</button>
                <button className="rounded border border-red-400 px-3 py-1 text-sm text-red-700" disabled={loading} onClick={() => onDelete(seva.seva_id)} type="button">Delete</button>
              </div>
            </article>
          ))}
          {sevas.length === 0 && <p className="text-sm text-slate-500">No sevas found.</p>}
        </div>
      </div>
    </section>
  );
}

export default SevaPage;
