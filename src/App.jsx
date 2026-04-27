import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { HOME_API_ROOT } from './config/api';

import Navbar             from './components/Navbar';
import Footer             from './components/Footer';
import Login              from './pages/Login';
import Register           from './pages/Register';
import Contact            from './pages/Contact';
import TermsAndConditions from './pages/TermsAndConditions';
import MyTickets          from './pages/MyTickets';
import Books              from './pages/Books';
import AddBook            from './pages/AddBook';
import BookDetail         from './pages/BookDetail';
import Checkout           from './pages/Checkout';
import MyOrders           from './pages/MyOrders';
import TrackOrder         from './pages/TrackOrder';
import AdminDashboard     from './pages/AdminDashboard';
import Exchange           from './pages/Exchange';
import MyExchanges        from './pages/MyExchanges';
import Leaderboard        from './pages/Leaderboard';
import MyBooks            from './pages/MyBooks';
import BookClubs          from './pages/BookClubs';
import ClubDetail         from './pages/ClubDetail';
import EditBook           from './pages/EditBook';

import './styles/Auth.css';
import './styles/Global.css';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

/* ── Animated Counter ── */
const Counter = ({ to }) => {
    const [n, setN] = useState(0);
    const ref = useRef(null);
    const done = useRef(false);
    useEffect(() => {
        const num = parseInt(String(to ?? 0).replace(/\D/g, '')) || 0;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !done.current) {
                done.current = true;
                let cur = 0;
                const step = Math.ceil(num / 60);
                const t = setInterval(() => {
                    cur += step;
                    if (cur >= num) { setN(num); clearInterval(t); }
                    else setN(cur);
                }, 20);
            }
        }, { threshold: 0.3 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [to]);
    return <span ref={ref}>{n.toLocaleString()}</span>;
};

