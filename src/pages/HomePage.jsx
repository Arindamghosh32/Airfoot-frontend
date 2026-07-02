import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../api/services';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/common/Spinner';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    productService.getAll({ sort: 'price_desc' })
      .then(({ data }) => setProducts(data.products.slice(0, 6)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingTop: 68 }}>
      {/* Hero */}
      <section style={{
        minHeight: 'calc(100vh - 68px)',
        background: 'linear-gradient(135deg, var(--blue-950) 0%, var(--blue-800) 55%, var(--blue-600) 100%)',
        display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .07, backgroundImage: 'linear-gradient(var(--blue-300) 1px, transparent 1px), linear-gradient(90deg, var(--blue-300) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '80px 24px' }}>
          <div style={{ maxWidth: 580 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: 'rgba(96,165,250,.15)', border: '1px solid rgba(96,165,250,.3)', marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue-300)', display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue-300)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>New Collection 2025</span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 'clamp(48px,7vw,80px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 24 }}>
              Step Into<br />
              <span style={{ background: 'linear-gradient(90deg, var(--blue-300), #a5f3fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pure Style</span>
            </h1>

            <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 18, lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
              Curated premium sneakers from the world's top brands. Each pair is unique — once it's gone, it's gone.
            </p>

            <div style={{ display: 'flex', gap: 14 }}>
              <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 32px', borderRadius: 12, fontWeight: 700, fontSize: 16, background: '#fff', color: 'var(--blue-700)', boxShadow: '0 8px 32px rgba(0,0,0,.2)' }}>
                Shop Now →
              </Link>
              <a href="#featured" style={{ display: 'inline-flex', alignItems: 'center', padding: '16px 32px', borderRadius: 12, fontWeight: 600, fontSize: 16, border: '1.5px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.85)' }}>
                View Collection
              </a>
            </div>

            <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
              {[['500+', 'Sneakers Sold'], ['50+', 'Top Brands'], ['4.9★', 'Customer Rating']].map(([n, l]) => (
                <div key={l}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>{n}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 500 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.4)', animation: 'pulse 2s infinite' }}>
          <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Scroll</span>
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none"><path d="M8 2v14M2 10l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </section>

      {/* Brands */}
      <section style={{ background: 'var(--gray-900)', padding: '20px 0' }}>
        <div style={{ display: 'flex', gap: 48, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', padding: '0 24px' }}>
          {['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance', 'Vans'].map((b) => (
            <span key={b} style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{b}</span>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Fresh Drops</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, letterSpacing: '-1px' }}>Featured Sneakers</h2>
            </div>
            <Link to="/shop" style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue-600)' }}>View all →</Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><Spinner /></div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
              <p style={{ fontSize: 16 }}>No products listed yet. Check back soon!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {products.map((p, i) => (
                <div key={p._id} style={{ animation: `fadeUp .4s ${i * 0.06}s ease both` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Value Props */}
      <section style={{ background: 'var(--blue-950)', padding: '64px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
            {[['🚚','Free Delivery','On all orders above ₹2,999'],['🔒','Secure Payment','100% safe & encrypted'],['✅','Authentic Only','Every pair is verified genuine'],['↩️','Easy Returns','7-day hassle-free returns']].map(([icon,title,desc]) => (
              <div key={title} style={{ textAlign: 'center', padding: '8px 16px' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{title}</h3>
                <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 13 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--gray-900)', padding: '32px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, background: 'linear-gradient(135deg, var(--blue-300), #a5f3fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AirFoot</div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.3)' }}>© 2025 AirFoot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}