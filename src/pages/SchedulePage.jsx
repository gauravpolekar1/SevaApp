import { useEffect, useState } from 'react';
import AssignmentForm from '../components/AssignmentForm';
import CalendarView from '../components/CalendarView';
import { assignSeva, getSchedule, getSevas, getSevekari } from '../services/api';
import { getErrorMessage } from '../utils/errorMessage';

function SchedulePage() {
  const [sevas, setSevas] = useState([]);
  const [sevekari, setSevekari] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [sevaRes, sevekariRes, scheduleRes] = await Promise.all([getSevas(), getSevekari(), getSchedule()]);
      setSevas(sevaRes.data.data || []);
      setSevekari(sevekariRes.data.data || []);
      setSchedule(scheduleRes.data.data || []);
      setError('');
    } catch (loadError) {
      setSevas([]);
      setSevekari([]);
      setSchedule([]);
      setError(getErrorMessage(loadError, 'Unable to load scheduling data from backend.'));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (payload) => {
    setLoading(true);
    setError('');
    try {
      const response = await assignSeva(payload);
      if (!response.data.success) {
        setError(response.data.message || 'Unable to assign seva.');
        return;
      }
      await loadData();
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Unable to assign seva.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <AssignmentForm sevas={sevas} sevekari={sevekari} onSubmit={onSubmit} loading={loading} />
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <CalendarView schedule={schedule} />
    </section>
  );
}

export default SchedulePage;
