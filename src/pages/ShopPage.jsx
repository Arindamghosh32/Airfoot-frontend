import { useEffect, useState, useCallback } from 'react';
import { productService } from '../api/services';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/common/Spinner';

const CATEGORIES = ['All', 'Running', 'Casual', 'Basketball', 'Training', 'Lifestyle'];

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState('All');
  const [sort, setSort]         = useState('');
  const [search, setSearch]     = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort };
      if (category !== 'All') params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const { data } = await productService.getAll(params);
      setProducts(data.products);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [category, sort, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--gray-50)' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--gray-100)', padding: '32px 0' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, letterSpacing: '-1px', marginBottom: 6 }}>All Sneakers</h1>
          <p style={{ color: 'var(--gray-400)', fontSize: 15 }}>{filtered.length} styles available</p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24, padding: '16px 20px', background: '#fff', borderRadius: 14, border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brand or name..." style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 8, border: '1.5px solid var(--gray-200)', fontSize: 14, outline: 'none' }} />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: '9px 14px', borderRadius: 8, border: '1.5px solid var(--gray-200)', fontSize: 14, outline: 'none', background: '#fff', cursor: 'pointer' }}>
            <option value="">Newest First</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="price_asc">Price: Low → High</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="number" placeholder="Min ₹" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ width: 90, padding: '9px 10px', borderRadius: 8, border: '1.5px solid var(--gray-200)', fontSize: 14, outline: 'none' }} />
            <span style={{ color: 'var(--gray-400)', fontSize: 12 }}>—</span>
            <input type="number" placeholder="Max ₹" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: 90, padding: '9px 10px', borderRadius: 8, border: '1.5px solid var(--gray-200)', fontSize: 14, outline: 'none' }} />
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              background: category === cat ? 'linear-gradient(135deg,var(--blue-700),var(--blue-500))' : '#fff',
              color: category === cat ? '#fff' : 'var(--gray-500)',
              border: `1.5px solid ${category === cat ? 'transparent' : 'var(--gray-200)'}`,
              boxShadow: category === cat ? 'var(--shadow-blue)' : 'none',
              transition: 'all var(--transition-fast)',
            }}>{cat}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-400)' }}>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No sneakers found</p>
            <p style={{ fontSize: 14 }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {filtered.map((p, i) => (
              <div key={p._id} style={{ animation: `fadeUp .35s ${i * 0.04}s ease both` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}