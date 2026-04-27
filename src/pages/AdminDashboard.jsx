import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getAdminAnalytics, getAdminUsers, deleteAdminUser,
    getAdminBooks, deleteAdminBook, getAdminOrders
} from '../services/api';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement, Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const API = API_BASE_URL;

const statusStyle = {
    PENDING:          { bg:'rgba(160,120,40,0.1)',  color:'#a07828',              border:'rgba(160,120,40,0.25)'  },
    CONFIRMED:        { bg:'rgba(74,127,165,0.1)',  color:'#4a7fa5',              border:'rgba(74,127,165,0.25)'  },
    SHIPPED:          { bg:'rgba(122,104,168,0.1)', color:'#7a68a8',              border:'rgba(122,104,168,0.25)' },
    DELIVERED:        { bg:'rgba(80,140,80,0.1)',   color:'#4a8c4a',              border:'rgba(80,140,80,0.25)'   },
    CANCELLED:        { bg:'rgba(180,60,50,0.08)',  color:'rgba(180,60,50,0.75)', border:'rgba(180,60,50,0.2)'    },
    PROCESSING:       { bg:'rgba(160,120,40,0.1)',  color:'#a07828',              border:'rgba(160,120,40,0.25)'  },
    OUT_FOR_DELIVERY: { bg:'rgba(122,104,168,0.1)', color:'#7a68a8',              border:'rgba(122,104,168,0.25)' },
};

