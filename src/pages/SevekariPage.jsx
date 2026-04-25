import { useEffect, useState } from 'react';
import SevekariForm from '../components/SevekariForm';
import { createSevekari, deleteSevekari, getSevekari, updateSevekari } from '../services/api';
import { getErrorMessage } from '../utils/errorMessage';

function SevekariPage() {
  const [sevekari, setSevekari] = useState([]);
  const [editingSevekari, setEditingSevekari] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSevekari = async () => {
    try {
      const response = await getSevekari();
      setSevekari(response.data.data || []);
      setError('');
    } catch (loadError) {
      setSevekari([]);
      setError(getErrorMessage(loadError, 'Unable to load sevekari from backend.'));
    }
  };

  useEffect(() => {
    loadSevekari();
  }, []);

  const onSubmit = async (payload) => {
    setLoading(true);
    setError('');
    try {
      const response = editingSevekari?.sevekari_id
        ? await updateSevekari({ ...payload, sevekari_id: editingSevekari.sevekari_id })
        : await createSevekari(payload);

      if (!response.data?.success) {
        setError(response.data?.message || 'Unable to save sevekari.');
        return;
      }
      setEditingSevekari(null);
      await loadSevekari();
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Unable to save sevekari.'));
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (sevekariId) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this sevekari?');
    if (!shouldDelete) return;

    setLoading(true);
    setError('');
    try {
      const response = await deleteSevekari(sevekariId);
      if (!response.data?.success) {
        setError(response.data?.message || 'Unable to delete sevekari.');
        return;
      }
      if (editingSevekari?.sevekari_id === sevekariId) {
        setEditingSevekari(null);
      }
      await loadSevekari();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Unable to delete sevekari.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <SevekariForm onSubmit={onSubmit} loading={loading} initialData={editingSevekari} onCancel={() => setEditingSevekari(null)} />
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Sevekari List</h2>
        <div className="space-y-2 pt-3">
          {sevekari.map((person) => (
            <article className="rounded-lg bg-slate-50 p-3" key={person.sevekari_id}>
              <p className="font-medium">{person.name}</p>
              <p className="text-sm">{person.phone} · {person.email}</p>
              <p className="text-xs text-slate-500">Available: {person.availability_days}</p>
              <div className="mt-3 flex gap-2">
                <button className="rounded border px-3 py-1 text-sm" disabled={loading} onClick={() => setEditingSevekari(person)} type="button">Edit</button>
                <button className="rounded border border-red-400 px-3 py-1 text-sm text-red-700" disabled={loading} onClick={() => onDelete(person.sevekari_id)} type="button">Delete</button>
              </div>
            </article>
          ))}
          {sevekari.length === 0 && <p className="text-sm text-slate-500">No volunteers found.</p>}
        </div>
      </div>
    </section>
  );
}

export default SevekariPage;
