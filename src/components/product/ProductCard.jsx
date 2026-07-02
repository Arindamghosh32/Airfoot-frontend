import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../api/services';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem, items }       = useCart();
  const { user }                 = useAuth();
  const navigate                 = useNavigate();
  const [hovered, setHovered]    = useState(false);
  const [selSize, setSelSize]    = useState(null);
  const [showSizes, setShowSizes]= useState(false);

  const inCart = items.some((i) => i._id === product._id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!user) { toast.error('Please login to add items'); navigate('/login'); return; }
    if (user.role === 'owner') { toast.error('Owners cannot purchase'); return; }
    if (inCart) { toast('Already in cart!', { icon: '🛒' }); return; }
    if (!selSize) { setShowSizes(true); toast('Pick a size first 👟', { icon: '👆' }); return; }
    addItem(product, selSize);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: 16,
        border: `1.5px solid ${hovered ? 'var(--blue-200)' : 'var(--gray-100)'}`,
        overflow: 'hidden', cursor: 'pointer',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transition: 'all var(--transition-base)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{
        height: 220, overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--gray-50), var(--blue-50))',
        position: 'relative',
      }}>
        {product.imageFilename ? (
          <img
            src={productService.getImage(product.imageFilename)}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform .4s ease' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, color: 'var(--blue-200)' }}>👟</div>
        )}
        <div style={{
          position: 'absolute', top: 12, left: 12, padding: '4px 10px', borderRadius: 20,
          background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(4px)',
          fontSize: 11, fontWeight: 700, color: 'var(--blue-600)',
          letterSpacing: '0.04em', textTransform: 'uppercase', border: '1px solid var(--blue-100)',
        }}>{product.category}</div>
      </div>

      <div style={{ padding: '16px 16px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{product.brand}</p>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8, lineHeight: 1.3, flex: 1 }}>{product.name}</h3>

        {showSizes && (
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 6 }}>SELECT SIZE</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {product.size?.map((s) => (
                <button key={s} onClick={(e) => { e.stopPropagation(); setSelSize(s); }} style={{
                  padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  border: `1.5px solid ${selSize === s ? 'var(--blue-500)' : 'var(--gray-200)'}`,
                  background: selSize === s ? 'var(--blue-50)' : '#fff',
                  color: selSize === s ? 'var(--blue-600)' : 'var(--gray-600)',
                  transition: 'all var(--transition-fast)',
                }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--blue-700)' }}>
            ₹{product.price.toLocaleString()}
          </span>
          <button onClick={handleAddToCart} style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: inCart ? 'var(--gray-100)' : 'linear-gradient(135deg, var(--blue-700), var(--blue-500))',
            color: inCart ? 'var(--gray-400)' : '#fff',
            boxShadow: inCart ? 'none' : 'var(--shadow-blue)',
            transition: 'all var(--transition-fast)',
            pointerEvents: inCart ? 'none' : 'auto',
          }}>
            {inCart ? '✓ In Cart' : showSizes && !selSize ? 'Pick Size' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}