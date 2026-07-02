import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout }        = useAuth();
  const { count, openCart }     = useCart();
  const navigate                = useNavigate();
  const location                = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(255,255,255,.97)',
      borderBottom: `1px solid ${scrolled ? 'var(--gray-200)' : 'var(--gray-100)'}`,
      backdropFilter: 'blur(12px)',
      boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
      transition: 'all var(--transition-base)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 68,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--blue-700), var(--blue-500))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M2 17L5 7h14l3 10H2z" fill="white" opacity=".9"/>
              <path d="M5 7c0-2.5 3-5 7-5s7 2.5 7 5" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="8" cy="17" r="2" fill="white"/>
              <circle cx="16" cy="17" r="2" fill="white"/>
            </svg>
          </div>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
            background: 'linear-gradient(135deg, var(--blue-800), var(--blue-500))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>AirFoot</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[['/', 'Home'], ['/shop', 'Shop']].map(([path, label]) => (
            <Link key={path} to={path} style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: isActive(path) ? 'var(--blue-600)' : 'var(--gray-600)',
              background: isActive(path) ? 'var(--blue-50)' : 'transparent',
              transition: 'all var(--transition-fast)',
            }}>{label}</Link>
          ))}
          {user?.role === 'owner' && (
            <Link to="/owner/dashboard" style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: isActive('/owner/dashboard') ? 'var(--blue-600)' : 'var(--gray-600)',
              background: isActive('/owner/dashboard') ? 'var(--blue-50)' : 'transparent',
            }}>Dashboard</Link>
          )}
          {user?.role === 'user' && (
            <Link to="/orders" style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: isActive('/orders') ? 'var(--blue-600)' : 'var(--gray-600)',
              background: isActive('/orders') ? 'var(--blue-50)' : 'transparent',
            }}>My Orders</Link>
          )}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user?.role !== 'owner' && (
            <button onClick={openCart} style={{
              position: 'relative', width: 42, height: 42, borderRadius: 10,
              background: 'var(--gray-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--gray-700)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {count > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--blue-500)', color: '#fff',
                  fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #fff',
                }}>{count}</span>
              )}
            </button>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                padding: '6px 14px', borderRadius: 8,
                background: 'var(--blue-50)', color: 'var(--blue-700)',
                fontSize: 13, fontWeight: 600,
              }}>
                {user.name.split(' ')[0]}
                {user.role === 'owner' && (
                  <span style={{
                    marginLeft: 6, fontSize: 10, fontWeight: 700,
                    background: 'var(--blue-600)', color: '#fff',
                    padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase',
                  }}>Owner</span>
                )}
              </div>
              <button onClick={handleLogout} style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: 'var(--gray-900)', color: '#fff',
              }}>Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                color: 'var(--gray-600)',
              }}>Login</Link>
              <Link to="/register" style={{
                padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                background: 'linear-gradient(135deg, var(--blue-700), var(--blue-500))',
                color: '#fff', boxShadow: 'var(--shadow-blue)',
              }}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}