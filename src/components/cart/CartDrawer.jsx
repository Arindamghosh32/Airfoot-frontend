import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../api/services';
import CheckoutPanel from '../checkout/CheckoutPanel';

export default function CartDrawer() {
  const { items, total, isOpen, closeCart, removeItem } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div onClick={closeCart} style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          background: 'rgba(10,15,46,.4)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn .2s ease',
        }} />
      )}

      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1101,
        width: 420, maxWidth: '100vw',
        background: '#fff',
        display: 'flex', flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .35s cubic-bezier(.4,0,.2,1)',
        boxShadow: isOpen ? '-8px 0 40px rgba(0,0,0,.12)' : 'none',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--gray-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>Your Cart</h2>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button onClick={closeCart} style={{
            width: 36, height: 36, borderRadius: 8, background: 'var(--gray-100)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--gray-600)', fontSize: 18,
          }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', gap: 16, color: 'var(--gray-400)',
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <p style={{ fontWeight: 500 }}>Your cart is empty</p>
              <button onClick={() => { closeCart(); navigate('/shop'); }} style={{
                padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                background: 'var(--blue-600)', color: '#fff',
              }}>Browse Shoes</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item) => (
                <div key={item._id} style={{
                  display: 'flex', gap: 12, padding: 12,
                  background: 'var(--gray-50)', borderRadius: 12,
                  border: '1px solid var(--gray-100)',
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 8,
                    overflow: 'hidden', background: 'var(--gray-200)', flexShrink: 0,
                  }}>
                    {item.imageFilename ? (
                      <img
                        src={productService.getImage(item.imageFilename)}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 28,
                      }}>👟</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>
                      {item.brand} · Size {item.selectedSize}
                    </p>
                    <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--blue-600)' }}>
                      ₹{item.price.toLocaleString()}
                    </p>
                  </div>
                  <button onClick={() => removeItem(item._id)} style={{
                    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                    background: 'var(--gray-200)', color: 'var(--gray-500)', fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ color: 'var(--gray-500)', fontWeight: 500 }}>Subtotal</span>
              <span style={{ fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-display)' }}>
                ₹{total.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => { closeCart(); setCheckoutOpen(true); }}
              style={{
                width: '100%', padding: '14px', borderRadius: 10,
                background: 'linear-gradient(135deg, var(--blue-700), var(--blue-500))',
                color: '#fff', fontWeight: 700, fontSize: 15,
                boxShadow: 'var(--shadow-blue)',
              }}
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>

      {checkoutOpen && <CheckoutPanel onClose={() => setCheckoutOpen(false)} />}
    </>
  );
}