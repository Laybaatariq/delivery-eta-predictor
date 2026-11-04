export default function Header({ board }) {
  const { kpis } = board;
  return (
    <header className="top">
      <div>
        <h1>Dispatch board</h1>
        <p>{board.subtitle}</p>
      </div>
      <dl className="kpis">
        <div>
          <dt>On time today</dt>
          <dd>{kpis.onTimePct}%</dd>
        </div>
        <div>
          <dt>Orders at risk now</dt>
          <dd>{kpis.ordersAtRisk}</dd>
        </div>
        <div>
          <dt>Average ETA error</dt>
          <dd>{kpis.avgEtaErrorMin} min</dd>
        </div>
      </dl>
    </header>
  );
}