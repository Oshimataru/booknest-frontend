import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'Browse',       path: '/books',        auth: false },
  { label: '+ Post Book',  path: '/add-book',     auth: true  },
  { label: 'My Books',     path: '/my-books',     auth: true  },
  { label: 'My Orders',    path: '/my-orders',    auth: true  },
  { label: 'Exchanges',    path: '/my-exchanges', auth: true  },
  { label: 'Book Clubs',   path: '/clubs',        auth: true  },
  { label: '🏆 Leaderboard', path: '/leaderboard', auth: true },
];

const Navbar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();

  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /* Shrink navbar on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => { setMenuOpen(false); setDropdownOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => location.pathname === path;

  const visibleLinks = NAV_LINKS.filter(l => !l.auth || user);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500&family=Cormorant+Garamond:ital,wght@1,600&display=swap');

        .nv-root *, .nv-root *::before, .nv-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .nv-root {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 1000;
          transition: background 0.35s ease, box-shadow 0.35s ease, padding 0.35s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .nv-root.scrolled {
          background: rgba(4, 22, 26, 0.92);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 1px 0 rgba(5,124,133,0.2), 0 8px 32px rgba(0,0,0,0.35);
        }
        .nv-root.top {
          background: linear-gradient(180deg, rgba(4,19,24,0.85) 0%, transparent 100%);
        }

        /* ── Inner bar ── */
        .nv-bar {
          display: flex; align-items: center;
          max-width: 1280px; margin: 0 auto;
          padding: 0 24px;
          height: 64px;
          transition: height 0.3s ease;
        }
        .nv-root.scrolled .nv-bar { height: 56px; }

        /* ── Brand ── */
        .nv-brand {
          display: flex; align-items: center; gap: 9px;
          cursor: pointer; flex-shrink: 0;
          text-decoration: none;
        }
        .nv-brand-dot {
          width: 9px; height: 9px; border-radius: 50%;
          background: #057c85;
          box-shadow: 0 0 8px 2px rgba(5,124,133,0.65);
          animation: nvPulse 2.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes nvPulse {
          0%,100%{ box-shadow: 0 0 5px 1px rgba(5,124,133,0.4); }
          50%    { box-shadow: 0 0 12px 3px rgba(5,160,175,0.85); }
        }
        .nv-brand-text {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700;
          color: #c8f0ec; letter-spacing: 0.3px;
          line-height: 1;
        }
        .nv-brand-text em {
          color: #057c85; font-style: italic;
          -webkit-text-stroke: 0.5px rgba(5,180,190,0.5);
        }

        /* ── Desktop links ── */
        .nv-links {
          display: flex; align-items: center; gap: 2px;
          margin-left: 32px; flex: 1;
        }
        .nv-link {
          position: relative;
          background: none; border: none;
          color: rgba(160,230,225,0.7);
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 400;
          padding: 7px 12px; border-radius: 8px;
          cursor: pointer; white-space: nowrap;
          transition: color 0.2s, background 0.2s;
          text-decoration: none;
        }
        .nv-link:hover {
          color: #9ee8e2;
          background: rgba(5,124,133,0.12);
        }
        .nv-link.active {
          color: #5dcfc8; font-weight: 500;
          background: rgba(5,124,133,0.15);
        }
        .nv-link.active::after {
          content: '';
          position: absolute; bottom: 3px; left: 50%;
          transform: translateX(-50%);
          width: 16px; height: 2px;
          background: #057c85; border-radius: 2px;
        }

        /* ── Actions ── */
        .nv-actions {
          display: flex; align-items: center; gap: 10px;
          margin-left: auto; flex-shrink: 0;
        }

        /* User avatar + dropdown */
        .nv-user-wrap {
          position: relative;
        }
        .nv-avatar {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 12px 6px 6px;
          background: rgba(5,124,133,0.15);
          border: 1px solid rgba(5,124,133,0.3);
          border-radius: 40px; cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .nv-avatar:hover {
          background: rgba(5,124,133,0.25);
          border-color: rgba(5,160,175,0.5);
        }
        .nv-avatar-circle {
          width: 28px; height: 28px; border-radius: 50%;
          background: #057c85;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 500; color: #d0f5f2;
          flex-shrink: 0;
        }
        .nv-avatar-name {
          font-size: 13px; color: #9ee8e2; font-weight: 400;
          max-width: 100px; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
        }
        .nv-avatar-caret {
          width: 14px; height: 14px; color: rgba(100,200,195,0.6);
          transition: transform 0.2s;
          flex-shrink: 0;
        }
        .nv-avatar-caret.open { transform: rotate(180deg); }

        /* Dropdown */
        .nv-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          min-width: 180px;
          background: rgba(4,22,26,0.97);
          border: 1px solid rgba(5,124,133,0.25);
          border-radius: 12px;
          backdrop-filter: blur(20px);
          overflow: hidden;
          animation: nvDropIn 0.18s ease both;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        @keyframes nvDropIn {
          from { opacity:0; transform: translateY(-6px) scale(0.97); }
          to   { opacity:1; transform: translateY(0)   scale(1); }
        }
        .nv-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%; background: none; border: none;
          padding: 11px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; color: rgba(160,230,225,0.8);
          cursor: pointer; text-align: left;
          transition: background 0.15s, color 0.15s;
        }
        .nv-dropdown-item:hover {
          background: rgba(5,124,133,0.18);
          color: #9ee8e2;
        }
        .nv-dropdown-item.danger { color: rgba(240,120,100,0.8); }
        .nv-dropdown-item.danger:hover {
          background: rgba(220,60,60,0.12);
          color: #f08070;
        }
        .nv-dropdown-divider {
          height: 1px; background: rgba(5,124,133,0.15);
          margin: 4px 0;
        }

        /* Login / Register buttons */
        .nv-btn-login {
          padding: 8px 18px;
          background: transparent; color: #5dcfc8;
          border: 1px solid rgba(5,124,133,0.45);
          border-radius: 50px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 400; cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .nv-btn-login:hover {
          background: rgba(5,90,100,0.25);
          border-color: rgba(5,160,175,0.6);
        }
        .nv-btn-register {
          padding: 8px 18px;
          background: #057c85; color: #d0f5f2;
          border: none; border-radius: 50px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          box-shadow: 0 3px 12px rgba(5,124,133,0.4);
        }
        .nv-btn-register:hover { background: #069aaa; transform: translateY(-1px); }

        /* Admin badge */
        .nv-admin-badge {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 11px;
          background: rgba(5,124,133,0.18);
          border: 1px solid rgba(5,124,133,0.35);
          border-radius: 50px;
          font-size: 12px; color: #5dcfc8; cursor: pointer;
          transition: background 0.2s;
        }
        .nv-admin-badge:hover { background: rgba(5,124,133,0.3); }

        /* ── Hamburger (mobile) ── */
        .nv-hamburger {
          display: none; flex-direction: column;
          justify-content: center; align-items: center;
          gap: 5px; width: 36px; height: 36px;
          background: none; border: none; cursor: pointer;
          margin-left: 8px;
        }
        .nv-hamburger span {
          display: block; width: 22px; height: 1.8px;
          background: #5dcfc8; border-radius: 2px;
          transition: transform 0.28s ease, opacity 0.2s ease;
        }
        .nv-hamburger.open span:nth-child(1) { transform: translateY(6.8px) rotate(45deg); }
        .nv-hamburger.open span:nth-child(2) { opacity: 0; }
        .nv-hamburger.open span:nth-child(3) { transform: translateY(-6.8px) rotate(-45deg); }

        /* ── Mobile drawer ── */
        .nv-drawer {
          display: none;
          flex-direction: column;
          background: rgba(4,18,22,0.98);
          backdrop-filter: blur(24px);
          border-top: 1px solid rgba(5,124,133,0.15);
          padding: 8px 16px 20px;
          animation: nvDrawerIn 0.22s ease both;
        }
        @keyframes nvDrawerIn {
          from { opacity:0; transform: translateY(-8px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .nv-drawer.open { display: flex; }

        .nv-drawer-link {
          background: none; border: none;
          color: rgba(160,230,225,0.75);
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 400;
          padding: 13px 8px; text-align: left;
          cursor: pointer; width: 100%;
          border-bottom: 1px solid rgba(5,124,133,0.1);
          transition: color 0.2s;
        }
        .nv-drawer-link:last-child { border-bottom: none; }
        .nv-drawer-link.active { color: #5dcfc8; font-weight: 500; }
        .nv-drawer-link:hover  { color: #9ee8e2; }

        .nv-drawer-actions {
          display: flex; gap: 10px; margin-top: 14px;
        }
        .nv-drawer-actions button { flex: 1; }

        /* ── Responsive breakpoint ── */
        @media (max-width: 900px) {
          .nv-links      { display: none; }
          .nv-hamburger  { display: flex; }
          .nv-actions    { gap: 6px; }
          .nv-avatar-name{ display: none; }
        }
        @media (max-width: 480px) {
          .nv-bar { padding: 0 16px; }
        }
      `}</style>
      <style>{`
/* ===== FORCE BOOKNEST THEME OVERRIDE ===== */

.nv-root.scrolled {
  background: rgba(247,243,238,0.95) !important;
  box-shadow: 0 1px 0 rgba(160,120,40,0.15) !important;
}

.nv-root.top {
  background: linear-gradient(180deg, rgba(247,243,238,0.9) 0%, transparent 100%) !important;
}

/* BRAND */
.nv-brand-dot {
  background: #0ea1ce !important;
  box-shadow: 0 0 8px 2px rgba(160,120,40,0.6) !important;
}

.nv-brand-text {
  color: #1a1610 !important;
}

.nv-brand-text em {
  color: #0ea1ce !important;
}

/* LINKS */
.nv-link {
  color: rgba(26,22,16,0.6) !important;
}

.nv-link:hover {
  color: #0ea1ce !important;
  background: rgba(160,120,40,0.08) !important;
}

.nv-link.active {
  color: #0ea1ce !important;
  background: rgba(160,120,40,0.12) !important;
}

.nv-link.active::after {
  background: #0ea1ce !important;
}

/* USER */
.nv-avatar {
  background: rgba(160,120,40,0.12) !important;
  border: 1px solid rgba(160,120,40,0.25) !important;
}

.nv-avatar:hover {
  background: rgba(160,120,40,0.2) !important;
}

.nv-avatar-circle {
  background: #0ea1ce !important;
  color: #fff !important;
}

.nv-avatar-name {
  color: #1a1610 !important;
}

/* DROPDOWN */
.nv-dropdown {
  background: #faf7f2 !important;
  border: 1px solid rgba(160,120,40,0.2) !important;
}

.nv-dropdown-item {
  color: rgba(26,22,16,0.7) !important;
}

.nv-dropdown-item:hover {
  background: rgba(160,120,40,0.1) !important;
  color: #0ea1ce !important;
}

/* BUTTONS */
.nv-btn-login {
  color:#0ea1ce  !important;
  border: 1px solid rgba(160,120,40,0.4) !important;
}

.nv-btn-login:hover {
  background: rgba(160,120,40,0.1) !important;
}

.nv-btn-register {
  background:#0ea1ce  !important;
  color: #fff !important;
}

.nv-btn-register:hover {
  background: #0ea1ce !important;
}

/* MOBILE */
.nv-hamburger span {
  background: #0ea1ce  !important;
}

.nv-drawer {
  background: #f7f3ee !important;
}

.nv-drawer-link {
  color: rgba(26,22,16,0.7) !important;
}

.nv-drawer-link.active {
  color: #0ea1ce  !important;
}
`}</style>

      <nav className={`nv-root ${scrolled ? 'scrolled' : 'top'}`} role="navigation" aria-label="Main navigation">
        <div className="nv-bar">

          {/* Brand */}
          <div className="nv-brand" onClick={() => navigate('/')} role="link" aria-label="BOOK-NEST home">
            <div className="nv-brand-dot" />
            <span className="nv-brand-text">Book<em>Nest</em></span>
          </div>

          {/* Desktop links */}
          <div className="nv-links">
            {visibleLinks.map(({ label, path }) => (
              <button
                key={path}
                className={`nv-link${isActive(path) ? ' active' : ''}`}
                onClick={() => navigate(path)}
                aria-current={isActive(path) ? 'page' : undefined}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="nv-actions">
            {user ? (
              <>
                {/* Admin badge */}
                {user?.role === 'ADMIN' && (
                  <button className="nv-admin-badge" onClick={() => navigate('/admin')}>
                    🛡️ Admin
                  </button>
                )}

                {/* User avatar + dropdown */}
                <div className="nv-user-wrap">
                  <div
                    className="nv-avatar"
                    onClick={() => setDropdownOpen(o => !o)}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    role="button"
                  >
                    <div className="nv-avatar-circle">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="nv-avatar-name">{user.name}</span>
                    <svg className={`nv-avatar-caret${dropdownOpen ? ' open' : ''}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 6l4 4 4-4" />
                    </svg>
                  </div>

                  {dropdownOpen && (
                    <>
                      {/* Click-outside overlay */}
                      <div style={{ position:'fixed', inset:0, zIndex:-1 }} onClick={() => setDropdownOpen(false)} />
                      <div className="nv-dropdown">
                        <button className="nv-dropdown-item" onClick={() => { navigate('/my-orders'); setDropdownOpen(false); }}>
                          📦 My Orders
                        </button>
                        <button className="nv-dropdown-item" onClick={() => { navigate('/my-books'); setDropdownOpen(false); }}>
                          📚 My Books
                        </button>
                        <button className="nv-dropdown-item" onClick={() => { navigate('/my-exchanges'); setDropdownOpen(false); }}>
                          🔄 My Exchanges
                        </button>
                        <div className="nv-dropdown-divider" />
                        <button className="nv-dropdown-item danger" onClick={handleLogout}>
                          🚪 Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <button className="nv-btn-login"    onClick={() => navigate('/login')}>Login</button>
                <button className="nv-btn-register" onClick={() => navigate('/register')}>Register</button>
              </>
            )}

            {/* Hamburger */}
            <button
              className={`nv-hamburger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div className={`nv-drawer${menuOpen ? ' open' : ''}`} role="menu">
          {visibleLinks.map(({ label, path }) => (
            <button
              key={path}
              className={`nv-drawer-link${isActive(path) ? ' active' : ''}`}
              onClick={() => navigate(path)}
              role="menuitem"
            >
              {label}
            </button>
          ))}
          {!user && (
            <div className="nv-drawer-actions">
              <button className="nv-btn-login"    onClick={() => navigate('/login')}>Login</button>
              <button className="nv-btn-register" onClick={() => navigate('/register')}>Register</button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
