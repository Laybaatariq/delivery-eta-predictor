const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const getBoard = () => request('/dashboard/board');

export const getOrder = (ref) => request(`/orders/${ref}`);

export const pressAction = (ref, index) =>
  request(`/orders/${ref}/actions/${index}`, { method: 'POST' });

export const refreshPrediction = (ref) =>
  request(`/predictions/${ref}`, { method: 'POST' });

export const askAssistant = (question, selectedRef) =>
  request('/assistant/ask', {
    method: 'POST',
    body: JSON.stringify({ question, selectedRef }),
  })

export const createOrder = (body) =>
  request('/orders', { method: 'POST', body: JSON.stringify(body) });

export const reassignRider = (ref, riderName) =>
  request(`/orders/${ref}/reassign`, {
    method: 'POST',
    body: JSON.stringify({ riderName }),
  });