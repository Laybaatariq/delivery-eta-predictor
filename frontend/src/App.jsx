import { useEffect, useState } from 'react';
import {
  getBoard,
  getOrder,
  getRoute,
  getWeather,
  pressAction,
  refreshPrediction,
  reassignRider,
  simulateOrder,
} from './api';
import Header from './components/Header';
import OrderList from './components/OrderList';
import RouteMap from './components/RouteMap';
import OrderDetail from './components/OrderDetail';

const WEATHER_REFRESH_MS = 10 * 60 * 1000;

export default function App() {
  const [board, setBoard] = useState(null);
  const [weather, setWeather] = useState([]);
  const [selectedRef, setSelectedRef] = useState(null);
  const [detail, setDetail] = useState(null);
  const [route, setRoute] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getBoard()
      .then((b) => {
        setBoard(b);
        setSelectedRef(b.orders[0]?.orderRef ?? null);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    const load = () => getWeather().then((r) => setWeather(r.areas)).catch(() => {});
    load();
    const id = setInterval(load, WEATHER_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  // Order badalne par purane response ignore hon
  useEffect(() => {
    if (!selectedRef) return;
    let active = true;
    setDetail(null);
    setRoute(null);

    getOrder(selectedRef)
      .then((d) => active && setDetail(d))
      .catch((e) => active && setError(e.message));

    // Route fail ho to map seedhi line dikhayega
    getRoute(selectedRef)
      .then((r) => active && setRoute(r))
      .catch(() => active && setRoute(null));

    return () => {
      active = false;
    };
  }, [selectedRef]);

  async function run(task) {
    setBusy(true);
    setError('');
    try {
      await task();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const handleAction = (index) =>
    run(async () => setDetail(await pressAction(selectedRef, index)));

  const handleRefresh = () =>
    run(async () => {
      setDetail(await refreshPrediction(selectedRef));
      setBoard(await getBoard());
    });

  const handleReassign = (riderName) =>
    run(async () => {
      setDetail(await reassignRider(selectedRef, riderName));
      setBoard(await getBoard());
    });

  const handleSimulate = () =>
    run(async () => {
      const created = await simulateOrder();
      setBoard(await getBoard());
      setSelectedRef(created.orderRef);
    });

  if (!board) {
    return error ? (
      <p className="error">Error: {error}. Kya backend chal raha hai (port 5000)?</p>
    ) : (
      <p className="loading">Loading dispatch board...</p>
    );
  }

  const riders = [...new Set(board.orders.map((o) => o.rider))].sort();

  return (
    <>
      <Header board={board} />

      <div className="toolbar">
        <button className="btn" onClick={handleSimulate} disabled={busy}>
          {busy ? 'Working...' : 'Simulate incoming order'}
        </button>
      </div>

      {error && <p className="banner">{error}</p>}

      <main className="grid">
        <OrderList
          orders={board.orders}
          selectedRef={selectedRef}
          onSelect={setSelectedRef}
        />
        <RouteMap
          board={board}
          weather={weather}
          route={route}
          selectedRef={selectedRef}
          onSelect={setSelectedRef}
        />
        <OrderDetail
          detail={detail}
          busy={busy}
          riders={riders}
          onAction={handleAction}
          onRefresh={handleRefresh}
          onReassign={handleReassign}
        />
      </main>
    </>
  );
}