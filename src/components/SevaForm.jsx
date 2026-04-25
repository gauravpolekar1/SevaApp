import { useEffect, useState } from 'react';
import DayPicker from './DayPicker';

const initialState = {
  seva_name: '',
  description: '',
  start_time: '',
  end_time: '',
  recurrence_type: 'weekly',
  recurrence_days: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
};

function SevaForm({ onSubmit, loading, initialData = null, onCancel }) {
  const [formData, setFormData] = useState(initialState);
  const isEditMode = Boolean(initialData?.seva_id);

  useEffect(() => {
    if (isEditMode) {
      setFormData({ ...initialState, ...initialData });
      return;
    }
    setFormData(initialState);
  }, [initialData, isEditMode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(formData);
    if (!isEditMode) {
      setFormData(initialState);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border p-4">
      <h2 className="text-lg font-semibold">{isEditMode ? 'Edit Seva' : 'Create Seva'}</h2>
      <input className="w-full rounded border p-3" placeholder="Seva name" value={formData.seva_name} onChange={(e) => setFormData({ ...formData, seva_name: e.target.value })} required />
      <textarea className="w-full rounded border p-3" placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
      <div className="grid grid-cols-2 gap-2">
        <input className="rounded border p-3" type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} required />
        <input className="rounded border p-3" type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} required />
      </div>
      <DayPicker
        label="Recurrence days"
        required
        value={formData.recurrence_days}
        onChange={(recurrence_days) => setFormData({ ...formData, recurrence_days })}
      />
      <div className="flex gap-2">
        <button className="w-full rounded bg-orange-600 p-3 font-medium text-white" disabled={loading} type="submit">
          {loading ? 'Saving...' : isEditMode ? 'Update Seva' : 'Save Seva'}
        </button>
        {isEditMode && (
          <button className="rounded border px-4" disabled={loading} onClick={onCancel} type="button">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default SevaForm;
