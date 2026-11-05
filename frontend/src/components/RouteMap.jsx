import { Fragment, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Circle,
  Tooltip,
  useMap,
} from 'react-leaflet';
import WeatherPanel from './WeatherPanel';

const COLORS = { high: '#DC2626', med: '#B45309', low: '#15803D' };
const RAIN = '#2563EB';
const INK = '#111827';

const lerp = (a, b, t) => ({
  lat: a.lat + (b.lat - a.lat) * t,
  lng: a.lng + (b.lng - a.lng) * t,
});

function FitOnce({ points }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (!done.current && points.length) {
      map.fitBounds(points, { padding: [40, 40] });
      done.current = true;
    }
  }, [map, points]);
  return null;
}

export default function RouteMap({ board, weather, route, selectedRef, onSelect }) {
  const { hub, orders } = board;
  const hubPt = { lat: hub.lat, lng: hub.lng };
  const fitPoints = [[hub.lat, hub.lng], ...orders.map((o) => [o.lat, o.lng])];
  const selected = orders.find((o) => o.orderRef === selectedRef);

  // Sadak ka route agar mil gaya, warna seedhi line
  const selectedPath = selected
    ? route?.path?.length
      ? route.path
      : [[hub.lat, hub.lng], [selected.lat, selected.lng]]
    : null;

  return (
    <section className="mapwrap">
      <div className="map-head">
        <h2>Live routes</h2>
        {route && (
          <span className="route-meta">
            {route.distanceKm} km · about {route.durationMin} min by road
          </span>
        )}
      </div>

      <MapContainer
        center={[hub.lat, hub.lng]}
        zoom={12}
        className="leaflet-map"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        <FitOnce points={fitPoints} />

        {weather
          .filter((w) => w.raining)
          .map((w) => (
            <Circle
              key={w.area}
              center={[w.lat, w.lng]}
              radius={2500}
              pathOptions={{ color: RAIN, fillColor: RAIN, fillOpacity: 0.12, weight: 1 }}
            >
              <Tooltip>{w.area}: {w.description}, {w.tempC} °C</Tooltip>
            </Circle>
          ))}

        {orders.map((o) =>
          o.orderRef === selectedRef ? null : (
            <Polyline
              key={`r-${o.orderRef}`}
              positions={[[hub.lat, hub.lng], [o.lat, o.lng]]}
              pathOptions={{ color: '#9CA3AF', weight: 2, opacity: 0.5 }}
            />
          )
        )}

        {selected && (
          <Polyline
            key={`sel-${selected.orderRef}-${route ? 'road' : 'line'}`}
            positions={selectedPath}
            pathOptions={{ color: COLORS[selected.level], weight: 5, opacity: 0.9 }}
          />
        )}

        {orders.map((o) => {
          const on = o.orderRef === selectedRef;
          const rider = lerp(hubPt, o, o.prog);
          return (
            <Fragment key={o.orderRef}>
              <CircleMarker
                center={[o.lat, o.lng]}
                radius={on ? 12 : 9}
                pathOptions={{ color: '#FFFFFF', weight: 2, fillColor: COLORS[o.level], fillOpacity: 1 }}
                eventHandlers={{ click: () => onSelect(o.orderRef) }}
              >
                <Tooltip>{o.id} · {o.area} · {o.prob}% late risk</Tooltip>
              </CircleMarker>

              <CircleMarker
                center={[rider.lat, rider.lng]}
                radius={on ? 6 : 4.5}
                pathOptions={{ color: '#FFFFFF', weight: 2, fillColor: INK, fillOpacity: 1 }}
              />
            </Fragment>
          );
        })}

        <CircleMarker
          center={[hub.lat, hub.lng]}
          radius={8}
          pathOptions={{ color: '#FFFFFF', weight: 2, fillColor: INK, fillOpacity: 1 }}
        >
          <Tooltip permanent direction="top">{hub.name}</Tooltip>
        </CircleMarker>
      </MapContainer>

      <div className="maplegend">
        <span><i className="dot high" />High risk</span>
        <span><i className="dot med" />Moderate</span>
        <span><i className="dot low" />Low</span>
        <span><i className="dot rider-dot" />Rider position</span>
        <span><i className="dot rain-dot" />Rain</span>
      </div>

      <WeatherPanel weather={weather} />
    </section>
  );
}