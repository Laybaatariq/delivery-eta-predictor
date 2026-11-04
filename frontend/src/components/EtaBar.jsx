import { fmt, toPct } from '../utils/time';

const TICKS = [18, 19, 20, 21, 22];

export default function EtaBar({ d }) {
  const level = d.level;
  return (
    <>
      <div
        className="eta"
        role="img"
        aria-label={`Predicted arrival between ${fmt(d.lo)} and ${fmt(d.hi)}, promised ${fmt(d.promised)}`}
      >
        <div className="track" />
        {TICKS.map((h) => (
          <span key={h} className="tick" style={{ left: `${toPct(h * 60)}%` }}>
            {fmt(h * 60).replace(':00 ', ' ')}
          </span>
        ))}
        <div
          className={`band ${level}`}
          style={{ left: `${toPct(d.lo)}%`, width: `${toPct(d.hi) - toPct(d.lo)}%` }}
        />
        <div className="mid" style={{ left: `${toPct(d.mid)}%` }} />
        <div className="prom" style={{ left: `${toPct(d.promised)}%` }} />
        <span className="prom-l" style={{ left: `${toPct(d.promised)}%` }}>
          Promised {fmt(d.promised)}
        </span>
      </div>

      <div className="eta-legend">
        <span><i className={`sw-band ${level}`} />Predicted arrival range</span>
        <span><i className="sw-mid" />Most likely</span>
        <span><i className="sw-prom" />Promised time</span>
      </div>
    </>
  );
}