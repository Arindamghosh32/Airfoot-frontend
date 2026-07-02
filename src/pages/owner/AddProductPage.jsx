import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../api/services';
import toast from 'react-hot-toast';

const CATEGORIES = ['Running', 'Casual', 'Basketball', 'Training', 'Lifestyle'];
const ALL_SIZES  = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export default function AddProductPage() {
  const navigate              = useNavigate();
  const [form, setForm]       = useState({ name: '', brand: '', description: '', price: '', category: 'Lifestyle' });
  const [sizes, setSizes]     = useState([]);
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [dragOver, setDragOver] = useState(false);

  const set = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: '' })); };

  const handleImage = (file) => {
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { toast.error('Only JPG, PNG, WebP allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const toggleSize = (s) => setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s].sort((a,b)=>a-b));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.brand.trim()) e.brand = 'Required';
    if (!form.price || Number(form.price) <= 0) e.price = 'Valid price required';
    if (sizes.length === 0) e.sizes = 'Select at least one size';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('size', JSON.stringify(sizes));
      if (image) fd.append('image', image);
      await productService.create(fd);
      toast.success('Product listed successfully!');
      navigate('/owner/inventory');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product');
    } finally { setLoading(false); }
  };

  const Field = ({ label, name, type = 'text', placeholder, textarea }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      {textarea ? (
        <textarea value={form[name]} onChange={set(name)} placeholder={placeholder} rows={3} style={{ padding: '11px 14px', borderRadius: 10, fontSize: 14, border: `1.5px solid ${errors[name] ? 'var(--error)' : 'var(--gray-200)'}`, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
      ) : (
        <input type={type} value={form[name]} onChange={set(name)} placeholder={placeholder} style={{ padding: '11px 14px', borderRadius: 10, fontSize: 14, border: `1.5px solid ${errors[name] ? 'var(--error)' : 'var(--gray-200)'}`, outline: 'none', background: errors[name] ? '#fff5f5' : '#fff' }} />
      )}
      {errors[name] && <span style={{ fontSize: 11, color: 'var(--error)', fontWeight: 500 }}>{errors[name]}</span>}
    </div>
  );

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--gray-50)' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--gray-100)', padding: '28px 0' }}>
        <div className="container">
          <button onClick={() => navigate('/owner/dashboard')} style={{ color: 'var(--blue-600)', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>← Dashboard</button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px' }}>List a New Shoe</h1>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 28, alignItems: 'start', maxWidth: 900 }}>
          {/* Image upload */}
          <div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImage(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById('img-input').click()}
              style={{ borderRadius: 16, border: `2px dashed ${dragOver ? 'var(--blue-500)' : 'var(--gray-300)'}`, background: dragOver ? 'var(--blue-50)' : preview ? 'transparent' : '#fff', cursor: 'pointer', overflow: 'hidden', transition: 'all var(--transition-fast)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {preview ? (
                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--gray-400)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
                  <p style={{ fontWeight: 600, color: 'var(--gray-600)', marginBottom: 4 }}>Drop image here</p>
                  <p style={{ fontSize: 13 }}>or click to upload</p>
                  <p style={{ fontSize: 11, marginTop: 8 }}>JPG, PNG, WebP · Max 5MB</p>
                </div>
              )}
            </div>
            <input id="img-input" type="file" accept="image/*" onChange={(e) => handleImage(e.target.files[0])} style={{ display: 'none' }} />
            {preview && (
              <button onClick={() => { setImage(null); setPreview(null); }} style={{ marginTop: 10, width: '100%', padding: 9, borderRadius: 8, border: '1.5px solid var(--gray-200)', fontSize: 13, fontWeight: 600, color: 'var(--error)' }}>Remove Image</button>
            )}
          </div>

          {/* Form */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field label="Shoe Name" name="name" placeholder="Air Max 97 Silver Bullet" />
            <Field label="Brand" name="brand" placeholder="Nike" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price (₹)</label>
                <input type="number" value={form.price} onChange={set('price')} placeholder="12999" style={{ padding: '11px 14px', borderRadius: 10, fontSize: 14, border: `1.5px solid ${errors.price ? 'var(--error)' : 'var(--gray-200)'}`, outline: 'none' }} />
                {errors.price && <span style={{ fontSize: 11, color: 'var(--error)' }}>{errors.price}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                <select value={form.category} onChange={set('category')} style={{ padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--gray-200)', outline: 'none', background: '#fff', cursor: 'pointer' }}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <Field label="Description" name="description" placeholder="Describe the shoe..." textarea />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Sizes (UK)</label>
                <button onClick={() => setSizes(sizes.length === ALL_SIZES.length ? [] : [...ALL_SIZES])} style={{ fontSize: 11, color: 'var(--blue-600)', fontWeight: 600 }}>{sizes.length === ALL_SIZES.length ? 'Clear all' : 'Select all'}</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ALL_SIZES.map(s => (
                  <button key={s} onClick={() => toggleSize(s)} style={{
                    width: 44, height: 44, borderRadius: 9, fontSize: 14, fontWeight: 700,
                    border: `2px solid ${sizes.includes(s) ? 'var(--blue-500)' : 'var(--gray-200)'}`,
                    background: sizes.includes(s) ? 'linear-gradient(135deg,var(--blue-700),var(--blue-500))' : '#fff',
                    color: sizes.includes(s) ? '#fff' : 'var(--gray-600)',
                    boxShadow: sizes.includes(s) ? 'var(--shadow-blue)' : 'none',
                    transition: 'all var(--transition-fast)',
                  }}>{s}</button>
                ))}
              </div>
              {errors.sizes && <span style={{ fontSize: 11, color: 'var(--error)', fontWeight: 500, display: 'block', marginTop: 4 }}>{errors.sizes}</span>}
            </div>

            <button onClick={submit} disabled={loading} style={{ padding: 14, borderRadius: 11, background: loading ? 'var(--gray-300)' : 'linear-gradient(135deg,var(--blue-700),var(--blue-500))', color: '#fff', fontWeight: 700, fontSize: 15, boxShadow: loading ? 'none' : 'var(--shadow-blue)', marginTop: 4 }}>
              {loading ? 'Listing Shoe...' : '✓ List Shoe for Sale'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}