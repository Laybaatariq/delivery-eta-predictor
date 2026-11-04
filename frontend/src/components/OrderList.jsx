import { useState } from 'react';
import { fmt } from '../utils/time';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High risk' },
  { value: 'med', label: 'Moderate' },
  { value: 'low', label: 'Low' },
];

export default function OrderList({ orders, selectedRef, onSelect }) {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');

  const q = query.trim().toLowerCase();
  const visible = orders.filter((o) => {
    const matchText =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.area.toLowerCase().includes(q) ||
      o.rider.toLowerCase().includes(q);
    const matchLevel = level === 'all' || o.level === level;
    return matchText && matchLevel;
  });

  return (
    <section className="queue">
      <h2>Orders by delay risk</h2>

      <input
        className="search"
        type="search"
        placeholder="Search order, area or rider"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search orders"
      />

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`filter ${level === f.value ? 'on' : ''}`}
            onClick={() => setLevel(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="count">
        {visible.length} of {orders.length} orders
      </p>

      <ul>
        {visible.map((o) => (
          <li key={o.orderRef}>
            <button
              className={`row ${o.level}`}
              aria-pressed={o.orderRef === selectedRef}
              onClick={() => onSelect(o.orderRef)}
            >
              <div className="l1">
                <span>{o.id}</span>
                <span className={`chip ${o.level}`}>{o.prob}% late risk</span>
              </div>
              <div className="l2">{o.area}</div>
              <div className="l2">Promised {fmt(o.promised)}</div>
            </button>
          </li>
        ))}
      </ul>

      {visible.length === 0 && <p className="none">No orders match.</p>}
    </section>
  );
}