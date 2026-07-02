import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../api/services';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const STEPS = ['Shipping', 'Review', 'Payment'];
const initialAddress = { fullName: '', phone: '', street: '', city: '', state: '', pincode: '', country: 'India' };

export default function CheckoutPanel({ onClose }) {
  const { items, total, clearCart } = useCart();
  const { user }                    = useAuth();
  const navigate                    = useNavigate();
  const [step, setStep]             = useState(0);
  const [address, setAddress]       = useState(initialAddress);
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [placing, setPlacing]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [orderId, setOrderId]       = useState(null);
  const [errors, setErrors]         = useState({});

  const finalTotal = couponData ? couponData.finalTotal : total;

  const validateStep0 = () => {
    const e = {};
    if (!address.fullName.trim()) e.fullName = 'Required';
    if (!/^\d{10}$/.test(address.phone)) e.phone = 'Valid 10-digit number required';
    if (!address.street.trim()) e.street = 'Required';
    if (!address.city.trim()) e.city = 'Required';
    if (!address.state.trim()) e.state = 'Required';
    if (!/^\d{6}$/.test(address.pincode)) e.pincode = '6-digit pincode required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await orderService.validateCoupon({ couponCode, cartTotal: total });
      setCouponData(data);
      toast.success(`${data.discountPercent}% discount applied!`);
    } catch (err) {
      setCouponData(null);
      toast.error(err.response?.data?.message || 'Invalid promo code');
    } finally {
      setCouponLoading(false);
    }
  };

  const placeOrder = async () => {
    if (!user) { toast.error('Please log in first'); return; }
    setPlacing(true);
    try {
      const { data } = await orderService.placeOrder({
        productIds: items.map((i) => i._id),
        selectedSizes: items.map((i) => i.selectedSize),
        shippingAddress: address,
        couponCode: couponData?.code || null,
      });
      setOrderId(data.order._id);
      clearCart();
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Try again.');
    } finally {
      setPlacing(false);
    }
  };

  const Field = ({ label, name, placeholder, type = 'text', half }) => (
    <div style={{ flex: half ? '0 0 calc(50% - 6px)' : '1 1 100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <input
        type={type} placeholder={placeholder} value={address[name]}
        onChange={(e) => { setAddress(p => ({ ...p, [name]: e.target.value })); setErrors(p => ({ ...p, [name]: '' })); }}
        style={{
          padding: '11px 14px', borderRadius: 8, fontSize: 14,
          border: `1.5px solid ${errors[name] ? 'var(--error)' : 'var(--gray-200)'}`,
          background: errors[name] ? '#fff5f5' : '#fff', outline: 'none',
        }}
      />
      {errors[name] && <span style={{ fontSize: 11, color: 'var(--error)', fontWeight: 500 }}>{errors[name]}</span>}
    </div>
  );

  return (
    <>
      <div onClick={success ? undefined : onClose} style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(10,15,46,.5)', backdropFilter: 'blur(6px)',
        animation: 'fadeIn .2s ease',
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', zIndex: 1201,
        transform: 'translate(-50%,-50%)',
        width: 540, maxWidth: '96vw', maxHeight: '92vh',
        background: '#fff', borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,.18)',
        display: 'flex', flexDirection: 'column',
        animation: 'scaleIn .25s ease', overflow: 'hidden',
      }}>
        {success ? (
          <SuccessScreen orderId={orderId} onClose={onClose} navigate={navigate} />
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '24px 28px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>Checkout</h2>
                  <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
                    {items.length} item{items.length !== 1 ? 's' : ''} · ₹{finalTotal.toLocaleString()}
                  </p>
                </div>
                <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gray-100)', color: 'var(--gray-500)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              {/* Step indicator */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}>
                {STEPS.map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', fontSize: 13, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: i < step ? 'var(--blue-600)' : i === step ? 'linear-gradient(135deg,var(--blue-700),var(--blue-500))' : 'var(--gray-100)',
                        color: i <= step ? '#fff' : 'var(--gray-400)',
                        boxShadow: i === step ? 'var(--shadow-blue)' : 'none',
                        transition: 'all var(--transition-base)',
                      }}>
                        {i < step ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: i === step ? 'var(--blue-600)' : 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ flex: 1, height: 2, margin: '0 8px', marginBottom: 18, background: i < step ? 'var(--blue-500)' : 'var(--gray-200)', transition: 'background var(--transition-base)' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
              {/* STEP 0 — Shipping */}
              {step === 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, animation: 'fadeUp .2s ease' }}>
                  <Field label="Full Name" name="fullName" placeholder="John Doe" />
                  <Field label="Phone" name="phone" placeholder="9876543210" half />
                  <Field label="Pincode" name="pincode" placeholder="400001" half />
                  <Field label="Street Address" name="street" placeholder="42, MG Road" />
                  <Field label="City" name="city" placeholder="Mumbai" half />
                  <Field label="State" name="state" placeholder="Maharashtra" half />
                </div>
              )}

              {/* STEP 1 — Review */}
              {step === 1 && (
                <div style={{ animation: 'fadeUp .2s ease' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Order Items</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                    {items.map((item) => (
                      <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 10, border: '1px solid var(--gray-100)' }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{item.brand} · Size {item.selectedSize}</p>
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--blue-600)' }}>₹{item.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '12px 14px', background: 'var(--blue-50)', borderRadius: 10, marginBottom: 20 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-700)', textTransform: 'uppercase', marginBottom: 6 }}>Delivering to</p>
                    <p style={{ fontSize: 14, fontWeight: 500 }}>{address.fullName}</p>
                    <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>{address.street}, {address.city}, {address.state} — {address.pincode}</p>
                  </div>

                  {/* Promo */}
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Promo Code</p>
                    {couponData ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#ecfdf5', borderRadius: 10, border: '1.5px solid #6ee7b7' }}>
                        <span style={{ fontWeight: 700, color: '#059669' }}>🎉 {couponData.code} — {couponData.discountPercent}% off (−₹{couponData.discountAmount.toLocaleString()})</span>
                        <button onClick={() => { setCouponData(null); setCouponCode(''); }} style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Remove</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                          placeholder="AIRFOOT20"
                          style={{ flex: 1, padding: '11px 14px', borderRadius: 8, border: '1.5px solid var(--gray-200)', fontSize: 14, fontWeight: 600, letterSpacing: '0.05em', outline: 'none', textTransform: 'uppercase' }}
                        />
                        <button onClick={applyCoupon} disabled={couponLoading} style={{ padding: '11px 18px', borderRadius: 8, background: 'var(--gray-900)', color: '#fff', fontWeight: 600, fontSize: 14, opacity: couponLoading ? 0.6 : 1 }}>
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                    )}
                    <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 6 }}>Try: AIRFOOT20 · SOLE10 · KICK15</p>
                  </div>

                  {/* Price */}
                  <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>Subtotal</span>
                      <span style={{ fontWeight: 500 }}>₹{total.toLocaleString()}</span>
                    </div>
                    {couponData && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ color: '#059669', fontSize: 14 }}>Discount</span>
                        <span style={{ fontWeight: 500, color: '#059669' }}>−₹{couponData.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--gray-100)' }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
                      <span style={{ fontWeight: 800, fontSize: 20, fontFamily: 'var(--font-display)', color: 'var(--blue-600)' }}>₹{finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 — Payment */}
              {step === 2 && (
                <div style={{ animation: 'fadeUp .2s ease' }}>
                  <div style={{ padding: '16px 20px', background: 'var(--blue-50)', borderRadius: 12, border: '1px solid var(--blue-100)', marginBottom: 20 }}>
                    <p style={{ fontWeight: 700, color: 'var(--blue-800)', fontSize: 14 }}>🔒 Simulated Secure Payment</p>
                    <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>This is a demo checkout. No real payment is processed.</p>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg,var(--blue-800),var(--blue-600))', borderRadius: 16, padding: 24, color: '#fff', marginBottom: 20, boxShadow: 'var(--shadow-blue)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>AirFoot</span>
                      <svg width="40" height="26" viewBox="0 0 40 26"><circle cx="15" cy="13" r="12" fill="rgba(255,255,255,.4)"/><circle cx="25" cy="13" r="12" fill="rgba(255,255,255,.2)"/></svg>
                    </div>
                    <p style={{ fontSize: 18, letterSpacing: '0.2em', fontFamily: 'monospace', marginBottom: 20 }}>•••• •••• •••• 4242</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div><p style={{ fontSize: 10, opacity: .6, marginBottom: 2 }}>CARD HOLDER</p><p style={{ fontSize: 14, fontWeight: 600 }}>{user?.name}</p></div>
                      <div><p style={{ fontSize: 10, opacity: .6, marginBottom: 2 }}>EXPIRES</p><p style={{ fontSize: 14, fontWeight: 600 }}>12/28</p></div>
                      <div><p style={{ fontSize: 10, opacity: .6, marginBottom: 2 }}>AMOUNT</p><p style={{ fontSize: 14, fontWeight: 700 }}>₹{finalTotal.toLocaleString()}</p></div>
                    </div>
                  </div>
                  {[['Card Number','4242 4242 4242 4242'],['Expiry','12/28'],['CVV','•••']].map(([lbl, val]) => (
                    <div key={lbl} style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>{lbl}</label>
                      <input defaultValue={val} readOnly style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1.5px solid var(--gray-200)', fontSize: 14, background: 'var(--gray-50)', color: 'var(--gray-400)' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div style={{ padding: '16px 28px', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 10 }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: 13, borderRadius: 10, border: '1.5px solid var(--gray-200)', fontWeight: 600, fontSize: 14, color: 'var(--gray-600)', background: '#fff' }}>
                  ← Back
                </button>
              )}
              {step < 2 ? (
                <button onClick={() => { if (step === 0 && !validateStep0()) return; setStep(s => s + 1); }} style={{ flex: 2, padding: 13, borderRadius: 10, background: 'linear-gradient(135deg,var(--blue-700),var(--blue-500))', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: 'var(--shadow-blue)' }}>
                  Continue →
                </button>
              ) : (
                <button onClick={placeOrder} disabled={placing} style={{ flex: 2, padding: 13, borderRadius: 10, background: placing ? 'var(--gray-300)' : 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {placing ? 'Processing...' : `🔒 Pay ₹${finalTotal.toLocaleString()}`}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function SuccessScreen({ orderId, onClose, navigate }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', textAlign: 'center' }}>
      <div style={{ width: 100, height: 100, marginBottom: 24, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--blue-50)', animation: 'scaleIn .4s ease' }} />
        <svg width="100" height="100" viewBox="0 0 100 100" style={{ position: 'relative', zIndex: 1 }}>
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--blue-100)" strokeWidth="4" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--blue-500)" strokeWidth="4" strokeDasharray="264" strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
          <path d="M30 52 L44 66 L70 38" stroke="var(--blue-600)" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"
            style={{ strokeDasharray: 60, strokeDashoffset: 0, animation: 'checkDraw .5s .3s ease both' }} />
        </svg>
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Order Placed! 🎉</h2>
      <p style={{ color: 'var(--gray-500)', fontSize: 15, marginBottom: 8, maxWidth: 300 }}>Your sneakers are confirmed and being prepared for dispatch.</p>
      <div style={{ padding: '8px 16px', background: 'var(--blue-50)', borderRadius: 8, marginBottom: 28 }}>
        <span style={{ fontSize: 12, color: 'var(--blue-600)', fontWeight: 600 }}>Order ID: </span>
        <span style={{ fontSize: 12, color: 'var(--blue-800)', fontFamily: 'monospace', fontWeight: 700 }}>{orderId?.slice(-10).toUpperCase()}</span>
      </div>
      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 320 }}>
        <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1.5px solid var(--gray-200)', fontWeight: 600, fontSize: 14, color: 'var(--gray-600)' }}>Continue Shopping</button>
        <button onClick={() => { onClose(); navigate('/orders'); }} style={{ flex: 1, padding: 12, borderRadius: 10, background: 'linear-gradient(135deg,var(--blue-700),var(--blue-500))', color: '#fff', fontWeight: 700, fontSize: 14 }}>Track Order →</button>
      </div>
    </div>
  );
}