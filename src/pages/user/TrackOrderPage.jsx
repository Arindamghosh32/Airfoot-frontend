import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService, productService } from '../../api/services';
import Spinner from '../../components/common/Spinner';

const TIMELINE_STEPS = [
  { key: 'Processing',       icon: '📋', label: 'Order Confirmed',  desc: 'Your order has been placed and is being prepared.' },
  { key: 'Shipped',          icon: '📦', label: 'Shipped',           desc: 'Your sneakers are on their way!' },
  { key: 'Out for Delivery', icon: '🚚', label: 'Out for Delivery',  desc: 'Almost there — out for delivery in your area.' },
  { key: 'Delivered',        icon: '🎉', label: 'Delivered',         desc: 'Package delivered. Enjoy your new kicks!' },
];
const STATUS_ORDER = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function TrackOrderPage() {
  const { id }            = useParams();
  const navigate          = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrderById(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      orderService.getOrderById(id).then(({ data }) => setOrder(data.order)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div style={{ paddingTop: 68, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><Spinner /></div>;
  if (!order) return null;

  const currentIdx  = STATUS_ORDER.indexOf(order.status);
  const isDelivered = order.status === 'Delivered';

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--gray-50)' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--gray-100)', padding: '28px 0' }}>
        <div className="container">
          <button onClick={() => navigate('/orders')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--blue-600)', fontWeight: 600, marginBottom: 12 }}>← Back to Orders</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Track Order</h1>
              <p style={{ fontSize: 13, color: 'var(--gray-400)', fontFamily: 'monospace', fontWeight: 600 }}>#{order._id.slice(-12).toUpperCase()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 4 }}>Estimated Delivery</p>
              <p style={{ fontWeight: 700, color: 'var(--gray-700)', fontSize: 15 }}>
                {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'start' }}>

          {/* Left — Timeline */}
          <div>
            {/* Status card */}
            <div style={{
              background: isDelivered ? 'linear-gradient(135deg,#064e3b,#059669)' : 'linear-gradient(135deg,var(--blue-900),var(--blue-600))',
              borderRadius: 20, padding: '28px 32px', marginBottom: 24, color: '#fff',
              boxShadow: isDelivered ? '0 8px 32px rgba(5,150,105,.3)' : 'var(--shadow-blue)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 12, opacity: .65, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 6 }}>Current Status</p>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>
                    {TIMELINE_STEPS[currentIdx]?.icon} {order.status}
                  </h2>
                  <p style={{ opacity: .7, marginTop: 6, fontSize: 14 }}>{TIMELINE_STEPS[currentIdx]?.desc}</p>
                </div>
                <div style={{ position: 'relative', width: 80, height: 80 }}>
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="6" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="6"
                      strokeDasharray={`${(213.6 * (currentIdx + 1)) / 4} 213.6`}
                      strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dasharray 1s ease' }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15 }}>{currentIdx + 1}/4</div>
                </div>
              </div>
            </div>

            {/* Timeline steps */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginBottom: 24 }}>Shipment Timeline</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {TIMELINE_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentIdx;
                  const isCurrent   = idx === currentIdx;
                  const histEntry   = order.statusHistory?.filter(h => h.status === step.key).at(-1);
                  return (
                    <div key={step.key} style={{ display: 'flex', gap: 20, position: 'relative' }}>
                      {idx < TIMELINE_STEPS.length - 1 && (
                        <div style={{ position: 'absolute', left: 19, top: 44, bottom: 0, width: 2, borderRadius: 1, background: idx < currentIdx ? 'var(--blue-400)' : 'var(--gray-200)', transition: 'background 1s ease' }} />
                      )}
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, zIndex: 1,
                        background: isCompleted ? 'linear-gradient(135deg,var(--blue-700),var(--blue-500))' : 'var(--gray-100)',
                        boxShadow: isCurrent ? 'var(--shadow-blue)' : 'none',
                        transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all .5s ease',
                      }}>
                        {isCompleted ? (isCurrent ? step.icon : '✓') : <span style={{ opacity: .3 }}>{step.icon}</span>}
                      </div>
                      <div style={{ flex: 1, paddingBottom: idx < TIMELINE_STEPS.length - 1 ? 28 : 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
                          <p style={{ fontWeight: isCurrent ? 700 : isCompleted ? 600 : 400, fontSize: 15, color: isCompleted ? 'var(--gray-900)' : 'var(--gray-400)' }}>{step.label}</p>
                          {histEntry && (
                            <span style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'monospace' }}>
                              {new Date(histEntry.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {new Date(histEntry.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: isCompleted ? 'var(--gray-500)' : 'var(--gray-300)', marginTop: 2 }}>
                          {histEntry?.note || step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right — Order summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Items */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Items Ordered</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {order.products.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 10, background: 'var(--gray-50)', borderRadius: 10 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', background: 'var(--blue-50)', flexShrink: 0 }}>
                      {item.imageFilename ? <img src={productService.getImage(item.imageFilename)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👟</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>{item.brand} · UK {item.size}</p>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--blue-700)', flexShrink: 0 }}>₹{item.price?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Price Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--gray-500)' }}>
                  <span>Subtotal</span><span>₹{order.originalPrice?.toLocaleString()}</span>
                </div>
                {order.couponApplied?.code && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#059669' }}>
                    <span>🏷️ {order.couponApplied.code} ({order.couponApplied.discountPercent}% off)</span>
                    <span>−₹{order.couponApplied.discountAmount?.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Total Paid</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--blue-700)' }}>₹{order.totalPrice?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Address */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Delivery Address</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--blue-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue-500)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{order.shippingAddress?.fullName}</p>
                  <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6 }}>
                    {order.shippingAddress?.street}<br />
                    {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                    {order.shippingAddress?.pincode} · {order.shippingAddress?.country}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>📞 {order.shippingAddress?.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}