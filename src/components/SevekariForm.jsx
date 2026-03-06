import { useState } from 'react';

const initialState = {
  name: '',
  phone: '',
  email: '',
  availability_days: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
  notes: '',
};

function SevekariForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState(initialState);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(formData);
    setFormData(initialState);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border p-4">
      <h2 className="text-lg font-semibold">Add Sevekari</h2>
      <input className="w-full rounded border p-3" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
      <input className="w-full rounded border p-3" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
      <input className="w-full rounded border p-3" type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
      <input className="w-full rounded border p-3" placeholder="Availability days" value={formData.availability_days} onChange={(e) => setFormData({ ...formData, availability_days: e.target.value })} />
      <textarea className="w-full rounded border p-3" placeholder="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
      <button className="w-full rounded bg-orange-600 p-3 font-medium text-white" disabled={loading} type="submit">{loading ? 'Saving...' : 'Save Sevekari'}</button>
    </form>
  );
}

export default SevekariForm;
