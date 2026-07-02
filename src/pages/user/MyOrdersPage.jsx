import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService, productService } from '../../api/services';
import Spinner from '../../components/common/Spinner';

const STATUS_COLORS = {
  Processing:         { bg: '#fef9c3', text: '#854d0e', dot: '#eab308' },
  Shipped:            { bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6' },
  'Out for Delivery': { bg: '#ede9fe', text: '#6d28d9', dot: '#8b5cf6' },
  Delivered:          { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
};

const STATUS_ORDER = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function MyOrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  useEffect(() => {
    orderService.getMyOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--gray-50)' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--gray-100)', padding: '32px 0' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, letterSpacing: '-1px' }}>My Orders</h1>
          <p style={{ color: 'var(--gray-400)', fontSize: 14, marginTop: 4 }}>Track and manage your purchases</p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner /></div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No orders yet</h2>
            <p style={{ color: 'var(--gray-400)', marginBottom: 24 }}>Your order history will appear here</p>
            <button onClick={() => navigate('/shop')} style={{ padding: '12px 28px', borderRadius: 10, background: 'linear-gradient(135deg,var(--blue-700),var(--blue-500))', color: '#fff', fontWeight: 700, fontSize: 15 }}>Start Shopping →</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map((order, i) => {
              const colors    = STATUS_COLORS[order.status] || STATUS_COLORS.Processing;
              const firstItem = order.products?.[0];
              const currentIdx = STATUS_ORDER.indexOf(order.status);

              return (
                <div key={order._id}
                  onClick={() => navigate(`/orders/track/${order._id}`)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue-200)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-100)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1.5px solid var(--gray-100)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'all var(--transition-base)', animation: `fadeUp .35s ${i * 0.05}s ease both` }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', background: 'var(--blue-50)', flexShrink: 0 }}>
                        {firstItem?.imageFilename ? (
                          <img src={productService.getImage(firstItem.imageFilename)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>👟</div>
                        )}
                      </div>
                      <div>
                        <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: 'var(--blue-700)', background: 'var(--blue-50)', padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginBottom: 6 }}>#{order._id.slice(-8).toUpperCase()}</span>
                        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                          {firstItem?.name}
                          {order.products.length > 1 && <span style={{ fontSize: 13, color: 'var(--gray-400)', marginLeft: 6 }}>+{order.products.length - 1} more</span>}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.products.length} item{order.products.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: colors.bg }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: colors.dot }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{order.status}</span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--blue-700)' }}>₹{order.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: 16, display: 'flex', gap: 4 }}>
                    {STATUS_ORDER.map((s, idx) => (
                      <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: idx <= currentIdx ? 'var(--blue-500)' : 'var(--gray-200)', transition: 'background var(--transition-base)' }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--blue-600)', fontWeight: 600 }}>Track Order →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}