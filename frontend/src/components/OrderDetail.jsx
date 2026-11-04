import { useState } from 'react';
import EtaBar from './EtaBar';
import WhyPanel from './WhyPanel';
import AssistantChat from './AssistantChat';
import { fmt, duration, LEVEL_WORD } from '../utils/time';

export default function OrderDetail({ detail, busy, onAction, onRefresh }) {
  const [tab, setTab] = useState('why');

  if (!detail) {
    return (
      <section className="detail">
        <p className="loading">Loading order...</p>
      </section>
    );
  }

  const late = detail.mid - detail.promised;

  return (
    <section className="detail" aria-live="polite">
      <h2>{detail.id} in {detail.area}</h2>
      <p className="meta">
        Rider {detail.rider} has {detail.load} open orders. Cash on delivery {detail.amount}.
      </p>

      <p className={`verdict ${detail.level}`}>
        {LEVEL_WORD[detail.level]} risk: {detail.prob}% chance this order is late
      </p>
      <p className="eta-sum">
        Most likely arrival {fmt(detail.mid)}, about {duration(late)}{' '}
        {late > 0 ? 'after' : 'before'} the promised time.
      </p>

      <EtaBar d={detail} />

      <button className="btn ghost" onClick={onRefresh} disabled={busy}>
        {busy ? 'Refreshing...' : 'Refresh prediction'}
      </button>

      <div className="tabs" role="tablist">
        <button
          className="tab"
          role="tab"
          aria-selected={tab === 'why'}
          onClick={() => setTab('why')}
        >
          Why and what to do
        </button>
        <button
          className="tab"
          role="tab"
          aria-selected={tab === 'chat'}
          onClick={() => setTab('chat')}
        >
          Ask assistant
        </button>
      </div>

      {tab === 'why' ? (
        <WhyPanel d={detail} onAction={onAction} />
      ) : (
        <AssistantChat key={detail.orderRef} selectedRef={detail.orderRef} />
      )}
    </section>
  );
}