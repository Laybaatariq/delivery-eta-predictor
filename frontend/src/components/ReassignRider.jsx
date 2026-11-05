import { useState } from 'react';

export default function ReassignRider({ currentRider, riders, busy, onReassign }) {
  const others = riders.filter((r) => r !== currentRider);
  const [picked, setPicked] = useState('');

  const value = others.includes(picked) ? picked : others[0] ?? '';

  if (!others.length) return null;

  return (
    <div className="reassign">
      <label>
        Reassign to
        <select value={value} onChange={(e) => setPicked(e.target.value)}>
          {others.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>
      <button className="btn" disabled={busy || !value} onClick={() => onReassign(value)}>
        Reassign
      </button>
    </div>
  );
}