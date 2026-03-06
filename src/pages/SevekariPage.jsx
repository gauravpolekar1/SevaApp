import { useEffect, useState } from 'react';
import SevekariForm from '../components/SevekariForm';
import { createSevekari, getSevekari } from '../services/api';

function SevekariPage() {
  const [sevekari, setSevekari] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSevekari = async () => {
    try {
      const response = await getSevekari();
      setSevekari(response.data.data || []);
    } catch (error) {
      setSevekari([]);
    }
  };

  useEffect(() => {
    loadSevekari();
  }, []);

  const onSubmit = async (payload) => {
    setLoading(true);
    try {
      await createSevekari(payload);
      await loadSevekari();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <SevekariForm onSubmit={onSubmit} loading={loading} />
      <div className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Sevekari List</h2>
        <div className="space-y-2 pt-3">
          {sevekari.map((person) => (
            <article className="rounded-lg bg-slate-50 p-3" key={person.sevekari_id}>
              <p className="font-medium">{person.name}</p>
              <p className="text-sm">{person.phone} · {person.email}</p>
              <p className="text-xs text-slate-500">Available: {person.availability_days}</p>
            </article>
          ))}
          {sevekari.length === 0 && <p className="text-sm text-slate-500">No volunteers found.</p>}
        </div>
      </div>
    </section>
  );
}

export default SevekariPage;
