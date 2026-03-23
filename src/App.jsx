import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import AddBook from './pages/AddBook';
import BookDetail from './pages/BookDetail';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import TrackOrder from './pages/TrackOrder';
import AdminDashboard from './pages/AdminDashboard';
import Exchange from './pages/Exchange';
import MyExchanges from './pages/MyExchanges';
import Leaderboard from './pages/Leaderboard';
import MyBooks from './pages/MyBooks';
import BookClubs from './pages/BookClubs';
import ClubDetail from './pages/ClubDetail';
import EditBook from './pages/EditBook';
import './styles/Auth.css';
import './styles/Global.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const Home = () => {
  const { user } = useAuth();
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Fraunces:ital,wght@0,600;1,400&display=swap');
        .hm{min-height:calc(100vh - 61px);background:#0d1117;font-family:'Inter',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:72px 24px 80px;text-align:center;}
        .hm-tag{display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border:1px solid rgba(201,168,76,0.2);border-radius:100px;font-size:11px;font-weight:400;letter-spacing:1.2px;text-transform:uppercase;color:rgba(201,168,76,0.6);margin-bottom:36px;animation:hmUp 0.7s ease both;}
        .hm-dot{width:5px;height:5px;border-radius:50%;background:#c9a84c;opacity:0.7;}
        .hm-h1{font-family:'Fraunces',serif;font-size:clamp(42px,7vw,82px);font-weight:600;line-height:1.05;color:#f0e6cc;letter-spacing:-1px;margin-bottom:20px;animation:hmUp 0.7s 0.08s ease both;}
        .hm-h1 em{font-style:italic;font-weight:400;color:#c9a84c;}
        .hm-sub{font-size:15px;font-weight:300;color:rgba(232,220,200,0.4);max-width:360px;line-height:1.7;margin-bottom:44px;animation:hmUp 0.7s 0.16s ease both;}
        .hm-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:72px;animation:hmUp 0.7s 0.24s ease both;}
        .hm-bp{padding:12px 28px;background:#c9a84c;color:#0d1117;border:none;border-radius:4px;font-family:'Inter',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:background 0.15s,transform 0.15s;}
        .hm-bp:hover{background:#d4b55a;transform:translateY(-1px);}
        .hm-bg{padding:12px 28px;background:transparent;border:1px solid rgba(201,168,76,0.25);border-radius:4px;color:rgba(201,168,76,0.7);font-family:'Inter',sans-serif;font-size:13px;font-weight:400;cursor:pointer;transition:border-color 0.15s,color 0.15s,transform 0.15s;}
        .hm-bg:hover{border-color:rgba(201,168,76,0.5);color:#c9a84c;transform:translateY(-1px);}
        .hm-stats{display:flex;border-top:1px solid rgba(201,168,76,0.1);border-bottom:1px solid rgba(201,168,76,0.1);width:100%;max-width:540px;animation:hmUp 0.7s 0.32s ease both;}
        .hm-stat{flex:1;padding:20px 0;text-align:center;border-right:1px solid rgba(201,168,76,0.1);}
        .hm-stat:last-child{border-right:none;}
        .hm-sn{font-family:'Fraunces',serif;font-size:24px;font-weight:600;color:#c9a84c;line-height:1;margin-bottom:4px;}
        .hm-sl{font-size:11px;font-weight:300;color:rgba(232,220,200,0.3);letter-spacing:0.5px;}
        .hm-feats{display:grid;grid-template-columns:repeat(4,1fr);width:100%;max-width:540px;border-top:1px solid rgba(201,168,76,0.08);animation:hmUp 0.7s 0.4s ease both;}
        .hm-feat{padding:26px 16px;text-align:center;border-right:1px solid rgba(201,168,76,0.08);transition:background 0.2s;}
        .hm-feat:last-child{border-right:none;}
        .hm-feat:hover{background:rgba(201,168,76,0.04);}
        .hm-fi{font-size:18px;margin-bottom:8px;display:block;}
        .hm-fn{font-size:12px;font-weight:500;color:rgba(232,220,200,0.55);}
        @keyframes hmUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        @media(max-width:540px){.hm-feats{grid-template-columns:repeat(2,1fr);}.hm-feat:nth-child(2){border-right:none;}}
      `}</style>
      <div className="hm">
        <div className="hm-tag"><div className="hm-dot" />Your book marketplace</div>
        <h1 className="hm-h1">Find your next<br /><em>great read</em></h1>
        <p className="hm-sub">Buy, sell, rent and exchange books with readers near you.</p>
        <div className="hm-btns">
          <button className="hm-bp" onClick={() => window.location.href='/books'}>Browse Books</button>
          {user
            ? <button className="hm-bg" onClick={() => window.location.href='/add-book'}>Post a Book →</button>
            : <button className="hm-bg" onClick={() => window.location.href='/register'}>Get Started →</button>
          }
        </div>
        <div className="hm-stats">
          {[['10K+','Books listed'],['3.2K','Readers'],['850+','Exchanges'],['120','Book clubs']].map(([n,l])=>(
            <div key={l} className="hm-stat"><div className="hm-sn">{n}</div><div className="hm-sl">{l}</div></div>
          ))}
        </div>
        <div className="hm-feats">
          {[['🛒','Buy'],['📅','Rent'],['🔄','Exchange'],['🏆','Earn']].map(([icon,name])=>(
            <div key={name} className="hm-feat"><span className="hm-fi">{icon}</span><div className="hm-fn">{name}</div></div>
          ))}
        </div>
      </div>
    </>
  );
};

const App = () => {
  const { user } = useAuth();
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'#0d1117' }}>
      <Navbar />
      <main style={{ flex:1 }}>
        jsx<main style={{ flex: 1, paddingTop: '60px' }}></main>
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/login"          element={!user ? <Login />    : <Navigate to="/" />} />
          <Route path="/register"       element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/books"          element={<Books />} />
          <Route path="/books/:id"      element={<BookDetail />} />
          <Route path="/checkout/:id"   element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/my-orders"      element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/add-book"       element={<ProtectedRoute><AddBook /></ProtectedRoute>} />
          <Route path="/track/:orderId" element={<ProtectedRoute><TrackOrder /></ProtectedRoute>} />
          <Route path="/exchange/:bookId" element={<ProtectedRoute><Exchange /></ProtectedRoute>} />
          <Route path="/my-exchanges"   element={<ProtectedRoute><MyExchanges /></ProtectedRoute>} />
          <Route path="/my-books"       element={<ProtectedRoute><MyBooks /></ProtectedRoute>} />
          <Route path="/edit-book/:id"  element={<ProtectedRoute><EditBook /></ProtectedRoute>} />
          <Route path="/clubs"          element={<BookClubs />} />
          <Route path="/clubs/:id"      element={<ProtectedRoute><ClubDetail /></ProtectedRoute>} />
          <Route path="/leaderboard"    element={<Leaderboard />} />
          <Route path="/admin"          element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
