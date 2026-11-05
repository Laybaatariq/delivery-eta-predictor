import axios from 'axios';
import { BOARD } from '../config/board.js';
import { pinFor } from '../config/areas.js';

const TTL_MS = 10 * 60 * 1000;
const cache = new Map();

// Hub se order tak sadak ka route. OSRM [lng,lat] deta hai, hum [lat,lng] mein badalte hain.
export async function getRoadRoute(orderRef, area) {
  const hit = cache.get(orderRef);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;

  const dest = pinFor(orderRef, area);
  const { hub } = BOARD;
  const url = `https://router.project-osrm.org/route/v1/driving/${hub.lng},${hub.lat};${dest.lng},${dest.lat}`;

  const { data } = await axios.get(url, {
    params: { overview: 'full', geometries: 'geojson' },
    timeout: 6000,
  });

  const r = data.routes?.[0];
  if (!r) throw new Error('No road route found');

  const result = {
    distanceKm: Math.round(r.distance / 100) / 10,
    durationMin: Math.round(r.duration / 60),
    path: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
  };

  cache.set(orderRef, { at: Date.now(), data: result });
  return result;
}