/* ══════════════════════════════════════════════════════
   INTRO ANIMATION
══════════════════════════════════════════════════════ */
const BookIntro = ({ onDone }) => {
    const [phase, setPhase] = useState('idle');

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('open'),   400);
        const t2 = setTimeout(() => setPhase('pages'),  1500);
        const t3 = setTimeout(() => setPhase('reveal'), 2900);
        const t4 = setTimeout(() => setPhase('done'),   3600);
        const t5 = setTimeout(() => onDone(),           4200);
        return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
    }, [onDone]);

    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;1,400&family=Inter:wght@300;400&display=swap');
        @keyframes iOut   { to { opacity:0; transform:scale(1.02); } }
        @keyframes iCoverL{ to { transform:perspective(1200px) rotateY(-162deg); } }
        @keyframes iP1    { 0%,20%{transform:perspective(1200px) rotateY(0)} to{transform:perspective(1200px) rotateY(-158deg)} }
        @keyframes iP2    { 0%,35%{transform:perspective(1200px) rotateY(0)} to{transform:perspective(1200px) rotateY(-158deg)} }
        @keyframes iP3    { 0%,50%{transform:perspective(1200px) rotateY(0)} to{transform:perspective(1200px) rotateY(-158deg)} }
        @keyframes iTitleUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes iSubUp   { from{opacity:0;transform:translateY(8px)}  to{opacity:0.45;transform:none} }
        @keyframes iGlow    { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.8;transform:scale(1.1)} }
        @keyframes iRing    { to{transform:rotate(360deg)} }
    `;

    const isDone   = phase === 'done';
    const isOpen   = ['open','pages','reveal','done'].includes(phase);
    const isPages  = ['pages','reveal','done'].includes(phase);
    const isReveal = ['reveal','done'].includes(phase);

    return (
        <div style={{
            position:'fixed', inset:0, zIndex:9999,
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            background:'#000',
            animation: isDone ? 'iOut .7s .2s ease forwards' : 'none',
        }}>
            <style>{css}</style>

            {/* amber glow orbs */}
            <div style={{ position:'absolute', width:'500px', height:'400px', top:'-80px', left:'-80px',
                background:'radial-gradient(ellipse,rgba(255,193,7,0.08) 0%,transparent 70%)',
                filter:'blur(60px)', animation:'iGlow 6s ease-in-out infinite', pointerEvents:'none' }}/>
            <div style={{ position:'absolute', width:'400px', height:'350px', bottom:'-80px', right:'-80px',
                background:'radial-gradient(ellipse,rgba(255,193,7,0.06) 0%,transparent 70%)',
                filter:'blur(70px)', animation:'iGlow 8s ease-in-out infinite 2s', pointerEvents:'none' }}/>

            {/* subtle grid */}
            <div style={{
                position:'absolute', inset:0, pointerEvents:'none',
                backgroundImage:'linear-gradient(rgba(255,193,7,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,193,7,.025) 1px,transparent 1px)',
                backgroundSize:'60px 60px',
            }}/>

            {isOpen && (
                <div style={{
                    position:'absolute', width:'420px', height:'420px', borderRadius:'50%',
                    top:'50%', left:'50%', marginTop:'-260px', marginLeft:'-210px',
                    border:'1px solid rgba(255,193,7,0.08)',
                    animation:'iRing 30s linear infinite', pointerEvents:'none',
                }}/>
            )}

            {/* THE BOOK */}
            <div style={{ position:'relative', width:'180px', height:'250px', transformStyle:'preserve-3d', marginBottom:'52px' }}>
                {/* back */}
                <div style={{
                    position:'absolute', inset:0,
                    background:'#0a0a0a',
                    borderRadius:'3px 10px 10px 3px',
                    border:'1px solid #1a1a1a',
                    boxShadow:'0 40px 80px rgba(0,0,0,.9)',
                }}/>

                {/* pages */}
                {[
                    { bg:'rgba(230,228,220,0.96)', z:7, anim: isPages ? 'iP1 .7s .05s cubic-bezier(0.4,0,0.2,1) forwards' : 'none' },
                    { bg:'rgba(215,213,205,0.96)', z:6, anim: isPages ? 'iP2 .7s .25s cubic-bezier(0.4,0,0.2,1) forwards' : 'none' },
                    { bg:'rgba(200,198,192,0.96)', z:5, anim: isPages ? 'iP3 .7s .45s cubic-bezier(0.4,0,0.2,1) forwards' : 'none' },
                ].map((pg, i) => (
                    <div key={i} style={{ position:'absolute', inset:'2px 0 2px 4px', transformOrigin:'left center', animation:pg.anim, zIndex:pg.z }}>
                        <div style={{ position:'absolute', inset:0, background:pg.bg, boxShadow:'2px 0 10px rgba(0,0,0,.35)' }}/>
                    </div>
                ))}

                {/* front cover */}
                <div style={{
                    position:'absolute', inset:0, transformOrigin:'left center', transformStyle:'preserve-3d',
                    animation: isOpen ? 'iCoverL 1.1s .1s cubic-bezier(0.4,0,0.2,1) forwards' : 'none',
                    zIndex:10,
                }}>
                    <div style={{
                        position:'absolute', inset:0,
                        background:'#0a0a0a',
                        borderRadius:'3px 10px 10px 3px',
                        border:'1px solid rgba(255,193,7,0.2)',
                        backfaceVisibility:'hidden',
                        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                        overflow:'hidden',
                    }}>
                        <div style={{position:'absolute', inset:'8px', border:'1px solid rgba(255,193,7,0.07)', borderRadius:'6px'}}/>
                        <div style={{
                            fontFamily:"'Fraunces',serif", fontSize:'22px', fontStyle:'italic',
                            color:'rgba(255,255,255,0.9)', textAlign:'center', lineHeight:'1.2', padding:'0 16px',
                        }}>BookNest</div>
                        <div style={{ width:'36px', height:'1px', margin:'10px auto', background:'rgba(255,193,7,0.3)' }}/>
                        <div style={{ fontSize:'8px', letterSpacing:'3px', textTransform:'uppercase', color:'rgba(255,193,7,0.4)', fontFamily:"'Inter',sans-serif" }}>Est. 2024</div>
                    </div>
                </div>
            </div>

            {/* reveal title */}
            <div style={{
                textAlign:'center',
                animation: isReveal ? 'iTitleUp .9s .1s ease forwards' : 'none',
                opacity:0,
            }}>
                <div style={{
                    fontFamily:"'Fraunces',serif", fontSize:'32px', fontStyle:'italic',
                    color:'rgba(255,255,255,.92)',
                    marginBottom:'12px',
                }}>Welcome to BookNest</div>
                <div style={{
                    fontFamily:"'Inter',sans-serif", fontWeight:'300',
                    fontSize:'10px', letterSpacing:'5px', textTransform:'uppercase',
                    animation: isReveal ? 'iSubUp .9s .3s ease forwards' : 'none',
                    opacity:0, color:'rgba(255,193,7,0.5)',
                }}>Your story begins here</div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════ */
const Home = () => {
    const nav = useNavigate();
    const { user } = useAuth();
    const [introShown] = useState(() => sessionStorage.getItem('bn_intro') === '1');
    const [introDone,  setIntroDone]  = useState(introShown);
    const [stats,   setStats]   = useState(null);
    const [feat,    setFeat]    = useState(null);
    const [books,   setBooks]   = useState([]);
    const [genres,  setGenres]  = useState([]);
    const [reviews, setReviews] = useState([]);
    const [clubs,   setClubs]   = useState([]);

    const handleIntroDone = useCallback(() => {
        sessionStorage.setItem('bn_intro', '1');
        setIntroDone(true);
    }, []);

    useEffect(() => {
        Promise.all([
            axios.post(`${HOME_API_ROOT}/stats`),
            axios.post(`${HOME_API_ROOT}/featured`),
            axios.post(`${HOME_API_ROOT}/books`),
            axios.post(`${HOME_API_ROOT}/genres`),
            axios.post(`${HOME_API_ROOT}/reviews`),
            axios.post(`${HOME_API_ROOT}/clubs`),
        ]).then(([s, f, b, g, r, c]) => {
            setStats(s.data); setFeat(f.data);
            setBooks(b.data); setGenres(g.data);
            setReviews(r.data); setClubs(c.data);
        }).catch(console.error);
    }, []);

    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Fraunces:ital,wght@0,700;1,400&display=swap');

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        :root {
            --bg:       #000000;
            --surface:  #0a0a0a;
            --surface2: #111111;
            --border:   #1a1a1a;
            --amber:    #FFC107;
            --amber-dim: rgba(255,193,7,0.4);
            --amber-glow: rgba(255,193,7,0.12);
            --white:    rgba(255,255,255,0.92);
            --muted:    rgba(255,255,255,0.45);
            --dim:      rgba(255,255,255,0.18);
        }

        @keyframes fadeUp     { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
        @keyframes float      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes floatAlt   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes glowPulse  { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.75;transform:scale(1.06)} }
        @keyframes spinRing   { to{transform:rotate(360deg)} }
        @keyframes revRing    { to{transform:rotate(-360deg)} }
        @keyframes shimmer    { 0%{background-position:0% center} 100%{background-position:300% center} }
        @keyframes cardGlow   { 0%,100%{box-shadow:0 0 0 1px rgba(255,193,7,0.15)} 50%{box-shadow:0 0 0 1px rgba(255,193,7,0.35),0 0 40px rgba(255,193,7,0.06)} }

        .hn-book-card {
            transition: transform .35s cubic-bezier(.23,1,.32,1), border-color .25s, box-shadow .35s;
            cursor: pointer;
        }
        .hn-book-card:hover {
            transform: translateY(-12px) scale(1.02) !important;
            border-color: rgba(255,193,7,0.2) !important;
            box-shadow: 0 28px 56px rgba(0,0,0,.7), 0 0 0 1px rgba(255,193,7,0.15) !important;
            animation: cardGlow 2s infinite !important;
        }
        .hn-book-card:hover .hn-card-reveal { opacity:1 !important; transform:translateY(0) !important; }
        .hn-book-card:hover .hn-card-img    { transform:scale(1.07) !important; }

        .hn-btn-primary {
            background: #FFC107;
            border: none;
            color: #000;
            font-weight: 600;
            transition: background .2s, transform .15s, box-shadow .2s;
        }
        .hn-btn-primary:hover {
            background: #ffd54f;
            transform: translateY(-2px);
            box-shadow: 0 8px 28px rgba(255,193,7,0.3);
        }
        .hn-btn-primary:active { transform: scale(0.98); }

        .hn-btn-outline {
            background: transparent;
            border: 1px solid #222;
            color: rgba(255,255,255,0.5);
            transition: all .2s;
        }
        .hn-btn-outline:hover {
            background: #111;
            border-color: rgba(255,193,7,0.2);
            color: rgba(255,255,255,0.8);
        }

        .hn-genre-chip {
            background: #0a0a0a;
            border: 1px solid #1a1a1a;
            color: rgba(255,255,255,0.45);
            transition: all .2s;
            cursor: pointer;
        }
        .hn-genre-chip:hover {
            background: rgba(255,193,7,0.08) !important;
            border-color: rgba(255,193,7,0.2) !important;
            color: rgba(255,193,7,0.85) !important;
            transform: translateY(-2px);
        }

        .hn-club-row {
            border-left: 3px solid transparent;
            transition: all .2s;
            cursor: pointer;
        }
        .hn-club-row:hover {
            background: rgba(255,193,7,0.04) !important;
            border-left-color: #FFC107 !important;
        }

        .hn-rv-card {
            transition: transform .25s, border-color .25s;
        }
        .hn-rv-card:hover {
            transform: translateY(-6px) !important;
            border-color: rgba(255,193,7,0.18) !important;
        }

        .hn-stat-cell { transition: background .2s; cursor: default; }
        .hn-stat-cell:hover { background: rgba(255,255,255,0.03) !important; }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: rgba(255,193,7,0.2); border-radius: 2px; }
        ::selection { background: rgba(255,193,7,0.15); }
    `;

    const TYPE_COLOR = { SELL: '#FFC107', RENT: '#7eb8f7', EXCHANGE: '#b8a9f7' };

    return (
        <>
            {!introDone && <BookIntro onDone={handleIntroDone} />}
            <style>{css}</style>

            <div style={{
                background: 'var(--bg)', color: 'var(--white)',
                minHeight: '100vh',
                fontFamily: "'Inter', sans-serif",
                overflowX: 'hidden',
                opacity: introDone ? 1 : 0,
                transition: 'opacity .8s ease',
                position: 'relative',
            }}>

                {/* ── AMBIENT LAYER ── */}
                <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:1, overflow:'hidden' }}>
                    <div style={{
                        position:'absolute', width:'700px', height:'500px', top:'-150px', left:'-150px',
                        background:'radial-gradient(ellipse, rgba(255,193,7,0.07) 0%, transparent 65%)',
                        filter:'blur(80px)', animation:'glowPulse 14s ease-in-out infinite',
                    }}/>
                    <div style={{
                        position:'absolute', width:'600px', height:'450px', bottom:'-100px', right:'-100px',
                        background:'radial-gradient(ellipse, rgba(255,193,7,0.05) 0%, transparent 65%)',
                        filter:'blur(90px)', animation:'glowPulse 18s ease-in-out infinite 5s',
                    }}/>
                    <div style={{
                        position:'absolute', inset:0,
                        backgroundImage:
                            'linear-gradient(rgba(255,193,7,.018) 1px, transparent 1px),' +
                            'linear-gradient(90deg, rgba(255,193,7,.018) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}/>
                </div>

                {/* ════════ HERO ════════ */}
                <section style={{
                    position: 'relative', zIndex: 10,
                    minHeight: '100vh',
                    display: 'grid', gridTemplateColumns: '1.1fr 0.9fr',
                    alignItems: 'center',
                    padding: 'clamp(80px,10vw,120px) clamp(36px,6vw,96px)',
                    gap: '72px',
                }}>
                    {/* LEFT */}
                    <div style={{ animation: 'fadeUp 0.8s 0.1s ease both' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '10px',
                            marginBottom: '28px', padding: '7px 16px',
                            background: 'rgba(255,193,7,0.07)',
                            border: '1px solid rgba(255,193,7,0.15)',
                            borderRadius: '100px',
                        }}>
                            <div style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: '#FFC107',
                                boxShadow: '0 0 8px rgba(255,193,7,0.8)',
                                animation: 'glowPulse 2s ease-in-out infinite',
                            }}/>
                            <span style={{
                                fontFamily: "'Inter',sans-serif", fontSize: '10px',
                                fontWeight: '500', letterSpacing: '3px', textTransform: 'uppercase',
                                color: 'rgba(255,193,7,0.65)',
                            }}>A Library in Your Hands</span>
                        </div>

                        <h1 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(48px,7vw,88px)',
                            fontWeight: '700', lineHeight: '1.02',
                            letterSpacing: '-1px', marginBottom: '24px',
                        }}>
                            {user ? (
                                <>
                                    <span style={{
                                        display: 'block', color: 'rgba(255,255,255,.28)',
                                        fontStyle: 'italic', fontWeight: '400',
                                        fontSize: '.46em', letterSpacing: '.5px', marginBottom: '4px',
                                    }}>Welcome back,</span>
                                    <span style={{
                                        display: 'block',
                                        background: 'linear-gradient(120deg, #FFC107 0%, #fff 50%, #FFC107 100%)',
                                        backgroundSize: '300% auto',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        animation: 'shimmer 5s linear infinite',
                                    }}>{user.name || user.username || 'Reader'}</span>
                                    <span style={{ display: 'block', color: 'rgba(255,255,255,.88)' }}>Your shelf</span>
                                    <span style={{ display: 'block', fontStyle: 'italic', color: 'rgba(255,255,255,.25)', fontWeight: '400' }}>awaits.</span>
                                </>
                            ) : (
                                <>
                                    <span style={{
                                        display: 'block',
                                        background: 'linear-gradient(120deg, #FFC107 0%, #fff 40%, #FFC107 100%)',
                                        backgroundSize: '300% auto',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        animation: 'shimmer 5s linear infinite',
                                    }}>Every book</span>
                                    <span style={{ display: 'block', color: 'rgba(255,255,255,.88)' }}>deserves</span>
                                    <span style={{ display: 'block', fontStyle: 'italic', color: 'rgba(255,255,255,.25)', fontWeight: '400' }}>a new reader.</span>
                                </>
                            )}
                        </h1>

                        <p style={{
                            fontSize: '15px', fontWeight: '300',
                            color: 'rgba(255,255,255,.38)', lineHeight: '1.9',
                            maxWidth: '400px', marginBottom: '44px',
                        }}>
                            {feat?.desc || 'Discover, trade and exchange pre-loved books with a community that lives and breathes literature.'}
                        </p>

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button className="hn-btn-primary" onClick={() => nav('/books')} style={{
                                padding: '13px 36px', borderRadius: '10px',
                                fontFamily: "'Inter',sans-serif", fontSize: '12px',
                                letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer',
                            }}>Explore Books</button>

                            {user ? (
                                <button className="hn-btn-outline" onClick={() => nav('/add-book')} style={{
                                    padding: '13px 36px', borderRadius: '10px',
                                    fontFamily: "'Inter',sans-serif", fontSize: '12px',
                                    letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer',
                                }}>+ List a Book</button>
                            ) : (
                                <button className="hn-btn-outline" onClick={() => nav('/register')} style={{
                                    padding: '13px 36px', borderRadius: '10px',
                                    fontFamily: "'Inter',sans-serif", fontSize: '12px',
                                    letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer',
                                }}>Join Free</button>
                            )}
                        </div>

                        {stats && (
                            <div style={{
                                display: 'flex', gap: '40px',
                                marginTop: '52px', paddingTop: '32px',
                                borderTop: '1px solid #1a1a1a',
                            }}>
                                {[
                                    { label: 'Books',   val: stats.books  },
                                    { label: 'Readers', val: stats.users  },
                                    { label: 'Trades',  val: stats.trades },
                                ].map((s, i) => (
                                    <div key={i}>
                                        <div style={{
                                            fontFamily: "'Fraunces',serif",
                                            fontSize: 'clamp(32px,4vw,48px)', lineHeight: 1,
                                            color: '#FFC107',
                                        }}><Counter to={s.val} /></div>
                                        <div style={{
                                            fontSize: '10px', letterSpacing: '2.5px',
                                            textTransform: 'uppercase', color: 'rgba(255,255,255,.2)',
                                            marginTop: '6px',
                                        }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT — featured card */}
                    <div style={{
                        position: 'relative', display: 'flex',
                        justifyContent: 'center', alignItems: 'center',
                        minHeight: '480px', animation: 'fadeIn 1s .3s ease both',
                    }}>
                        <div style={{
                            position: 'absolute', width: '320px', height: '320px', borderRadius: '50%',
                            border: '1px solid rgba(255,193,7,0.06)',
                            animation: 'spinRing 55s linear infinite',
                        }}>
                            {[0, 72, 144, 216, 288].map((deg, i) => (
                                <div key={i} style={{
                                    position: 'absolute', width: '4px', height: '4px', borderRadius: '50%',
                                    background: 'rgba(255,193,7,0.5)',
                                    top: '50%', left: '50%',
                                    transform: `rotate(${deg}deg) translateX(159px) translateY(-2px)`,
                                    boxShadow: '0 0 5px rgba(255,193,7,0.4)',
                                }}/>
                            ))}
                        </div>
                        <div style={{
                            position: 'absolute', width: '220px', height: '220px', borderRadius: '50%',
                            border: '1px dashed rgba(255,193,7,0.04)',
                            animation: 'revRing 38s linear infinite',
                        }}/>

                        {feat && (
                            <div
                                onClick={() => feat.id && nav(`/books/${feat.id}`)}
                                style={{
                                    width: '256px',
                                    background: '#0a0a0a',
                                    border: '1px solid #1a1a1a',
                                    borderRadius: '18px', overflow: 'hidden',
                                    cursor: feat.id ? 'pointer' : 'default',
                                    position: 'relative', zIndex: 4,
                                    animation: 'float 9s ease-in-out infinite',
                                    boxShadow: '0 40px 80px rgba(0,0,0,.8)',
                                    transition: 'border-color .2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,193,7,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}
                            >
                                {feat.image ? (
                                    <img src={feat.image} alt={feat.title} style={{ width: '100%', height: '175px', objectFit: 'cover', display: 'block' }}/>
                                ) : (
                                    <div style={{
                                        width: '100%', height: '175px',
                                        background: '#111',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px',
                                    }}>📚</div>
                                )}
                                <div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,193,7,0.2),transparent)' }}/>
                                <div style={{ padding: '18px' }}>
                                    <div style={{
                                        fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase',
                                        color: 'rgba(255,193,7,0.5)', marginBottom: '10px',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                    }}>
                                        <span style={{ width: '14px', height: '1px', background: 'rgba(255,193,7,0.4)', display: 'inline-block' }}/>
                                        Latest Drop
                                    </div>
                                    <h3 style={{
                                        fontFamily: "'Fraunces',serif", fontSize: '19px',
                                        fontStyle: 'italic', lineHeight: '1.25', marginBottom: '5px',
                                        color: 'rgba(255,255,255,.9)',
                                    }}>{feat.title}</h3>
                                    {feat.author && (
                                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.3)', marginBottom: '14px', fontWeight: '300' }}>
                                            by {feat.author}
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        {feat.genre && (
                                            <span style={{
                                                fontSize: '10px', padding: '3px 10px', borderRadius: '100px',
                                                background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.15)',
                                                color: 'rgba(255,193,7,0.65)', letterSpacing: '1px',
                                            }}>{feat.genre}</span>
                                        )}
                                        {feat.price != null && (
                                            <span style={{
                                                marginLeft: 'auto',
                                                fontFamily: "'Fraunces',serif",
                                                fontSize: '22px', color: '#FFC107',
                                            }}>₹{feat.price}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* floating stat badges */}
                        {stats && (
                            <>
                                <div style={{
                                    position: 'absolute', top: '24px', right: '-12px', zIndex: 5,
                                    background: '#0a0a0a', border: '1px solid #1a1a1a',
                                    borderRadius: '14px', padding: '12px 16px',
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    animation: 'floatAlt 5.5s ease-in-out infinite',
                                    boxShadow: '0 16px 40px rgba(0,0,0,.6)',
                                }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '8px',
                                        background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
                                    }}>📦</div>
                                    <div>
                                        <div style={{ fontFamily: "'Fraunces',serif", fontSize: '22px', lineHeight: 1, color: '#FFC107' }}>{stats.orders ?? 0}</div>
                                        <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginTop: '3px' }}>Orders</div>
                                    </div>
                                </div>

                                <div style={{
                                    position: 'absolute', bottom: '56px', left: '-20px', zIndex: 5,
                                    background: '#0a0a0a', border: '1px solid #1a1a1a',
                                    borderRadius: '14px', padding: '12px 16px',
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    animation: 'floatAlt 6.5s ease-in-out infinite 1.2s',
                                    boxShadow: '0 16px 40px rgba(0,0,0,.6)',
                                }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '8px',
                                        background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
                                    }}>🌿</div>
                                    <div>
                                        <div style={{ fontFamily: "'Fraunces',serif", fontSize: '22px', lineHeight: 1, color: '#FFC107' }}>{stats.clubs ?? 0}</div>
                                        <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginTop: '3px' }}>Clubs</div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* ════════ STATS BAR ════════ */}
                {stats && (
                    <section style={{
                        position: 'relative', zIndex: 10,
                        margin: '0 clamp(36px,6vw,96px) 72px',
                        borderRadius: '18px',
                        background: '#0a0a0a',
                        border: '1px solid #1a1a1a',
                        overflow: 'hidden',
                        animation: 'fadeUp .7s .2s ease both',
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)' }}>
                            {[
                                { icon: '📚', label: 'Books',   val: stats.books  },
                                { icon: '👥', label: 'Readers', val: stats.users  },
                                { icon: '🔄', label: 'Trades',  val: stats.trades },
                                { icon: '📦', label: 'Orders',  val: stats.orders },
                                { icon: '🌿', label: 'Clubs',   val: stats.clubs  },
                            ].map((s, i) => (
                                <div className="hn-stat-cell" key={i} style={{
                                    padding: '36px 20px', textAlign: 'center',
                                    borderRight: i < 4 ? '1px solid #1a1a1a' : 'none',
                                }}>
                                    <div style={{ fontSize: '18px', marginBottom: '10px', opacity: .5 }}>{s.icon}</div>
                                    <div style={{
                                        fontFamily: "'Fraunces',serif",
                                        fontSize: 'clamp(24px,3.5vw,42px)', lineHeight: 1,
                                        color: '#FFC107', marginBottom: '6px',
                                    }}><Counter to={s.val}/></div>
                                    <div style={{ fontSize: '9px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ════════ GENRES ════════ */}
                <section style={{ position: 'relative', zIndex: 10, padding: '0 clamp(36px,6vw,96px) 72px', animation: 'fadeUp .7s .25s ease both' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <p style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,193,7,0.35)', marginBottom: '10px' }}>Browse by</p>
                        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(28px,4vw,44px)', fontStyle: 'italic', color: 'var(--white)', lineHeight: 1.1 }}>Genres</h2>
                    </div>
                    {genres.length === 0 ? (
                        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>No genres yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
                            {genres.map((g, i) => (
                                <button
                                    className="hn-genre-chip"
                                    key={i}
                                    onClick={() => nav(`/books?genre=${encodeURIComponent(g.name)}`)}
                                    style={{
                                        padding: '10px 20px', borderRadius: '100px',
                                        fontFamily: "'Inter',sans-serif",
                                        fontSize: '13px', fontWeight: '300',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                    }}
                                >
                                    <span style={{ fontSize: '14px' }}>{g.emoji}</span>
                                    {g.name}
                                    <span style={{
                                        fontSize: '11px', color: 'rgba(255,255,255,.2)',
                                        background: 'rgba(255,255,255,.05)',
                                        padding: '1px 8px', borderRadius: '100px',
                                    }}>{g.count}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* ════════ BOOKS GRID ════════ */}
                <section style={{ position: 'relative', zIndex: 10, padding: '0 clamp(36px,6vw,96px) 72px', animation: 'fadeUp .7s .3s ease both' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <p style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,193,7,0.35)', marginBottom: '10px' }}>Catalogue</p>
                            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(28px,4vw,44px)', fontStyle: 'italic', color: 'var(--white)', lineHeight: 1.1 }}>All Books</h2>
                        </div>
                        <button className="hn-btn-outline" onClick={() => nav('/books')} style={{
                            padding: '9px 22px', borderRadius: '10px',
                            fontFamily: "'Inter',sans-serif", fontSize: '11px',
                            letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer',
                        }}>View All →</button>
                    </div>

                    {books.length === 0 ? (
                        <div style={{
                            border: '1px dashed #1a1a1a', borderRadius: '18px',
                            padding: '64px 24px', textAlign: 'center',
                            color: 'var(--muted)', fontSize: '14px',
                            background: '#0a0a0a',
                        }}>No books yet — be the first to add one!</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(188px,1fr))', gap: '14px' }}>
                            {books.map((bk, i) => (
                                <div className="hn-book-card" key={bk.id || i} onClick={() => nav(`/books/${bk.id}`)} style={{
                                    background: '#0a0a0a',
                                    border: '1px solid #1a1a1a',
                                    borderRadius: '14px', overflow: 'hidden',
                                    animation: `fadeUp .5s ${i * .04}s ease both`,
                                }}>
                                    <div style={{ position: 'relative', height: '230px', overflow: 'hidden' }}>
                                        {bk.image ? (
                                            <img className="hn-card-img" src={bk.image} alt={bk.title} style={{
                                                width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                                                transition: 'transform .5s ease',
                                            }}/>
                                        ) : (
                                            <div style={{
                                                width: '100%', height: '100%', background: '#111',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px', opacity: .5,
                                            }}>📚</div>
                                        )}
                                        <div className="hn-card-reveal" style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px',
                                            background: 'linear-gradient(0deg,rgba(0,0,0,.96) 0%,transparent)',
                                            opacity: 0, transform: 'translateY(8px)', transition: 'all .3s ease',
                                        }}>
                                            <div style={{
                                                width: '100%', padding: '9px',
                                                background: 'rgba(255,193,7,0.1)',
                                                border: '1px solid rgba(255,193,7,0.2)',
                                                borderRadius: '8px', textAlign: 'center',
                                                color: '#FFC107', fontSize: '10px',
                                                letterSpacing: '2.5px', textTransform: 'uppercase',
                                            }}>View Book</div>
                                        </div>
                                        {bk.type && (
                                            <div style={{
                                                position: 'absolute', top: '10px', left: '10px',
                                                padding: '3px 10px', borderRadius: '100px',
                                                background: 'rgba(0,0,0,.65)',
                                                border: `1px solid ${(TYPE_COLOR[bk.type] || '#FFC107')}35`,
                                                color: TYPE_COLOR[bk.type] || '#FFC107',
                                                fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase',
                                            }}>{bk.type}</div>
                                        )}
                                    </div>
                                    <div style={{ padding: '14px' }}>
                                        <h4 style={{
                                            fontFamily: "'Fraunces',serif", fontSize: '16px', fontStyle: 'italic',
                                            color: 'var(--white)', marginBottom: '3px', lineHeight: '1.3',
                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                        }}>{bk.title}</h4>
                                        {bk.author && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,.3)', marginBottom: '12px', fontWeight: '300' }}>{bk.author}</p>}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            {bk.price != null ? (
                                                <span style={{ fontFamily: "'Fraunces',serif", fontSize: '20px', color: '#FFC107' }}>₹{bk.price}</span>
                                            ) : <span/>}
                                            {bk.genre && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.18)' }}>{bk.genre}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ════════ BOOK CLUBS ════════ */}
                <section style={{ position: 'relative', zIndex: 10, padding: '0 clamp(36px,6vw,96px) 72px', animation: 'fadeUp .7s .35s ease both' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <p style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,193,7,0.35)', marginBottom: '10px' }}>Community</p>
                            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(28px,4vw,44px)', fontStyle: 'italic', color: 'var(--white)', lineHeight: 1.1 }}>Book Clubs</h2>
                        </div>
                        <button className="hn-btn-outline" onClick={() => nav('/clubs')} style={{
                            padding: '9px 22px', borderRadius: '10px',
                            fontFamily: "'Inter',sans-serif", fontSize: '11px',
                            letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer',
                        }}>All Clubs →</button>
                    </div>

                    <div style={{
                        background: '#0a0a0a', border: '1px solid #1a1a1a',
                        borderRadius: '18px', overflow: 'hidden',
                    }}>
                        {clubs.length === 0 ? (
                            <div style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>No clubs yet.</div>
                        ) : clubs.map((cl, i) => (
                            <div className="hn-club-row" key={cl.id || i} onClick={() => nav(`/clubs/${cl.id}`)} style={{
                                display: 'flex', alignItems: 'center', gap: '24px',
                                padding: '18px 24px',
                                borderBottom: i < clubs.length - 1 ? '1px solid #1a1a1a' : 'none',
                                animation: `fadeUp .5s ${i * .06}s ease both`,
                            }}>
                                <div style={{
                                    fontFamily: "'Fraunces',serif", fontSize: '28px',
                                    color: 'rgba(255,255,255,.04)', minWidth: '44px', textAlign: 'right', flexShrink: 0,
                                }}>{String(i + 1).padStart(2, '0')}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4 style={{ fontFamily: "'Fraunces',serif", fontSize: '17px', fontStyle: 'italic', color: 'var(--white)', marginBottom: '2px' }}>{cl.name}</h4>
                                    {cl.description && (
                                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.3)', fontWeight: '300', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{cl.description}</p>
                                    )}
                                </div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,193,7,0.4)', letterSpacing: '1px', flexShrink: 0 }}>
                                    {cl.memberCount} member{cl.memberCount !== 1 ? 's' : ''}
                                </div>
                                <div style={{ color: 'rgba(255,193,7,0.2)', fontSize: '14px', flexShrink: 0 }}>→</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ════════ REVIEWS ════════ */}
                <section style={{ position: 'relative', zIndex: 10, padding: '0 clamp(36px,6vw,96px) 72px', animation: 'fadeUp .7s .4s ease both' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <p style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,193,7,0.35)', marginBottom: '10px' }}>Readers Say</p>
                        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(28px,4vw,44px)', fontStyle: 'italic', color: 'var(--white)', lineHeight: 1.1 }}>Reviews</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '12px' }}>
                        {reviews.length === 0 ? (
                            <div style={{
                                border: '1px dashed #1a1a1a', borderRadius: '18px',
                                padding: '64px 24px', textAlign: 'center',
                                color: 'var(--muted)', fontSize: '14px', gridColumn: '1/-1',
                                background: '#0a0a0a',
                            }}>No reviews yet.</div>
                        ) : reviews.map((rv, i) => (
                            <div className="hn-rv-card" key={rv.id || i} style={{
                                background: '#0a0a0a', border: '1px solid #1a1a1a',
                                borderRadius: '16px', padding: '22px',
                                position: 'relative', overflow: 'hidden',
                                animation: `fadeUp .5s ${i * .06}s ease both`,
                            }}>
                                <div style={{
                                    position: 'absolute', top: '6px', right: '12px',
                                    fontFamily: 'Georgia,serif', fontSize: '64px', lineHeight: 1,
                                    color: 'rgba(255,193,7,0.04)', userSelect: 'none',
                                }}>"</div>
                                <div style={{ marginBottom: '12px' }}>
                                    {[...Array(5)].map((_, si) => (
                                        <span key={si} style={{
                                            color: si < (rv.rating || 0) ? '#FFC107' : 'rgba(255,255,255,.07)',
                                            fontSize: '12px', marginRight: '2px',
                                        }}>★</span>
                                    ))}
                                </div>
                                {rv.comment && (
                                    <p style={{
                                        fontFamily: "'Fraunces',serif", fontSize: '15px',
                                        fontStyle: 'italic', color: 'rgba(255,255,255,.38)',
                                        lineHeight: '1.8', marginBottom: '18px',
                                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                    }}>"{rv.comment}"</p>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #1a1a1a', paddingTop: '14px' }}>
                                    <div style={{
                                        width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                                        background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.12)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: "'Fraunces',serif", fontSize: '15px', color: '#FFC107',
                                    }}>{rv.username ? rv.username[0].toUpperCase() : '?'}</div>
                                    <div>
                                        <div style={{ fontSize: '13px', color: 'var(--white)' }}>{rv.username || 'Anonymous'}</div>
                                        {rv.bookTitle && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.25)', fontStyle: 'italic' }}>on "{rv.bookTitle}"</div>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ════════ CTA — logged out ════════ */}
                {!user && (
                    <section style={{ position: 'relative', zIndex: 10, margin: '0 clamp(36px,6vw,96px) 96px', animation: 'fadeUp .7s .45s ease both' }}>
                        <div style={{
                            position: 'relative', overflow: 'hidden',
                            borderRadius: '22px', padding: 'clamp(48px,7vw,80px) clamp(36px,5vw,64px)',
                            textAlign: 'center',
                            background: '#0a0a0a', border: '1px solid #1a1a1a',
                        }}>
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'radial-gradient(ellipse at 50% 0%, rgba(255,193,7,0.06) 0%, transparent 60%)',
                                pointerEvents: 'none',
                            }}/>
                            <div style={{
                                position: 'absolute', inset: 0,
                                backgroundImage: 'radial-gradient(rgba(255,193,7,0.03) 1px, transparent 1px)',
                                backgroundSize: '28px 28px', pointerEvents: 'none',
                            }}/>
                            <div style={{ position: 'relative' }}>
                                <p style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,193,7,0.4)', marginBottom: '18px' }}>Begin Your Story</p>
                                <h2 style={{
                                    fontFamily: "'Fraunces',serif",
                                    fontSize: 'clamp(32px,5vw,58px)', fontStyle: 'italic',
                                    color: 'var(--white)', marginBottom: '14px', lineHeight: 1.2,
                                }}>Your reading journey<br/>awaits.</h2>
                                <p style={{
                                    fontSize: '14px', fontWeight: '300', color: 'rgba(255,255,255,.32)',
                                    maxWidth: '400px', lineHeight: '1.9', margin: '0 auto 40px',
                                }}>
                                    Join thousands of readers who trade, collect, and connect over books they love.
                                </p>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <button onClick={() => nav('/register')} className="hn-btn-primary" style={{
                                        padding: '13px 40px', borderRadius: '10px',
                                        fontFamily: "'Inter',sans-serif", fontSize: '12px',
                                        letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer',
                                    }}>Get Started Free</button>
                                    <button onClick={() => nav('/leaderboard')} className="hn-btn-outline" style={{
                                        padding: '13px 40px', borderRadius: '10px',
                                        fontFamily: "'Inter',sans-serif", fontSize: '12px',
                                        letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer',
                                    }}>Leaderboard</button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ════════ CTA — logged in (quick links) ════════ */}
                {user && (
                    <section style={{ position: 'relative', zIndex: 10, margin: '0 clamp(36px,6vw,96px) 96px', animation: 'fadeUp .7s .45s ease both' }}>
                        <div style={{
                            padding: '28px',
                            background: '#0a0a0a', border: '1px solid #1a1a1a',
                            borderRadius: '18px',
                            display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center',
                        }}>
                            {[
                                { label: 'My Books',    path: '/my-books',     icon: '📚' },
                                { label: 'My Orders',   path: '/my-orders',    icon: '📦' },
                                { label: 'Exchanges',   path: '/my-exchanges', icon: '🔄' },
                                { label: 'Leaderboard', path: '/leaderboard',  icon: '🏆' },
                                { label: 'List a Book', path: '/add-book',     icon: '✚' },
                            ].map((item, i) => (
                                <button key={i} onClick={() => nav(item.path)} className="hn-btn-outline" style={{
                                    padding: '10px 22px', borderRadius: '10px',
                                    fontFamily: "'Inter',sans-serif",
                                    fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '7px',
                                }}>
                                    {item.icon} {item.label}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </>
    );
};

/* ══════════════ APP SHELL ════════════════════════════════ */
const App = () => {
    const { user } = useAuth();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#000' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
                <Routes>
                    <Route path="/"             element={<Home />} />
                    <Route path="/login"        element={!user ? <Login />    : <Navigate to="/" />} />
                    <Route path="/register"     element={!user ? <Register /> : <Navigate to="/" />} />
                    <Route path="/books"        element={<Books />} />
                    <Route path="/books/:id"    element={<BookDetail />} />
                    <Route path="/checkout/:id"      element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                    <Route path="/my-orders"         element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                    <Route path="/add-book"          element={<ProtectedRoute><AddBook /></ProtectedRoute>} />
                    <Route path="/track/:orderId"    element={<ProtectedRoute><TrackOrder /></ProtectedRoute>} />
                    <Route path="/exchange/:bookId"  element={<ProtectedRoute><Exchange /></ProtectedRoute>} />
                    <Route path="/my-exchanges"      element={<ProtectedRoute><MyExchanges /></ProtectedRoute>} />
                    <Route path="/my-books"          element={<ProtectedRoute><MyBooks /></ProtectedRoute>} />
                    <Route path="/edit-book/:id"     element={<ProtectedRoute><EditBook /></ProtectedRoute>} />
                    <Route path="/clubs"             element={<BookClubs />} />
                    <Route path="/clubs/:id"         element={<ProtectedRoute><ClubDetail /></ProtectedRoute>} />
                    <Route path="/leaderboard"       element={<Leaderboard />} />
                    <Route path="/admin"             element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/contact"           element={<Contact />} />
                    <Route path="/terms"             element={<TermsAndConditions />} />
                    <Route path="/my-tickets"        element={<MyTickets />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
};

export default App;
