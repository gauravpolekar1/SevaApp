import { useEffect, useState } from 'react';
import SevaForm from '../components/SevaForm';
import { createSeva, getSevas } from '../services/api';

function SevaPage() {
  const [sevas, setSevas] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSevas = async () => {
    try {
      const response = await getSevas();
      setSevas(response.data.data || []);
    } catch (error) {
      setSevas([]);
    }
  };

  useEffect(() => {
    loadSevas();
  }, []);

  const onSubmit = async (payload) => {
    setLoading(true);
    try {
      await createSeva(payload);
      await loadSevas();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <SevaForm onSubmit={onSubmit} loading={loading} />
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
