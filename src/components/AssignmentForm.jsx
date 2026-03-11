import { useState } from 'react';
import DayPicker from './DayPicker';

const initialState = {
  seva_id: '',
  sevekari_id: '',
  start_date: '',
  end_date: '',
  recurrence_type: 'weekly',
  recurrence_days: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
};

function AssignmentForm({ sevas, sevekari, onSubmit, loading }) {
  const [formData, setFormData] = useState(initialState);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(formData);
    setFormData(initialState);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border p-4">
      <h2 className="text-lg font-semibold">Assign Seva</h2>
      <select className="w-full rounded border p-3" value={formData.seva_id} onChange={(e) => setFormData({ ...formData, seva_id: e.target.value })} required>
        <option value="">Select Seva</option>
        {sevas.map((seva) => (
          <option key={seva.seva_id} value={seva.seva_id}>{seva.seva_name}</option>
        ))}
      </select>
      <select className="w-full rounded border p-3" value={formData.sevekari_id} onChange={(e) => setFormData({ ...formData, sevekari_id: e.target.value })} required>
        <option value="">Select Sevekari</option>
        {sevekari.map((person) => (
          <option key={person.sevekari_id} value={person.sevekari_id}>{person.name}</option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input className="rounded border p-3" type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required />
        <input className="rounded border p-3" type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} required />
      </div>
      <DayPicker
        label="Recurrence days"
        required
        value={formData.recurrence_days}
        onChange={(recurrence_days) => setFormData({ ...formData, recurrence_days })}
      />
      <button className="w-full rounded bg-orange-600 p-3 font-medium text-white" disabled={loading} type="submit">{loading ? 'Assigning...' : 'Assign Seva'}</button>
    </form>
  );
}

export default AssignmentForm;
