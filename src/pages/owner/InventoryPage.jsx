import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../api/services';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const navigate              = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    productService.getOwnerInventory()
      .then(({ data }) => setProducts(data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await productService.delete(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  const filtered = products.filter(p => filter === 'all' ? true : filter === 'available' ? !p.isSold : p.isSold);
  const totalValue     = products.filter(p => !p.isSold).reduce((s, p) => s + p.price, 0);
  const soldCount      = products.filter(p => p.isSold).length;
  const availableCount = products.filter(p => !p.isSold).length;

  if (loading) return <div style={{ paddingTop: 68, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><Spinner /></div>;

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--gray-50)' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--gray-100)', padding: '28px 0' }}>
        <div className="container">
          <button onClick={() => navigate('/owner/dashboard')} style={{ color: 'var(--blue-600)', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>← Dashboard</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px' }}>My Inventory</h1>
              <p style={{ color: 'var(--gray-400)', fontSize: 14, marginTop: 4 }}>{products.length} total · {availableCount} available · {soldCount} sold</p>
            </div>
            <button onClick={() => navigate('/owner/add-product')} style={{ padding: '11px 22px', borderRadius: 10, background: 'linear-gradient(135deg,var(--blue-700),var(--blue-500))', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: 'var(--shadow-blue)' }}>+ Add New Shoe</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginTop: 20 }}>
            {[
              { label: 'In Stock',        value: availableCount,                  color: 'var(--blue-600)', bg: 'var(--blue-50)' },
              { label: 'Sold Out',        value: soldCount,                       color: '#059669',         bg: '#f0fdf4' },
              { label: 'Inventory Value', value: `₹${totalValue.toLocaleString()}`, color: 'var(--gray-700)', bg: 'var(--gray-50)' },
            ].map(c => (
              <div key={c.label} style={{ padding: '14px 18px', background: c.bg, borderRadius: 12 }}>
                <p style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 800, color: c.color }}>{c.value}</p>
                <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2, fontWeight: 600 }}>{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 24px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[['all','All'],['available','Available'],['sold','Sold']].map(([val,label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              background: filter === val ? 'linear-gradient(135deg,var(--blue-700),var(--blue-500))' : '#fff',
              color: filter === val ? '#fff' : 'var(--gray-500)',
              border: `1.5px solid ${filter === val ? 'transparent' : 'var(--gray-200)'}`,
              boxShadow: filter === val ? 'var(--shadow-blue)' : 'none',
              transition: 'all var(--transition-fast)',
            }}>{label}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 16, border: '1px solid var(--gray-100)' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📦</p>
            <p style={{ fontWeight: 600, color: 'var(--gray-600)' }}>No products found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
            {filtered.map((p, i) => (
              <div key={p._id} style={{ background: '#fff', borderRadius: 14, border: '1.5px solid var(--gray-100)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', opacity: p.isSold ? 0.75 : 1, animation: `fadeUp .3s ${i * 0.04}s ease both` }}>
                <div style={{ height: 180, background: 'linear-gradient(135deg,var(--gray-50),var(--blue-50))', position: 'relative', overflow: 'hidden' }}>
                  {p.imageFilename ? (
                    <img src={productService.getImage(p.imageFilename)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: p.isSold ? 'grayscale(60%)' : 'none' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>👟</div>
                  )}
                  <div style={{ position: 'absolute', top: 10, right: 10, padding: '4px 10px', borderRadius: 20, background: p.isSold ? 'rgba(0,0,0,.7)' : 'rgba(37,99,235,.9)', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                    {p.isSold ? 'SOLD' : 'IN STOCK'}
                  </div>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{p.brand}</p>
                  <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, lineHeight: 1.3 }}>{p.name}</h3>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--blue-700)', marginBottom: 12 }}>₹{p.price.toLocaleString()}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => navigate(`/products/${p._id}`)} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1.5px solid var(--gray-200)', fontSize: 12, fontWeight: 600, color: 'var(--gray-600)' }}>Preview</button>
                    {!p.isSold && (
                      <button onClick={() => handleDelete(p._id)} disabled={deleting === p._id} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1.5px solid var(--error)', fontSize: 12, fontWeight: 600, color: 'var(--error)', opacity: deleting === p._id ? 0.5 : 1 }}>
                        {deleting === p._id ? '...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}