import { useEffect, useState } from 'react';
import {
  getBoard,
  getOrder,
  pressAction,
  refreshPrediction,
  reassignRider,
  createOrder,
} from './api';
import Header from './components/Header';
import OrderList from './components/OrderList';
import RouteMap from './components/RouteMap';
import OrderDetail from './components/OrderDetail';
import NewOrderForm from './components/NewOrderForm';

export default function App() {
  const [board, setBoard] = useState(null);
  const [selectedRef, setSelectedRef] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    getBoard()
      .then((b) => {
        setBoard(b);
        setSelectedRef(b.orders[0]?.orderRef ?? null);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selectedRef) return;
    setDetail(null);
    getOrder(selectedRef).then(setDetail).catch((e) => setError(e.message));
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

  const handleCreate = (payload) =>
    run(async () => {
      const created = await createOrder(payload);
      setBoard(await getBoard());
      setShowNew(false);
      setSelectedRef(created.orderRef);
    });

  if (!board) {
    return error ? (
      <p className="error">Error: {error}. Kya backend chal raha hai (port 5000)?</p>
    ) : (
      <p className="loading">Loading dispatch board...</p>
    );
  }

  // Dropdown ke liye unique rider names
  const riders = [...new Set(board.orders.map((o) => o.rider))].sort();

  return (
    <>
      <Header board={board} />

      <div className="toolbar">
        <button className="btn" onClick={() => setShowNew((v) => !v)}>
          {showNew ? 'Cancel' : '+ New order'}
        </button>
      </div>

      {showNew && <NewOrderForm onCreate={handleCreate} busy={busy} />}
      {error && <p className="banner">{error}</p>}

      <main className="grid">
        <OrderList
          orders={board.orders}
          selectedRef={selectedRef}
          onSelect={setSelectedRef}
        />
        <RouteMap
          board={board}
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