import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../api/services';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const STATUS_STEPS  = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
const STATUS_COLORS = {
  Processing:         { bg: '#fef9c3', text: '#854d0e', dot: '#eab308' },
  Shipped:            { bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6' },
  'Out for Delivery': { bg: '#ede9fe', text: '#6d28d9', dot: '#8b5cf6' },
  Delivered:          { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
};

export default function OwnerDashboard() {
  const navigate              = useNavigate();
  const [data, setData]       = useState({ orders: [], analytics: {} });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating]   = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchData = () => {
    orderService.getAllOrders()
      .then(({ data: res }) => setData({ orders: res.orders, analytics: res.analytics }))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await orderService.updateStatus(orderId, { status });
      toast.success(`Status updated to "${status}"`);
      setData(prev => ({ ...prev, orders: prev.orders.map(o => o._id === orderId ? { ...o, status } : o) }));
    } catch { toast.error('Update failed. Try again.'); }
    finally { setUpdating(null); }
  };

  const nextStatus = (current) => {
    const idx = STATUS_STEPS.indexOf(current);
    return idx < STATUS_STEPS.length - 1 ? STATUS_STEPS[idx + 1] : null;
  };

  if (loading) return <div style={{ paddingTop: 68, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><Spinner /></div>;

  const { orders, analytics } = data;

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,var(--blue-950),var(--blue-800))', padding: '36px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Owner Portal</p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>Dashboard</h1>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => navigate('/owner/add-product')} style={{ padding: '11px 22px', borderRadius: 10, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', fontWeight: 600, fontSize: 14 }}>+ Add Product</button>
              <button onClick={() => navigate('/owner/inventory')} style={{ padding: '11px 22px', borderRadius: 10, background: '#fff', color: 'var(--blue-700)', fontWeight: 700, fontSize: 14 }}>Inventory →</button>
            </div>
          </div>

          {/* Analytics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginTop: 28 }}>
            {[
              { label: 'Total Revenue', value: `₹${(analytics.totalRevenue || 0).toLocaleString()}`, icon: '💰' },
              { label: 'Shoes Sold',    value: analytics.totalSold || 0,   icon: '👟' },
              { label: 'Total Orders',  value: orders.length,              icon: '📦' },
              { label: 'Pending',       value: orders.filter(o => o.status === 'Processing').length, icon: '⏳' },
            ].map(card => (
              <div key={card.label} style={{ background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: '#fff' }}>{card.value}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{card.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>All Orders</h2>
          <button onClick={fetchData} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--gray-200)', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', background: '#fff' }}>↺ Refresh</button>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 16, border: '1px solid var(--gray-100)' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
            <p style={{ fontWeight: 600, color: 'var(--gray-600)' }}>No orders yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((order, i) => {
              const colors     = STATUS_COLORS[order.status] || STATUS_COLORS.Processing;
              const next       = nextStatus(order.status);
              const isExpanded = expandedId === order._id;

              return (
                <div key={order._id} style={{ background: '#fff', borderRadius: 14, border: '1.5px solid var(--gray-100)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', animation: `fadeUp .3s ${i * 0.04}s ease both` }}>
                  {/* Row */}
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : order._id)}>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: 'var(--blue-600)', background: 'var(--blue-50)', padding: '3px 8px', borderRadius: 4, flexShrink: 0 }}>#{order._id.slice(-8).toUpperCase()}</span>
                    <div style={{ flex: '1 1 150px', minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{order.user?.name || 'Customer'}</p>
                      <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{order.user?.email}</p>
                    </div>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 16 }}>{order.products?.length}</p>
                      <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>items</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--blue-700)' }}>₹{order.totalPrice?.toLocaleString()}</p>
                      <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: colors.bg, flexShrink: 0 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: colors.dot }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: colors.text, whiteSpace: 'nowrap' }}>{order.status}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--gray-400)', transition: 'transform var(--transition-fast)', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▼</span>
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--gray-100)', padding: '16px 20px', background: 'var(--gray-50)', animation: 'fadeUp .2s ease' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Items</p>
                          {order.products?.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 10px', background: '#fff', borderRadius: 8, marginBottom: 6 }}>
                              <span style={{ fontWeight: 500 }}>{item.name || item.product?.name}</span>
                              <span style={{ color: 'var(--blue-600)', fontWeight: 700 }}>₹{(item.price || item.product?.price)?.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Ship To</p>
                          <div style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>
                            <p style={{ fontWeight: 600, marginBottom: 4 }}>{order.shippingAddress?.fullName}</p>
                            <p style={{ color: 'var(--gray-500)', lineHeight: 1.6 }}>{order.shippingAddress?.street}, {order.shippingAddress?.city}<br />{order.shippingAddress?.state} — {order.shippingAddress?.pincode}</p>
                            <p style={{ color: 'var(--gray-400)', fontSize: 12, marginTop: 4 }}>📞 {order.shippingAddress?.phone}</p>
                          </div>
                        </div>
                      </div>

                      {/* Status Control Hub */}
                      <div style={{ paddingTop: 14, borderTop: '1px solid var(--gray-200)' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Update Status</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          {STATUS_STEPS.map((s) => {
                            const currentIdx = STATUS_STEPS.indexOf(order.status);
                            const stepIdx    = STATUS_STEPS.indexOf(s);
                            const isActive   = order.status === s;
                            const isPast     = stepIdx < currentIdx;
                            const isFuture   = stepIdx > currentIdx + 1;
                            return (
                              <button key={s} onClick={() => !isActive && !isFuture && updateStatus(order._id, s)}
                                disabled={isActive || isFuture || updating === order._id}
                                style={{
                                  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                                  background: isActive ? 'linear-gradient(135deg,var(--blue-700),var(--blue-500))' : isPast ? 'var(--blue-50)' : '#fff',
                                  color: isActive ? '#fff' : isPast ? 'var(--blue-600)' : 'var(--gray-300)',
                                  border: `1.5px solid ${isActive ? 'transparent' : isPast ? 'var(--blue-200)' : 'var(--gray-200)'}`,
                                  cursor: isFuture || isActive ? 'not-allowed' : 'pointer',
                                  opacity: isFuture ? 0.4 : 1,
                                  boxShadow: isActive ? 'var(--shadow-blue)' : 'none',
                                  transition: 'all var(--transition-fast)',
                                }}>
                                {(isActive || isPast) && '✓ '}{s}
                              </button>
                            );
                          })}
                          {next && (
                            <button onClick={() => updateStatus(order._id, next)} disabled={updating === order._id}
                              style={{ marginLeft: 'auto', padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: 'var(--gray-900)', color: '#fff', opacity: updating === order._id ? 0.6 : 1 }}>
                              {updating === order._id ? 'Updating...' : `→ Mark as "${next}"`}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}