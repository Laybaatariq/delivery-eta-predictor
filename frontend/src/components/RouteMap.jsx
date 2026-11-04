const riderPosition = (hub, o) => {
  const l1 = Math.abs(o.x - hub.x);
  const l2 = Math.abs(o.y - hub.y);
  const d = o.prog * (l1 + l2);
  if (d <= l1) return { x: hub.x + Math.sign(o.x - hub.x) * d, y: hub.y };
  return { x: o.x, y: hub.y + Math.sign(o.y - hub.y) * (d - l1) };
};

const routePath = (hub, o) =>
  `M${hub.x} ${hub.y} L${o.x} ${hub.y} L${o.x} ${o.y}`;

export default function RouteMap({ board, selectedRef, onSelect }) {
  const { hub, canvas, orders, weather } = board;
  const selected = orders.find((o) => o.orderRef === selectedRef);

  return (
    <section className="mapwrap">
      <h2>Live routes</h2>
      <div className="mapscroll">
        <svg
          className="map"
          viewBox={`0 0 ${canvas.width} ${canvas.height}`}
          role="img"
          aria-label="Delivery routes from the central hub"
        >
          <rect className="land" width={canvas.width} height={canvas.height} />

          <g>
            <path className="road" d="M0 120 H600" />
            <path className="road" d="M0 220 H600" />
            <path className="road" d="M0 290 H600" />
            <path className="road" d="M180 0 V340" />
            <path className="road" d="M300 0 V350" />
            <path className="road" d="M420 0 V350" />
            <path className="road" d="M540 0 V330" />
          </g>
          <path className="water" d="M0 335 C120 355 220 395 330 377 C440 361 520 405 600 385 L600 420 L0 420 Z" />
          <text className="sea" x="24" y="408">Arabian Sea</text>

          {orders.map((o) => (
            <path key={`r-${o.orderRef}`} className="route" d={routePath(hub, o)} />
          ))}

          {selected && (
            <path
              key={`sel-${selected.orderRef}`}
              className={`route-sel ${selected.level}`}
              d={routePath(hub, selected)}
              pathLength={1}
            />
          )}

          {orders.map((o) => {
            const on = o.orderRef === selectedRef;
            const p = riderPosition(hub, o);
            return (
              <g key={o.orderRef} onClick={() => onSelect(o.orderRef)} style={{ cursor: 'pointer' }}>
                <circle className={`pin ${o.level}`} cx={o.x} cy={o.y} r={on ? 12 : 9} />
                <text className="lbl" x={o.x + 16} y={o.y + 4}>{o.area}</text>
                <circle className="rider" cx={p.x} cy={p.y} r={on ? 6 : 4.5} />
              </g>
            );
          })}

          <rect className="hub" x={hub.x - 9} y={hub.y - 9} width="18" height="18" rx="3" />
          <text className="lbl" x={hub.x + 16} y={hub.y - 6}>{hub.name}</text>
        </svg>
      </div>

      <div className="maplegend">
        <span><i className="dot high" />High risk</span>
        <span><i className="dot med" />Moderate</span>
        <span><i className="dot low" />Low</span>
        <span><i className="dot rider-dot" />Rider position</span>
      </div>
      <p className="weather">{weather}</p>
    </section>
  );
}