const DELIVERY_STATUSES = ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const AdminDashboard = () => {

    const getCoordinates = async (place) => {
        if (!place || place.trim() === '') return;
        try {
            const res = await fetch(
                `https://api.api-ninjas.com/v1/geocoding?city=${encodeURIComponent(place)}`,
                { method: 'GET', headers: { 'X-Api-Key': import.meta.env.VITE_GEOCODING_API_KEY || 'kjoESO3ukVLvq9v9Q6X9nhtIqJm3LyPxHo8PcQyc' } }
            );
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const data = await res.json();
            if (!data || data.length === 0) { alert('Location not found ❌'); return; }
            setDeliveryForm(prev => ({ ...prev, latitude: data[0].latitude, longitude: data[0].longitude }));
        } catch (err) {
            alert(`Geocoding failed: ${err.message}`);
        }
    };

    const { user } = useAuth();
    const navigate = useNavigate();

    const [replyText,       setReplyText]       = useState({});
    const [tab,             setTab]             = useState('analytics');
    const [analytics,       setAnalytics]       = useState(null);
    const [users,           setUsers]           = useState([]);
    const [books,           setBooks]           = useState([]);
    const [orders,          setOrders]          = useState([]);
    const [messages,        setMessages]        = useState([]);
    const [filterPriority,  setFilterPriority]  = useState('ALL');
    const [loading,         setLoading]         = useState(true);
    const [error,           setError]           = useState('');
    const [deliveryModal,   setDeliveryModal]   = useState(null);
    const [deliveryForm,    setDeliveryForm]    = useState({ status:'PROCESSING', currentLocation:'', message:'', latitude:'', longitude:'' });
    const [deliverySaving,  setDeliverySaving]  = useState(false);
    const [deliveryError,   setDeliveryError]   = useState('');
    const [deliveryOk,      setDeliveryOk]      = useState(false);

    useEffect(() => {
        if (!user) return;
        if (user.role !== 'ADMIN') { navigate('/'); return; }
        fetchAll();
    }, [user]);

    const token = localStorage.getItem('token');

    const fetchAll = async () => {
        try {
            const [aR, uR, bR, oR, mR] = await Promise.all([
                getAdminAnalytics(),
                getAdminUsers(),
                getAdminBooks(),
                getAdminOrders(),
                axios.get(`${API}/api/contact/all`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setAnalytics(aR.data);
            setUsers(uR.data);
            setBooks(bR.data);
            setOrders(oR.data);
            setMessages(mR.data);
        } catch (err) {
            setError(err.response?.data || 'Failed to load admin data.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try { await deleteAdminUser(id); setUsers(users.filter(u => u.id !== id)); }
        catch (err) { setError(err.response?.data || 'Something went wrong.'); }
    };

    const handleDeleteBook = async (id) => {
        if (!window.confirm('Delete this book?')) return;
        try { await deleteAdminBook(id); setBooks(books.filter(b => b.id !== id)); }
        catch (err) { setError(err.response?.data || 'Something went wrong.'); }
    };

    const sendReply = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/api/contact/${id}/reply`, { reply: replyText[id] }, { headers: { Authorization: `Bearer ${token}` } });
            setMessages(messages.map(m => m.id === id ? { ...m, reply: replyText[id], status: 'RESOLVED' } : m));
            setReplyText({ ...replyText, [id]: '' });
        } catch { alert('Failed ❌'); }
    };

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/api/contact/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            setMessages(messages.map(m => m.id === id ? { ...m, status } : m));
        } catch { alert('Failed to update status ❌'); }
    };

    const openDeliveryModal = (order) => {
        setDeliveryModal(order);
        setDeliveryForm({ status:'PROCESSING', currentLocation:'', message:'', latitude:'', longitude:'' });
        setDeliveryError('');
        setDeliveryOk(false);
    };

    const handleDeliveryUpdate = async (e) => {
        e.preventDefault();
        setDeliverySaving(true); setDeliveryError(''); setDeliveryOk(false);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API}/api/admin/deliveries/${deliveryModal.id}`,
                {
                    status:          deliveryForm.status,
                    currentLocation: deliveryForm.currentLocation,
                    message:         deliveryForm.message,
                    latitude:        deliveryForm.latitude  ? parseFloat(deliveryForm.latitude)  : null,
                    longitude:       deliveryForm.longitude ? parseFloat(deliveryForm.longitude) : null,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDeliveryOk(true);
            setTimeout(() => setDeliveryModal(null), 1200);
        } catch (err) {
            setDeliveryError(err.response?.data || 'Failed to update delivery.');
        } finally {
            setDeliverySaving(false);
        }
    };

    const bookStatusData = {
        labels: ['Available', 'Sold', 'Rented', 'Exchanged'],
        datasets: [{ data: [analytics?.availableBooks||0, analytics?.soldBooks||0, analytics?.rentedBooks||0, analytics?.exchangedBooks||0], backgroundColor: ['#a07828','#4a7fa5','#7a68a8','#4a8c4a'], borderWidth: 0 }]
    };
    const orderStatusData = {
        labels: ['Pending', 'Delivered', 'Others'],
        datasets: [{ label:'Orders', data: [analytics?.pendingOrders||0, analytics?.deliveredOrders||0, (analytics?.totalOrders||0)-(analytics?.pendingOrders||0)-(analytics?.deliveredOrders||0)], backgroundColor: ['#a07828','#4a8c4a','#4a7fa5'], borderRadius: 4 }]
    };
    const chartTextColor = 'rgba(255,255,255,0.6)';
    const chartGridColor = 'rgba(255,193,7,0.1)';

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Fraunces:ital,wght@0,600;1,400&display=swap');

                .ad * { box-sizing: border-box; margin: 0; padding: 0; }

                .ad {
                    min-height: 100vh;
                    background: #000;
                    font-family: 'Inter', sans-serif;
                    color: #fff;
                    padding: 48px 32px 80px;
                }

                .ad-wrap { max-width: 1200px; margin: 0 auto; }

                /* ── HEADER ── */
                .ad-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 28px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .ad-title { font-family: 'Fraunces', serif; font-size: 34px; color: #fff; }
                .ad-title span { color: #ffc107; }

                /* ── TABS ── */
                .ad-tabs {
                    display: flex;
                    flex-wrap: wrap;
                    border: 1px solid rgba(255,193,7,0.25);
                    border-radius: 6px;
                    overflow: hidden;
                    background: #111;
                }

                .ad-tab {
                    padding: 10px 18px;
                    background: #111;
                    border: none;
                    border-right: 1px solid rgba(255,193,7,0.1);
                    color: rgba(255,255,255,0.65);
                    cursor: pointer;
                    font-size: 13px;
                    font-family: 'Inter', sans-serif;
                    transition: background 0.15s, color 0.15s;
                }

                .ad-tab:last-child { border-right: none; }

                .ad-tab.act {
                    background: #ffc107;
                    color: #000;
                    font-weight: 600;
                }

                .ad-tab:hover:not(.act) {
                    background: rgba(255,193,7,0.12);
                    color: #fff;
                }

                /* ── STATS ── */
                .ad-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px,1fr));
                    gap: 10px;
                    margin-bottom: 25px;
                }

                .ad-stat {
                    background: #0a0a0a;
                    border: 1px solid rgba(255,193,7,0.08);
                    padding: 22px;
                    text-align: center;
                    border-radius: 4px;
                }

                .ad-stat-num { font-size: 28px; color: #ffc107; font-weight: 500; }
                .ad-stat-label { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px; }

                /* ── CHARTS ── */
                .ad-charts {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                @media (max-width: 700px) { .ad-charts { grid-template-columns: 1fr; } }

                .ad-chart {
                    background: #0a0a0a;
                    padding: 20px;
                    border: 1px solid rgba(255,193,7,0.08);
                    border-radius: 4px;
                }

                .ad-chart-title {
                    color: rgba(255,193,7,0.7);
                    font-size: 13px;
                    margin-bottom: 16px;
                    font-weight: 500;
                }

                .ad-chart-wrap { max-width: 280px; margin: 0 auto; }

                /* ── TABLE WRAPPER ── */
                .ad-table-wrap {
                    border: 1px solid rgba(255,193,7,0.08);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .ad-table-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 16px;
                    background: #0a0a0a;
                    border-bottom: 1px solid rgba(255,193,7,0.08);
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .ad-table-title { color: #fff; font-weight: 500; }
                .ad-table-count { color: rgba(255,255,255,0.45); font-size: 13px; }

                /* ── TABLE ── */
                .ad-table { width: 100%; border-collapse: collapse; }

                .ad-table thead { background: #0a0a0a; }

                .ad-table th {
                    color: #ffc107;
                    padding: 12px 14px;
                    text-align: left;
                    font-size: 12px;
                    font-weight: 500;
                    letter-spacing: 0.03em;
                    border-bottom: 1px solid rgba(255,193,7,0.08);
                }

                .ad-table td {
                    padding: 12px 14px;
                    color: rgba(255,255,255,0.8);
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                    font-size: 13px;
                }

                .ad-table tbody tr { background: #000; transition: background 0.15s; }
                .ad-table tbody tr:hover { background: #0f0f0f; }

                /* ── BADGES ── */
                .ad-badge {
                    display: inline-block;
                    padding: 3px 10px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 500;
                    border: 1px solid transparent;
                    background: rgba(255,193,7,0.08);
                    color: rgba(255,193,7,0.8);
                }

                .ad-role-admin { background: rgba(122,104,168,0.12); color: #7a68a8; border-color: rgba(122,104,168,0.25); }
                .ad-role-user  { background: rgba(74,127,165,0.1);  color: #4a7fa5;  border-color: rgba(74,127,165,0.2);  }

                /* ── BUTTONS ── */
                .ad-upd-btn {
                    background: #ffc107;
                    color: #000;
                    padding: 6px 12px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                    transition: background 0.15s;
                }

                .ad-upd-btn:hover { background: #ffcf3a; }

                .ad-del-btn {
                    border: 1px solid rgba(255,80,80,0.25);
                    color: rgba(255,80,80,0.8);
                    padding: 6px 12px;
                    background: transparent;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: background 0.15s;
                }

                .ad-del-btn:hover { background: rgba(255,80,80,0.1); }

                /* ── ERROR ── */
                .ad-err {
                    background: rgba(255,80,80,0.08);
                    border: 1px solid rgba(255,80,80,0.2);
                    color: rgba(255,80,80,0.9);
                    padding: 12px 16px;
                    border-radius: 4px;
                    margin-bottom: 20px;
                    font-size: 13px;
                }

                /* ── LOADING ── */
                .ad-loading {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                    padding: 60px 0;
                }

                .ad-dot {
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    background: #ffc107;
                    animation: adPulse 1.2s ease-in-out infinite;
                }

                .ad-dot:nth-child(2) { animation-delay: 0.2s; }
                .ad-dot:nth-child(3) { animation-delay: 0.4s; }

                @keyframes adPulse {
                    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
                    40%           { opacity: 1;   transform: scale(1.1); }
                }

                /* ── MODAL OVERLAY ── */
                .ad-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.85);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                /* ── MODAL ── */
                .ad-modal {
                    width: 520px;
                    max-width: 100%;
                    background: #0a0a0a;
                    border: 1px solid rgba(255,193,7,0.18);
                    border-radius: 8px;
                    overflow: hidden;
                }

                .ad-modal-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 18px 20px;
                    background: #000;
                    border-bottom: 1px solid rgba(255,193,7,0.08);
                }

                .ad-modal-title { color: #fff; font-size: 16px; font-weight: 500; }

                .ad-modal-sub {
                    color: rgba(255,255,255,0.4);
                    font-size: 12px;
                    margin-top: 4px;
                }

                .ad-modal-close {
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.4);
                    font-size: 22px;
                    cursor: pointer;
                    line-height: 1;
                    padding: 0;
                    transition: color 0.15s;
                }

                .ad-modal-close:hover { color: #fff; }

                .ad-modal-body {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .ad-modal-foot {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    padding: 14px 20px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    background: #000;
                }

                /* ── MODAL FORM ── */
                .ad-m-label {
                    font-size: 11px;
                    color: rgba(255,193,7,0.6);
                    margin-bottom: 6px;
                    font-weight: 500;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                }

                .ad-m-input,
                .ad-m-select,
                .ad-m-textarea {
                    background: #111;
                    color: #fff;
                    border: 1px solid rgba(255,255,255,0.08);
                    padding: 9px 12px;
                    width: 100%;
                    border-radius: 4px;
                    font-family: 'Inter', sans-serif;
                    font-size: 13px;
                    outline: none;
                    transition: border-color 0.15s;
                }

                .ad-m-textarea { min-height: 80px; resize: vertical; }

                .ad-m-input:focus,
                .ad-m-select:focus,
                .ad-m-textarea:focus { border-color: rgba(255,193,7,0.5); }

                .ad-m-select option { background: #111; }

                .ad-m-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .ad-m-err {
                    background: rgba(255,80,80,0.08);
                    border: 1px solid rgba(255,80,80,0.2);
                    color: rgba(255,80,80,0.9);
                    padding: 10px 12px;
                    border-radius: 4px;
                    font-size: 13px;
                }

                .ad-m-ok {
                    background: rgba(80,160,80,0.1);
                    border: 1px solid rgba(80,160,80,0.25);
                    color: #4a8c4a;
                    padding: 10px 12px;
                    border-radius: 4px;
                    font-size: 13px;
                }

                .ad-m-cancel {
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.12);
                    color: rgba(255,255,255,0.6);
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: border-color 0.15s, color 0.15s;
                }

                .ad-m-cancel:hover { border-color: rgba(255,255,255,0.3); color: #fff; }

                .ad-m-save {
                    background: #ffc107;
                    color: #000;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    transition: background 0.15s;
                }

                .ad-m-save:hover:not(:disabled) { background: #ffcf3a; }
                .ad-m-save:disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>

            <div className="ad">
                <div className="ad-wrap">

                    {/* ── Header & Tabs ── */}
                    <div className="ad-header">
                        <h1 className="ad-title">Admin <span>Dashboard</span></h1>
                        <div className="ad-tabs">
                            {['analytics','users','books','orders','delivery','messages'].map(t => (
                                <button key={t} className={`ad-tab${tab === t ? ' act' : ''}`} onClick={() => setTab(t)}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <div className="ad-err">{error}</div>}

                    {loading ? (
                        <div className="ad-loading">
                            <span className="ad-dot"/><span className="ad-dot"/><span className="ad-dot"/>
                        </div>
                    ) : <>

                        {/* ── Analytics ── */}
                        {tab === 'analytics' && analytics && (
                            <>
                                <div className="ad-stats">
                                    {[
                                        ['Total Users',  analytics.totalUsers],
                                        ['Total Books',  analytics.totalBooks],
                                        ['Total Orders', analytics.totalOrders],
                                        ['Revenue',      `₹${analytics.totalRevenue?.toFixed(0)}`],
                                    ].map(([label, val]) => (
                                        <div key={label} className="ad-stat">
                                            <div className="ad-stat-num">{val}</div>
                                            <div className="ad-stat-label">{label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="ad-charts">
                                    <div className="ad-chart">
                                        <div className="ad-chart-title">Book Status</div>
                                        <div className="ad-chart-wrap">
                                            <Doughnut data={bookStatusData} options={{ plugins:{ legend:{ labels:{ color:chartTextColor, font:{ family:'Inter', size:12 } } } } }} />
                                        </div>
                                    </div>
                                    <div className="ad-chart">
                                        <div className="ad-chart-title">Order Status</div>
                                        <Bar data={orderStatusData} options={{ plugins:{ legend:{ display:false } }, scales:{ x:{ ticks:{ color:chartTextColor }, grid:{ color:chartGridColor } }, y:{ ticks:{ color:chartTextColor }, grid:{ color:chartGridColor } } } }} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── Users ── */}
                        {tab === 'users' && (
                            <div className="ad-table-wrap">
                                <div className="ad-table-head">
                                    <span className="ad-table-title">Users</span>
                                    <span className="ad-table-count">{users.length} total</span>
                                </div>
                                <table className="ad-table">
                                    <thead><tr>
                                        <th>ID</th><th>Name</th><th>Email</th>
                                        <th>Phone</th><th>Points</th><th>Role</th><th>Action</th>
                                    </tr></thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id}>
                                                <td>{u.id}</td>
                                                <td>{u.name}</td>
                                                <td>{u.email}</td>
                                                <td>{u.phone}</td>
                                                <td>{u.points}</td>
                                                <td><span className={`ad-badge ${u.role === 'ADMIN' ? 'ad-role-admin' : 'ad-role-user'}`}>{u.role}</span></td>
                                                <td>{u.role !== 'ADMIN' && <button className="ad-del-btn" onClick={() => handleDeleteUser(u.id)}>Delete</button>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ── Books ── */}
                        {tab === 'books' && (
                            <div className="ad-table-wrap">
                                <div className="ad-table-head">
                                    <span className="ad-table-title">Books</span>
                                    <span className="ad-table-count">{books.length} total</span>
                                </div>
                                <table className="ad-table">
                                    <thead><tr>
                                        <th>ID</th><th>Title</th><th>Author</th>
                                        <th>Type</th><th>Price</th><th>Status</th><th>Seller</th><th>Action</th>
                                    </tr></thead>
                                    <tbody>
                                        {books.map(b => (
                                            <tr key={b.id}>
                                                <td>{b.id}</td>
                                                <td>{b.title}</td>
                                                <td>{b.author}</td>
                                                <td><span className="ad-badge" style={{ background:'rgba(160,120,40,0.1)', color:'#a07828', borderColor:'rgba(160,120,40,0.25)' }}>{b.type}</span></td>
                                                <td>₹{b.price}</td>
                                                <td>{b.status}</td>
                                                <td>{b.seller?.name}</td>
                                                <td><button className="ad-del-btn" onClick={() => handleDeleteBook(b.id)}>Delete</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ── Orders ── */}
                        {tab === 'orders' && (
                            <div className="ad-table-wrap">
                                <div className="ad-table-head">
                                    <span className="ad-table-title">Orders</span>
                                    <span className="ad-table-count">{orders.length} total</span>
                                </div>
                                <table className="ad-table">
                                    <thead><tr>
                                        <th>ID</th><th>Buyer</th><th>Book</th>
                                        <th>Type</th><th>Amount</th><th>Status</th>
                                    </tr></thead>
                                    <tbody>
                                        {orders.map(o => {
                                            const s = statusStyle[o.status] || statusStyle.PENDING;
                                            return (
                                                <tr key={o.id}>
                                                    <td>#{o.id}</td>
                                                    <td>{o.buyer?.name}</td>
                                                    <td>{o.book?.title}</td>
                                                    <td>{o.type}</td>
                                                    <td>₹{o.amount}</td>
                                                    <td><span className="ad-badge" style={{ background:s.bg, color:s.color, borderColor:s.border }}>{o.status}</span></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ── Delivery ── */}
                        {tab === 'delivery' && (
                            <div className="ad-table-wrap">
                                <div className="ad-table-head">
                                    <span className="ad-table-title">Delivery Management</span>
                                    <span className="ad-table-count">{orders.length} orders</span>
                                </div>
                                <table className="ad-table">
                                    <thead><tr>
                                        <th>Order ID</th><th>Buyer</th><th>Book</th>
                                        <th>Amount</th><th>Order Status</th><th>Update Delivery</th>
                                    </tr></thead>
                                    <tbody>
                                        {orders.map(o => {
                                            const s = statusStyle[o.status] || statusStyle.PENDING;
                                            return (
                                                <tr key={o.id}>
                                                    <td>#{o.id}</td>
                                                    <td>{o.buyer?.name}</td>
                                                    <td>{o.book?.title}</td>
                                                    <td>₹{o.amount}</td>
                                                    <td><span className="ad-badge" style={{ background:s.bg, color:s.color, borderColor:s.border }}>{o.status}</span></td>
                                                    <td><button className="ad-upd-btn" onClick={() => openDeliveryModal(o)}>Update Delivery</button></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ── Messages ── */}
                        {tab === 'messages' && (
                            <div className="ad-table-wrap">
                                <div className="ad-table-head">
                                    <span className="ad-table-title">Contact Messages</span>
                                    <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                                        <span className="ad-table-count">{messages.length} total</span>
                                        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="ad-m-select" style={{ maxWidth:'160px' }}>
                                            <option value="ALL">All Priority</option>
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                        </select>
                                    </div>
                                </div>
                                <table className="ad-table">
                                    <thead><tr>
                                        <th>ID</th><th>Name</th><th>Email</th><th>Subject</th>
                                        <th>Priority</th><th>Status</th><th>Message</th><th>Action</th>
                                    </tr></thead>
                                    <tbody>
                                        {messages.filter(m => filterPriority === 'ALL' || m.priority === filterPriority).map(m => (
                                            <tr key={m.id}>
                                                <td>{m.id}</td>
                                                <td>{m.name}</td>
                                                <td>{m.email}</td>
                                                <td>{m.subject}</td>
                                                <td><span className="ad-badge">{m.priority}</span></td>
                                                <td><span className="ad-badge">{m.status}</span></td>
                                                <td>{m.message}</td>
                                                <td>
                                                    <button className="ad-upd-btn" onClick={() => updateStatus(m.id, 'RESOLVED')}>Resolve</button>
                                                    <div style={{ marginTop:'8px' }}>
                                                        <input className="ad-m-input" placeholder="Reply..." value={replyText[m.id] || ''} onChange={e => setReplyText({ ...replyText, [m.id]: e.target.value })} />
                                                    </div>
                                                    <div style={{ marginTop:'6px' }}>
                                                        <button className="ad-upd-btn" style={{ width:'100%' }} onClick={() => sendReply(m.id)}>Send Reply 🚀</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </>}
                </div>
            </div>

            {/* ── Delivery Modal ── */}
            {deliveryModal && (
                <div className="ad-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeliveryModal(null); }}>
                    <div className="ad-modal">
                        <div className="ad-modal-head">
                            <div>
                                <div className="ad-modal-title">Update Delivery</div>
                                <div className="ad-modal-sub">Order #{deliveryModal.id} — {deliveryModal.book?.title}</div>
                            </div>
                            <button className="ad-modal-close" onClick={() => setDeliveryModal(null)}>×</button>
                        </div>
                        <form onSubmit={handleDeliveryUpdate}>
                            <div className="ad-modal-body">
                                {deliveryError && <div className="ad-m-err">{deliveryError}</div>}
                                {deliveryOk    && <div className="ad-m-ok">✓ Delivery updated successfully!</div>}

                                <div>
                                    <div className="ad-m-label">Delivery Status</div>
                                    <select className="ad-m-select" value={deliveryForm.status} onChange={e => setDeliveryForm({...deliveryForm, status: e.target.value})}>
                                        {DELIVERY_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <div className="ad-m-label">Current Location</div>
                                    <input className="ad-m-input" type="text" placeholder="Enter city (e.g. Pune)"
                                        value={deliveryForm.currentLocation}
                                        onChange={e => setDeliveryForm({...deliveryForm, currentLocation: e.target.value})}
                                        onBlur={() => getCoordinates(deliveryForm.currentLocation)} />
                                </div>

                                <div>
                                    <div className="ad-m-label">Message to Customer</div>
                                    <textarea className="ad-m-textarea" placeholder="e.g. Your package is out for delivery"
                                        value={deliveryForm.message}
                                        onChange={e => setDeliveryForm({...deliveryForm, message: e.target.value})} />
                                </div>

                                <div className="ad-m-row">
                                    <div>
                                        <div className="ad-m-label">Latitude (optional)</div>
                                        <input className="ad-m-input" type="number" step="any" placeholder="18.5204"
                                            value={deliveryForm.latitude}
                                            onChange={e => setDeliveryForm({...deliveryForm, latitude: e.target.value})} />
                                    </div>
                                    <div>
                                        <div className="ad-m-label">Longitude (optional)</div>
                                        <input className="ad-m-input" type="number" step="any" placeholder="73.8567"
                                            value={deliveryForm.longitude}
                                            onChange={e => setDeliveryForm({...deliveryForm, longitude: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            <div className="ad-modal-foot">
                                <button type="button" className="ad-m-cancel" onClick={() => setDeliveryModal(null)}>Cancel</button>
                                <button type="submit" className="ad-m-save" disabled={deliverySaving}>
                                    {deliverySaving ? 'Saving…' : 'Save Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminDashboard;