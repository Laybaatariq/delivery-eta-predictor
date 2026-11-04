import { useState } from 'react';

const AREAS = [
  'Saddar',
  'North Nazimabad',
  'Gulshan-e-Iqbal',
  'Korangi',
  'DHA Phase 6',
  'Clifton',
  'Nazimabad',
  'Malir',
];

// Karachi ki aaj ki date, YYYY-MM-DD format mein
const todayKarachi = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });

const EMPTY = {
  orderRef: '',
  area: AREAS[0],
  distanceKm: '',
  paymentType: 'COD',
  amountPKR: '',
  riderName: '',
  promisedTime: '20:00',
};

export default function NewOrderForm({ onCreate, busy }) {
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState('');

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  function submit(e) {
    e.preventDefault();

    if (!form.orderRef.trim() || !form.riderName.trim()) {
      setFormError('Order ID aur rider name zaroori hain.');
      return;
    }
    if (!(Number(form.distanceKm) > 0)) {
      setFormError('Distance 0 se zyada honi chahiye.');
      return;
    }
    if (!(Number(form.amountPKR) > 0)) {
      setFormError('Amount 0 se zyada hona chahiye.');
      return;
    }

    setFormError('');
    onCreate({
      orderRef: form.orderRef.trim(),
      area: form.area,
      distanceKm: Number(form.distanceKm),
      paymentType: form.paymentType,
      amountPKR: Number(form.amountPKR),
      riderName: form.riderName.trim(),
      promisedAt: new Date(`${todayKarachi()}T${form.promisedTime}:00+05:00`).toISOString(),
    });
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-grid">
        <label>
          Order ID
          <input value={form.orderRef} onChange={set('orderRef')} placeholder="PK-5001" />
        </label>

        <label>
          Area
          <select value={form.area} onChange={set('area')}>
            {AREAS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>

        <label>
          Distance (km)
          <input type="number" step="0.1" min="0" value={form.distanceKm} onChange={set('distanceKm')} />
        </label>

        <label>
          Payment
          <select value={form.paymentType} onChange={set('paymentType')}>
            <option value="COD">COD</option>
            <option value="PREPAID">Prepaid</option>
          </select>
        </label>

        <label>
          Amount (PKR)
          <input type="number" min="0" value={form.amountPKR} onChange={set('amountPKR')} />
        </label>

        <label>
          Rider name
          <input value={form.riderName} onChange={set('riderName')} placeholder="Hamza R." />
        </label>

        <label>
          Promised time
          <input type="time" value={form.promisedTime} onChange={set('promisedTime')} />
        </label>
      </div>

      <div className="form-actions">
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Saving...' : 'Create order'}
        </button>
        {formError && <span className="form-error">{formError}</span>}
      </div>
    </form>
  );
}