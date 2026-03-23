import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FOOTER_LINKS = {
  Explore: [
    { label: 'Browse Books',   path: '/books'       },
    { label: 'Book Clubs',     path: '/clubs'       },
    { label: 'Leaderboard',    path: '/leaderboard' },
  ],
  Account: [
    { label: 'My Books',     path: '/my-books'     },
    { label: 'My Orders',    path: '/my-orders'    },
    { label: 'My Exchanges', path: '/my-exchanges' },
    { label: 'Post a Book',  path: '/add-book'     },
  ],
};

const Footer = () => {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .ft-root *, .ft-root *::before, .ft-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ft-root {
          position: relative;
          font-family: 'DM Sans', sans-serif;
          background: #020d10;
          overflow: hidden;
        }

        /* ── Botanical SVG top-edge ── */
        .ft-scene {
          display: block;
          width: 100%; height: auto;
          margin-bottom: -4px;
          pointer-events: none;
        }

        /* ── Teal ambient glow strips ── */
        .ft-glow-strip {
          position: absolute;
          left: 0; right: 0;
          pointer-events: none;
        }
        .ft-glow-strip.top {
          top: 100px; height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(5,124,133,0.18) 30%, rgba(5,124,133,0.18) 70%, transparent 100%);
        }

        /* ── Main footer body ── */
        .ft-body {
          position: relative; z-index: 2;
          max-width: 1200px; margin: 0 auto;
          padding: 48px 32px 0;
        }

        /* ── Top grid ── */
        .ft-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 48px;
          padding-bottom: 48px;
          border-bottom: 1px solid rgba(5,124,133,0.15);
        }

        /* Brand column */
        .ft-brand { display: flex; flex-direction: column; gap: 16px; }

        .ft-brand-logo {
          display: flex; align-items: center; gap: 9px; cursor: pointer;
          width: fit-content;
        }
        .ft-brand-dot {
          width: 9px; height: 9px; border-radius: 50%;
          background: #057c85;
          box-shadow: 0 0 8px 2px rgba(5,124,133,0.6);
          animation: ftPulse 2.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes ftPulse {
          0%,100%{ box-shadow: 0 0 5px 1px rgba(5,124,133,0.4); }
          50%    { box-shadow: 0 0 12px 3px rgba(5,160,175,0.85); }
        }
        .ft-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700;
          color: #c8f0ec;
        }
        .ft-brand-name em { font-style: italic; color: #057c85; }

        .ft-tagline {
          font-size: 14px; font-weight: 300;
          color: rgba(140,215,210,0.55);
          line-height: 1.65; max-width: 280px;
        }

        /* Social / badge row */
        .ft-socials {
          display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px;
        }
        .ft-social-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 14px;
          background: rgba(5,124,133,0.1);
          border: 1px solid rgba(5,124,133,0.25);
          border-radius: 50px;
          color: rgba(140,215,210,0.7);
          font-size: 12.5px; font-weight: 400;
          cursor: pointer; text-decoration: none;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .ft-social-btn:hover {
          background: rgba(5,124,133,0.22);
          border-color: rgba(5,160,175,0.45);
          color: #9ee8e2;
        }

        /* CTA pill */
        .ft-cta {
          display: inline-flex; align-items: center; gap: 8px;
          margin-top: 6px; padding: 10px 20px;
          background: #057c85; color: #d0f5f2;
          border: none; border-radius: 50px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          box-shadow: 0 4px 16px rgba(5,124,133,0.4);
          width: fit-content;
        }
        .ft-cta:hover { background: #069aaa; transform: translateY(-1px); }

        /* Link columns */
        .ft-col { display: flex; flex-direction: column; gap: 6px; }

        .ft-col-title {
          font-size: 11px; font-weight: 500;
          color: #057c85; letter-spacing: 2.5px;
          text-transform: uppercase; margin-bottom: 10px;
        }
        .ft-col-link {
          background: none; border: none;
          color: rgba(140,210,205,0.6);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 300;
          padding: 4px 0; text-align: left; cursor: pointer;
          transition: color 0.2s, transform 0.2s;
          display: flex; align-items: center; gap: 6px;
          width: fit-content;
        }
        .ft-col-link::before {
          content: '';
          width: 0; height: 1px; background: #057c85;
          transition: width 0.25s ease;
          display: inline-block;
        }
        .ft-col-link:hover {
          color: #9ee8e2;
          transform: translateX(4px);
        }
        .ft-col-link:hover::before { width: 10px; }

        /* ── Stats band ── */
        .ft-stats {
          display: flex; gap: 0;
          padding: 28px 0;
          border-bottom: 1px solid rgba(5,124,133,0.12);
        }
        .ft-stat {
          flex: 1; text-align: center;
          padding: 0 24px;
          border-right: 1px solid rgba(5,124,133,0.12);
        }
        .ft-stat:last-child { border-right: none; }
        .ft-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 700;
          color: #057c85; line-height: 1;
          margin-bottom: 4px;
        }
        .ft-stat-label {
          font-size: 12px; font-weight: 300;
          color: rgba(140,210,205,0.5);
          letter-spacing: 0.5px;
        }

        /* ── Bottom bar ── */
        .ft-bottom {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
          padding: 20px 0 28px;
        }
        .ft-copy {
          font-size: 12.5px; color: rgba(120,190,185,0.4);
          font-weight: 300;
        }
        .ft-copy strong { color: rgba(150,220,215,0.6); font-weight: 400; }

        .ft-bottom-links {
          display: flex; gap: 20px;
        }
        .ft-bottom-link {
          font-size: 12px; color: rgba(120,190,185,0.35);
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s;
          padding: 0;
        }
        .ft-bottom-link:hover { color: rgba(140,215,210,0.65); }

        /* ── Animated leaf particles ── */
        .ft-particle {
          position: absolute;
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(5,124,133,0.35);
          pointer-events: none;
          animation: ftFloat var(--dur) var(--delay) ease-in-out infinite alternate;
        }
        @keyframes ftFloat {
          0%   { transform: translateY(0)   scale(1);    opacity: 0.35; }
          100% { transform: translateY(-18px) scale(1.3); opacity: 0.7;  }
        }

        /* ── Responsive ── */
        @media (max-width: 860px) {
          .ft-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          .ft-brand { grid-column: 1 / -1; }
          .ft-stats { gap: 0; }
          .ft-stat-num { font-size: 22px; }
        }
        @media (max-width: 540px) {
          .ft-body { padding: 32px 20px 0; }
          .ft-grid { grid-template-columns: 1fr; gap: 28px; }
          .ft-stats { flex-wrap: wrap; }
          .ft-stat { min-width: 50%; border-right: none; padding: 12px 0; border-bottom: 1px solid rgba(5,124,133,0.1); }
          .ft-stat:last-child { border-bottom: none; }
          .ft-bottom { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
      `}</style>

      <footer className="ft-root" role="contentinfo">

        {/* Animated ambient particles */}
        {[
          { left:'8%',  top:'30%', dur:'4s',  delay:'0s'    },
          { left:'22%', top:'55%', dur:'5.5s',delay:'-2s'   },
          { left:'45%', top:'20%', dur:'6s',  delay:'-1s'   },
          { left:'67%', top:'45%', dur:'4.8s',delay:'-3s'   },
          { left:'85%', top:'35%', dur:'5.2s',delay:'-1.5s' },
          { left:'92%', top:'60%', dur:'6.5s',delay:'-4s'   },
        ].map((p, i) => (
          <div
            key={i}
            className="ft-particle"
            style={{ left:p.left, top:p.top, '--dur':p.dur, '--delay':p.delay }}
          />
        ))}

        {/* Botanical top edge SVG */}
        <svg
          className="ft-scene"
          viewBox="0 0 1440 140"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Sky-to-ground fade */}
          <rect x="0" y="0" width="1440" height="140" fill="#020d10" />

          {/* Background silhouette hills */}
          <ellipse cx="200"  cy="160" rx="260" ry="90"  fill="#041c22" opacity="0.9" />
          <ellipse cx="600"  cy="170" rx="320" ry="100" fill="#031518" opacity="0.95" />
          <ellipse cx="1000" cy="160" rx="290" ry="88"  fill="#041c22" opacity="0.9" />
          <ellipse cx="1380" cy="170" rx="220" ry="80"  fill="#031518" opacity="0.95" />

          {/* Grass blades left cluster */}
          <path d="M40 140 C42 118 38 98 46 78"   stroke="#1a7a38" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M55 140 C58 115 54 92 63 70"   stroke="#057c85" strokeWidth="2"   fill="none" strokeLinecap="round" opacity="0.8" />
          <path d="M68 140 C65 118 70 96 66 75"   stroke="#1a7a38" strokeWidth="2"   fill="none" strokeLinecap="round" />
          <path d="M80 140 C83 116 79 95 87 74"   stroke="#0a6a48" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.85" />
          <path d="M92 140 C90 120 95 100 91 80"  stroke="#057c85" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7" />

          {/* Grass centre */}
          <path d="M680 140 C683 116 679 94 687 72" stroke="#1a7a38" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M696 140 C699 114 695 90 703 68" stroke="#057c85" strokeWidth="2"   fill="none" strokeLinecap="round" opacity="0.75" />
          <path d="M712 140 C709 118 714 96 710 75" stroke="#1a7a38" strokeWidth="2"   fill="none" strokeLinecap="round" />
          <path d="M726 140 C730 116 726 94 734 72" stroke="#0a6a48" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.8" />
          <path d="M740 140 C737 120 742 98 738 77" stroke="#057c85" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M754 140 C757 116 753 92 761 70" stroke="#1a7a38" strokeWidth="2"   fill="none" strokeLinecap="round" />

          {/* Grass right cluster */}
          <path d="M1360 140 C1358 118 1362 96 1358 74" stroke="#1a7a38" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M1375 140 C1378 115 1374 92 1382 70" stroke="#057c85" strokeWidth="2"   fill="none" strokeLinecap="round" opacity="0.8" />
          <path d="M1390 140 C1387 118 1392 96 1388 75" stroke="#1a7a38" strokeWidth="2"   fill="none" strokeLinecap="round" />
          <path d="M1404 140 C1407 116 1403 95 1411 73" stroke="#0a6a48" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.85" />

          {/* Left small tree */}
          <path d="M150 140 C149 118 148 100 150 82" stroke="#0c4828" strokeWidth="8" fill="none" strokeLinecap="round" />
          <ellipse cx="150" cy="65" rx="38" ry="28" fill="#0d5c2e" opacity="0.85" />
          <ellipse cx="150" cy="58" rx="28" ry="20" fill="#0a5c50" opacity="0.4"  />

          {/* Right small tree */}
          <path d="M1290 140 C1291 118 1292 100 1290 82" stroke="#0c4828" strokeWidth="8" fill="none" strokeLinecap="round" />
          <ellipse cx="1290" cy="65" rx="38" ry="28" fill="#0d5c2e" opacity="0.85" />
          <ellipse cx="1290" cy="58" rx="28" ry="20" fill="#0a5c50" opacity="0.4"  />

          {/* Mid trees */}
          <path d="M450 140 C449 124 448 110 450 96" stroke="#0c4828" strokeWidth="6" fill="none" strokeLinecap="round" />
          <ellipse cx="450" cy="82" rx="30" ry="22" fill="#0e5c2c" opacity="0.8" />

          <path d="M990 140 C991 124 992 110 990 96" stroke="#0c4828" strokeWidth="6" fill="none" strokeLinecap="round" />
          <ellipse cx="990" cy="82" rx="30" ry="22" fill="#0e5c2c" opacity="0.8" />

          {/* Ferns */}
          <path d="M320 140 C312 126 304 118 297 110" stroke="#126840" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M320 140 C322 124 320 112 318 100" stroke="#057c85" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.65" />
          <path d="M320 140 C328 126 334 118 339 110" stroke="#126840" strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="295" cy="108" rx="10" ry="5" fill="#0f6038" opacity="0.7" transform="rotate(-35 295 108)" />
          <ellipse cx="340" cy="108" rx="10" ry="5" fill="#0f6038" opacity="0.7" transform="rotate(35 340 108)"  />

          <path d="M1120 140 C1112 126 1104 118 1097 110" stroke="#126840" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M1120 140 C1122 124 1120 112 1118 100" stroke="#057c85" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.65" />
          <path d="M1120 140 C1128 126 1134 118 1139 110" stroke="#126840" strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="1095" cy="108" rx="10" ry="5" fill="#0f6038" opacity="0.7" transform="rotate(-35 1095 108)" />
          <ellipse cx="1140" cy="108" rx="10" ry="5" fill="#0f6038" opacity="0.7" transform="rotate(35 1140 108)"  />

          {/* Floating spores */}
          <circle cx="350" cy="60" r="2" fill="rgba(5,180,190,0.3)">
            <animate attributeName="cy" values="60;44;60" dur="7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.65;0.3" dur="7s" repeatCount="indefinite" />
          </circle>
          <circle cx="720" cy="40" r="1.8" fill="rgba(5,160,175,0.28)">
            <animate attributeName="cy" values="40;26;40" dur="9s" begin="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.28;0.6;0.28" dur="9s" begin="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="1090" cy="55" r="2" fill="rgba(5,180,190,0.28)">
            <animate attributeName="cy" values="55;40;55" dur="8s" begin="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.28;0.62;0.28" dur="8s" begin="1s" repeatCount="indefinite" />
          </circle>

          {/* Teal ground glow */}
          <ellipse cx="720" cy="145" rx="500" ry="30" fill="rgba(5,124,133,0.08)" />
        </svg>

        <div className="ft-glow-strip top" />

        {/* ── Footer body ── */}
        <div className="ft-body">

          {/* Top grid */}
          <div className="ft-grid">

            {/* Brand column */}
            <div className="ft-brand">
              <div className="ft-brand-logo" onClick={() => navigate('/')}>
                <div className="ft-brand-dot" />
                <span className="ft-brand-name">Book<em>Nest</em></span>
              </div>

              <p className="ft-tagline">
                A living marketplace for books — buy, sell, rent and exchange with readers around you. Every book finds its next home.
              </p>

              <div className="ft-socials">
                <a className="ft-social-btn" href="https://github.com/Oshimataru" target="_blank" rel="noopener noreferrer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                  GitHub
                </a>
                <div className="ft-social-btn" style={{ cursor:'default' }}>
                  🌿 Built with love
                </div>
              </div>

              {!user && (
                <button className="ft-cta" onClick={() => navigate('/register')}>
                  🌱 Join BookNest — it's free
                </button>
              )}
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([section, links]) => (
              <div key={section} className="ft-col">
                <p className="ft-col-title">{section}</p>
                {links.map(({ label, path }) => (
                  <button
                    key={path}
                    className="ft-col-link"
                    onClick={() => navigate(path)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Stats band */}
          <div className="ft-stats">
            {[
              { num: '10K+',  label: 'Books listed'    },
              { num: '3.2K+', label: 'Active readers'  },
              { num: '850+',  label: 'Exchanges done'  },
              { num: '120+',  label: 'Book clubs'      },
            ].map(({ num, label }) => (
              <div key={label} className="ft-stat">
                <div className="ft-stat-num">{num}</div>
                <div className="ft-stat-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="ft-bottom">
            <p className="ft-copy">
              © {year} <strong>BookNest</strong> — Where stories grow wild.
            </p>
            <div className="ft-bottom-links">
              <button className="ft-bottom-link">Privacy Policy</button>
              <button className="ft-bottom-link">Terms of Use</button>
              <button className="ft-bottom-link">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
