import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: '100vh', paddingTop: 68, background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,var(--blue-700),var(--blue-500))', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: 'var(--shadow-blue)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M2 17L5 7h14l3 10H2z" fill="white" opacity=".9"/><path d="M5 7c0-2.5 3-5 7-5s7 2.5 7 5" stroke="white" strokeWidth="1.5" fill="none"/><circle cx="8" cy="17" r="2" fill="white"/><circle cx="16" cy="17" r="2" fill="white"/></svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>{title}</h1>
          <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>{subtitle}</p>
        </div>
        <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--gray-100)', animation: 'scaleIn .25s ease' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const { register }  = useAuth();
  const navigate      = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'user' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: '' })); };

  const submit = async () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email) e.email = 'Required';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'owner' ? '/owner/dashboard' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const Field = ({ label, name, type = 'text', placeholder }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <input type={type} value={form[name]} onChange={set(name)} placeholder={placeholder} style={{ padding: '12px 14px', borderRadius: 10, fontSize: 14, border: `1.5px solid ${errors[name] ? 'var(--error)' : 'var(--gray-200)'}`, outline: 'none', background: errors[name] ? '#fff5f5' : '#fff' }} />
      {errors[name] && <span style={{ fontSize: 11, color: 'var(--error)', fontWeight: 500 }}>{errors[name]}</span>}
    </div>
  );

  return (
    <AuthLayout title="Create Account" subtitle="Join AirFoot — exclusive drops await">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Full Name" name="name" placeholder="Jordan Smith" />
        <Field label="Email" name="email" type="email" placeholder="you@example.com" />
        <Field label="Password" name="password" type="password" placeholder="Min. 6 characters" />
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>I want to</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[['user','🛒 Buy Sneakers'],['owner','🏪 Sell Sneakers']].map(([r, label]) => (
              <button key={r} onClick={() => setForm(p => ({ ...p, role: r }))} style={{
                padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 600,
                border: `2px solid ${form.role === r ? 'var(--blue-500)' : 'var(--gray-200)'}`,
                background: form.role === r ? 'var(--blue-50)' : '#fff',
                color: form.role === r ? 'var(--blue-700)' : 'var(--gray-500)',
                transition: 'all var(--transition-fast)',
              }}>{label}</button>
            ))}
          </div>
        </div>
        <button onClick={submit} disabled={loading} style={{ marginTop: 4, padding: 14, borderRadius: 10, background: loading ? 'var(--gray-300)' : 'linear-gradient(135deg,var(--blue-700),var(--blue-500))', color: '#fff', fontWeight: 700, fontSize: 15, boxShadow: loading ? 'none' : 'var(--shadow-blue)' }}>
          {loading ? 'Creating account...' : 'Create Account →'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--gray-400)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--blue-600)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}