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

function InputField({ label, type = 'text', value, onChange, placeholder, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ padding: '12px 14px', borderRadius: 10, fontSize: 14, border: `1.5px solid ${error ? 'var(--error)' : 'var(--gray-200)'}`, outline: 'none', background: error ? '#fff5f5' : '#fff' }} />
      {error && <span style={{ fontSize: 11, color: 'var(--error)', fontWeight: 500 }}>{error}</span>}
    </div>
  );
}

export default function LoginPage() {
  const { login }     = useAuth();
  const navigate      = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: '' })); };

  const submit = async () => {
    const e = {};
    if (!form.email) e.email = 'Required';
    if (!form.password) e.password = 'Required';
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'owner' ? '/owner/dashboard' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your AirFoot account">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <InputField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" error={errors.email} />
        <InputField label="Password" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" error={errors.password} />
        <button onClick={submit} disabled={loading} style={{ marginTop: 8, padding: 14, borderRadius: 10, background: loading ? 'var(--gray-300)' : 'linear-gradient(135deg,var(--blue-700),var(--blue-500))', color: '#fff', fontWeight: 700, fontSize: 15, boxShadow: loading ? 'none' : 'var(--shadow-blue)' }}>
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--gray-400)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--blue-600)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </AuthLayout>
  );
}