export default function WhyPanel({ d, onAction }) {
  const reasons = [...d.reasons].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

  return (
    <>
      <h3>What is driving the risk</h3>
      <div className="shap-key">
        <span>Pushes toward on time</span>
        <span>Pushes toward late</span>
      </div>
      <ul className="shap">
        {reasons.map(([label, impact]) => (
          <li key={label}>
            <span>{label}</span>
            <span className="bar">
              <span
                className={`fill ${impact > 0 ? 'pos' : 'neg'}`}
                style={{ width: `${Math.min(50, (Math.abs(impact) / 0.35) * 50)}%` }}
              />
            </span>
            <span className="val">
              {impact > 0 ? '+' : '−'}
              {Math.abs(impact).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <h3>What to do</h3>
      <div className="why">
        <p>{d.why}</p>
        <div className="sources">
          {d.sources.map((s) => (
            <span key={s} className="src">{s}</span>
          ))}
        </div>

        {d.actions.length ? (
          <div className="actions">
            {d.actions.map((label, i) => (
              <button
                key={label}
                className={`btn ${d.actionsDone[i] ? 'done' : ''}`}
                disabled={d.actionsDone[i]}
                onClick={() => onAction(i)}
              >
                {d.actionsDone[i] ? `Requested: ${label}` : label}
              </button>
            ))}
          </div>
        ) : (
          <p className="none">No action needed right now.</p>
        )}
      </div>
    </>
  );
}