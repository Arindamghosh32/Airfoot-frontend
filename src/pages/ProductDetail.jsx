import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../api/services';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id }                    = useParams();
  const navigate                  = useNavigate();
  const { user }                  = useAuth();
  const { addItem, items }        = useCart();
  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [selSize, setSelSize]     = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const inCart = items.some((i) => i._id === id);

  useEffect(() => {
    productService.getById(id)
      .then(({ data }) => { setProduct(data.product); setSelSize(data.product.size?.[0]); })
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    if (user.role === 'owner') { toast.error('Owners cannot purchase'); return; }
    if (inCart) { toast('Already in cart', { icon: '🛒' }); return; }
    addItem(product, selSize);
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) return <div style={{ paddingTop: 68, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><Spinner /></div>;

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--gray-50)' }}>
      <div className="container" style={{ padding: '48px 24px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 32, fontSize: 13, color: 'var(--gray-400)' }}>
          <button onClick={() => navigate('/')} style={{ color: 'var(--blue-600)', fontWeight: 500 }}>Home</button>
          <span>/</span>
          <button onClick={() => navigate('/shop')} style={{ color: 'var(--blue-600)', fontWeight: 500 }}>Shop</button>
          <span>/</span>
          <span>{product?.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
          {/* Image */}
          <div style={{ borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg,var(--gray-50),var(--blue-50))', aspectRatio: '1', boxShadow: 'var(--shadow-lg)', position: 'relative' }}>
            {!imgLoaded && product?.imageFilename && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>}
            {product?.imageFilename ? (
              <img src={productService.getImage(product.imageFilename)} alt={product.name} onLoad={() => setImgLoaded(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity .3s' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>👟</div>
            )}
            <div style={{ position: 'absolute', top: 16, left: 16, padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(8px)', fontSize: 12, fontWeight: 700, color: 'var(--blue-600)', border: '1px solid var(--blue-100)' }}>{product?.category}</div>
          </div>

          {/* Info */}
          <div style={{ animation: 'fadeUp .4s ease' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{product?.brand}</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 16, lineHeight: 1.15 }}>{product?.name}</h1>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 28 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 900, color: 'var(--blue-700)' }}>₹{product?.price.toLocaleString()}</span>
              <span style={{ fontSize: 14, color: 'var(--gray-400)', padding: '4px 10px', background: 'var(--blue-50)', borderRadius: 6, fontWeight: 600 }}>Incl. all taxes</span>
            </div>
            {product?.description && (
              <p style={{ color: 'var(--gray-500)', fontSize: 15, lineHeight: 1.7, marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid var(--gray-100)' }}>{product.description}</p>
            )}

            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Select Size (UK)</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {product?.size?.map((s) => (
                  <button key={s} onClick={() => setSelSize(s)} style={{
                    width: 52, height: 52, borderRadius: 10, fontSize: 15, fontWeight: 700,
                    border: `2px solid ${selSize === s ? 'var(--blue-500)' : 'var(--gray-200)'}`,
                    background: selSize === s ? 'linear-gradient(135deg,var(--blue-700),var(--blue-500))' : '#fff',
                    color: selSize === s ? '#fff' : 'var(--gray-700)',
                    boxShadow: selSize === s ? 'var(--shadow-blue)' : 'none',
                    transition: 'all var(--transition-fast)',
                  }}>{s}</button>
                ))}
              </div>
            </div>

            <button onClick={handleAdd} disabled={inCart} style={{
              width: '100%', padding: 16, borderRadius: 12, fontWeight: 700, fontSize: 16,
              background: inCart ? 'var(--gray-100)' : 'linear-gradient(135deg,var(--blue-700),var(--blue-500))',
              color: inCart ? 'var(--gray-400)' : '#fff',
              boxShadow: inCart ? 'none' : 'var(--shadow-blue)',
            }}>
              {inCart ? '✓ Added to Cart' : '+ Add to Cart'}
            </button>

            <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
              {['Authentic','Free Delivery','7-Day Return'].map((t) => (
                <span key={t} style={{ padding: '5px 12px', borderRadius: 20, background: 'var(--gray-100)', fontSize: 12, fontWeight: 600, color: 'var(--gray-500)' }}>✓ {t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}