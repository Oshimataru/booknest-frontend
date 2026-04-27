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
import { Doughnut, Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const API = API_BASE_URL;
const ADMIN_EMAIL = 'adityanamdevtachtode@gmail.com';

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
    const { user } = useAuth();
    const navigate = useNavigate();

    const [replyText,      setReplyText]      = useState({});
    const [tab,            setTab]            = useState('analytics');
    const [analytics,      setAnalytics]      = useState(null);
    const [users,          setUsers]          = useState([]);
    const [books,          setBooks]          = useState([]);
    const [orders,         setOrders]         = useState([]);
    const [messages,       setMessages]       = useState([]);
    const [filterPriority, setFilterPriority] = useState('ALL');
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState('');
    const [deliveryModal,  setDeliveryModal]  = useState(null);
    const [deliveryForm,   setDeliveryForm]   = useState({ status:'PROCESSING', currentLocation:'', message:'', latitude:'', longitude:'' });
    const [deliverySaving, setDeliverySaving] = useState(false);
    const [deliveryError,  setDeliveryError]  = useState('');
    const [deliveryOk,     setDeliveryOk]     = useState(false);

    useEffect(() => {
        if (!user) return;
        if (user.email !== ADMIN_EMAIL) { navigate('/'); return; }
        fetchAll();
    }, [user]);

    const getCoordinates = async (place) => {
        if (!place || place.trim() === '') return;
        try {
            const res = await fetch(
                `https://api.api-ninjas.com/v1/geocoding?city=${encodeURIComponent(place)}`,
                { headers: { 'X-Api-Key': import.meta.env.VITE_GEOCODING_API_KEY || 'kjoESO3ukVLvq9v9Q6X9nhtIqJm3LyPxHo8PcQyc' } }
            );
            const data = await res.json();
            if (!data || data.length === 0) { alert('Location not found ❌'); return; }
            setDeliveryForm(prev => ({ ...prev, latitude: data[0].latitude, longitude: data[0].longitude }));
        } catch (err) { alert(`Geocoding failed: ${err.message}`); }
    };

    const fetchAll = async () => {
        setLoading(true); setError('');
        try {
            const token = localStorage.getItem('token');
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
        } finally { setLoading(false); }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try { await deleteAdminUser(id); setUsers(u => u.filter(x => x.id !== id)); }
        catch (err) { setError(err.response?.data || 'Delete failed.'); }
    };

    const handleDeleteBook = async (id) => {
        if (!window.confirm('Delete this book?')) return;
        try { await deleteAdminBook(id); setBooks(b => b.filter(x => x.id !== id)); }
        catch (err) { setError(err.response?.data || 'Delete failed.'); }
    };

    const sendReply = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/api/contact/${id}/reply`, { reply: replyText[id] }, { headers: { Authorization: `Bearer ${token}` } });
            setMessages(m => m.map(x => x.id === id ? { ...x, reply: replyText[id], status: 'RESOLVED' } : x));
            setReplyText(r => ({ ...r, [id]: '' }));
        } catch { alert('Failed to send reply ❌'); }
    };

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/api/contact/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            setMessages(m => m.map(x => x.id === id ? { ...x, status } : x));
        } catch { alert('Failed to update status ❌'); }
    };

    const openDeliveryModal = (order) => {
        setDeliveryModal(order);
        setDeliveryForm({ status:'PROCESSING', currentLocation:'', message:'', latitude:'', longitude:'' });
        setDeliveryError(''); setDeliveryOk(false);
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
        } finally { setDeliverySaving(false); }
    };

    const bookStatusData = {
        labels: ['Available','Sold','Rented','Exchanged'],
        datasets: [{ data:[analytics?.availableBooks||0,analytics?.soldBooks||0,analytics?.rentedBooks||0,analytics?.exchangedBooks||0], backgroundColor:['#a07828','#4a7fa5','#7a68a8','#4a8c4a'], borderWidth:0 }]
    };
    const orderStatusData = {
        labels: ['Pending','Delivered','Others'],
        datasets: [{ label:'Orders', data:[analytics?.pendingOrders||0,analytics?.deliveredOrders||0,(analytics?.totalOrders||0)-(analytics?.pendingOrders||0)-(analytics?.deliveredOrders||0)], backgroundColor:['#a07828','#4a8c4a','#4a7fa5'], borderRadius:4 }]
    };

    const bookTypeCounts = books.reduce((acc, b) => {
        const type = b.type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});
    const bookTypeData = {
        labels: Object.keys(bookTypeCounts),
        datasets: [{ data: Object.values(bookTypeCounts), backgroundColor:['#a07828','#4a7fa5','#7a68a8','#4a8c4a','#ffc107'], borderWidth:0 }]
    };

    const orderRevenueByStatus = orders.reduce((acc, order) => {
        const status = order.status || 'UNKNOWN';
        acc[status] = (acc[status] || 0) + (Number(order.amount) || 0);
        return acc;
    }, {});
    const orderRevenueData = {
        labels: Object.keys(orderRevenueByStatus),
        datasets: [{ label:'Revenue', data: Object.values(orderRevenueByStatus), backgroundColor:['#4a8c4a','#4a7fa5','#a07828','#7a68a8','#c0392b'].slice(0, Object.keys(orderRevenueByStatus).length), borderRadius:4 }]
    };

    const chartTextColor = 'rgba(255,255,255,0.6)';
    const chartGridColor = 'rgba(255,193,7,0.1)';

    // Still loading user from context — show nothing yet
    if (!user) return (
        <div style={{minHeight:'100vh',background:'#050505',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{display:'flex',gap:'8px'}}>
                {[0,1,2].map(i => (
                    <div key={i} style={{width:'9px',height:'9px',borderRadius:'50%',background:'#ffc107',animation:`pulse 1.2s ${i*0.15}s ease-in-out infinite`}}/>
                ))}
            </div>
        </div>
    );

    // Not the admin email — redirect handled in useEffect, show nothing
    if (user.email !== ADMIN_EMAIL) return null;

    return (
        <>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Fraunces:ital,wght@0,600;1,400&display=swap');

            .ad *, .ad *::before, .ad *::after { box-sizing: border-box; }

            .ad {
                min-height: 100vh;
                background: #050505;
                font-family: 'Inter', sans-serif;
                color: #fff;
                padding: 36px 28px 80px;
            }

            .ad-wrap { max-width: 1280px; margin: 0 auto; }

            .ad-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 32px;
                flex-wrap: wrap;
                gap: 16px;
                padding-bottom: 24px;
                border-bottom: 1px solid rgba(255,193,7,0.1);
            }

            .ad-title { font-family:'Fraunces',serif; font-size:32px; color:#fff; line-height:1; }
            .ad-title span { color:#ffc107; }
            .ad-subtitle { font-size:12px; color:rgba(255,255,255,0.3); margin-top:4px; }

            .ad-tabs {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                background: #111;
                border: 1px solid rgba(255,193,7,0.15);
                border-radius: 8px;
                padding: 4px;
            }

            .ad-tab {
                padding: 8px 16px;
                background: transparent;
                border: none;
                border-radius: 5px;
                color: rgba(255,255,255,0.5);
                cursor: pointer;
                font-size: 13px;
                font-family: 'Inter', sans-serif;
                font-weight: 500;
                transition: all 0.15s;
                white-space: nowrap;
            }

            .ad-tab:hover { color:#fff; background:rgba(255,193,7,0.08); }
            .ad-tab.act { background:#ffc107; color:#000; font-weight:600; }

            .ad-err {
                background: rgba(255,80,80,0.08);
                border: 1px solid rgba(255,80,80,0.25);
                color: rgba(255,100,100,0.9);
                padding: 14px 18px;
                border-radius: 6px;
                margin-bottom: 24px;
                font-size: 13px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }

            .ad-retry {
                background: rgba(255,80,80,0.15);
                border: 1px solid rgba(255,80,80,0.3);
                color: rgba(255,100,100,0.9);
                padding: 5px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                white-space: nowrap;
            }

            .ad-loading {
                display: flex;
                gap: 8px;
                justify-content: center;
                padding: 100px 0;
            }

            @keyframes adBounce {
                0%,80%,100% { transform:translateY(0); opacity:0.3; }
                40%         { transform:translateY(-8px); opacity:1; }
            }

            .ad-dot {
                width:9px; height:9px;
                border-radius:50%;
                background:#ffc107;
                display:inline-block;
                animation: adBounce 1.2s ease-in-out infinite;
            }
            .ad-dot:nth-child(2){animation-delay:.15s;}
            .ad-dot:nth-child(3){animation-delay:.3s;}

            .ad-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit,minmax(200px,1fr));
                gap: 12px;
                margin-bottom: 28px;
            }

            .ad-stat {
                background: #0d0d0d;
                border: 1px solid rgba(255,193,7,0.1);
                border-radius: 8px;
                padding: 24px 20px;
                text-align: center;
                transition: border-color 0.2s;
            }
            .ad-stat:hover { border-color: rgba(255,193,7,0.3); }

            .ad-stat-num { font-size:30px; font-weight:600; color:#ffc107; line-height:1; }
            .ad-stat-label { font-size:11px; color:rgba(255,255,255,0.35); margin-top:6px; text-transform:uppercase; letter-spacing:0.06em; }

            .ad-charts { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
            @media(max-width:720px){ .ad-charts { grid-template-columns:1fr; } }

            .ad-chart {
                background: #0d0d0d;
                border: 1px solid rgba(255,193,7,0.08);
                border-radius: 8px;
                padding: 20px;
            }

            .ad-chart-title {
                font-size:12px; font-weight:600;
                color:rgba(255,193,7,0.7);
                text-transform:uppercase; letter-spacing:0.06em;
                margin-bottom:16px;
            }

            .ad-chart-wrap { max-width:260px; margin:0 auto; }

            .ad-table-wrap {
                background: #0d0d0d;
                border: 1px solid rgba(255,193,7,0.08);
                border-radius: 8px;
                overflow: hidden;
            }

            .ad-table-head {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid rgba(255,193,7,0.07);
                flex-wrap: wrap;
                gap: 10px;
            }

            .ad-table-title { font-size:15px; font-weight:600; color:#fff; }
            .ad-table-count { font-size:12px; color:rgba(255,255,255,0.35); }

            .ad-table-scroll { overflow-x: auto; }

            .ad-table { width:100%; border-collapse:collapse; }
            .ad-table thead { background:#080808; }

            .ad-table th {
                color: rgba(255,193,7,0.8);
                padding: 11px 16px;
                text-align: left;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                border-bottom: 1px solid rgba(255,193,7,0.07);
                white-space: nowrap;
            }

            .ad-table td {
                padding: 13px 16px;
                color: rgba(255,255,255,0.75);
                border-bottom: 1px solid rgba(255,255,255,0.04);
                font-size: 13px;
                vertical-align: middle;
            }

            .ad-table tbody tr { transition:background 0.15s; }
            .ad-table tbody tr:hover { background:rgba(255,193,7,0.03); }
            .ad-table tbody tr:last-child td { border-bottom:none; }

            .ad-empty {
                text-align:center;
                padding:50px 20px;
                color:rgba(255,255,255,0.2);
                font-size:14px;
            }

            .ad-badge {
                display:inline-block;
                padding:3px 10px;
                border-radius:20px;
                font-size:11px;
                font-weight:600;
                border:1px solid transparent;
                background:rgba(255,193,7,0.1);
                color:rgba(255,193,7,0.85);
                border-color:rgba(255,193,7,0.2);
                white-space:nowrap;
            }

            .ad-role-admin { background:rgba(122,104,168,0.15); color:#9d8fd4; border-color:rgba(122,104,168,0.3); }
            .ad-role-user  { background:rgba(74,127,165,0.12);  color:#6aadd4; border-color:rgba(74,127,165,0.25); }

            .ad-upd-btn {
                background:#ffc107; color:#000;
                padding:6px 14px; border:none; border-radius:5px;
                cursor:pointer; font-size:12px; font-weight:700;
                font-family:'Inter',sans-serif;
                transition:background 0.15s, transform 0.1s;
                white-space:nowrap;
            }
            .ad-upd-btn:hover { background:#ffd03a; transform:translateY(-1px); }

            .ad-del-btn {
                border:1px solid rgba(255,80,80,0.25);
                color:rgba(255,90,90,0.85);
                padding:6px 14px; background:transparent;
                border-radius:5px; cursor:pointer;
                font-size:12px; font-family:'Inter',sans-serif;
                transition:background 0.15s;
            }
            .ad-del-btn:hover { background:rgba(255,80,80,0.1); }

            .ad-modal-overlay {
                position:fixed; inset:0;
                background:rgba(0,0,0,0.88);
                display:flex; align-items:center; justify-content:center;
                z-index:9999; padding:20px;
                backdrop-filter:blur(4px);
            }

            .ad-modal {
                width:540px; max-width:100%;
                background:#0d0d0d;
                border:1px solid rgba(255,193,7,0.2);
                border-radius:10px;
                overflow:hidden;
                max-height:90vh;
                overflow-y:auto;
            }

            .ad-modal-head {
                display:flex; justify-content:space-between; align-items:flex-start;
                padding:20px 22px;
                background:#080808;
                border-bottom:1px solid rgba(255,193,7,0.08);
            }

            .ad-modal-title { font-size:17px; font-weight:600; color:#fff; }
            .ad-modal-sub   { font-size:12px; color:rgba(255,255,255,0.35); margin-top:4px; }

            .ad-modal-close {
                background:none; border:none;
                color:rgba(255,255,255,0.4); font-size:24px;
                cursor:pointer; line-height:1; padding:0;
                transition:color 0.15s;
            }
            .ad-modal-close:hover { color:#fff; }

            .ad-modal-body { padding:22px; display:flex; flex-direction:column; gap:18px; }

            .ad-modal-foot {
                display:flex; justify-content:flex-end; gap:10px;
                padding:16px 22px;
                border-top:1px solid rgba(255,255,255,0.05);
                background:#080808;
            }

            .ad-m-label {
                display:block;
                font-size:11px; font-weight:600;
                color:rgba(255,193,7,0.6);
                margin-bottom:7px;
                text-transform:uppercase; letter-spacing:0.05em;
            }

            .ad-m-input, .ad-m-select, .ad-m-textarea {
                background:#111; color:#fff;
                border:1px solid rgba(255,255,255,0.08);
                padding:10px 12px; width:100%;
                border-radius:5px;
                font-family:'Inter',sans-serif; font-size:13px;
                outline:none; transition:border-color 0.15s;
            }
            .ad-m-textarea { min-height:90px; resize:vertical; }
            .ad-m-input:focus, .ad-m-select:focus, .ad-m-textarea:focus { border-color:rgba(255,193,7,0.45); }
            .ad-m-select option { background:#111; }

            .ad-m-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

            .ad-m-err {
                background:rgba(255,80,80,0.08);
                border:1px solid rgba(255,80,80,0.22);
                color:rgba(255,100,100,0.9);
                padding:10px 14px; border-radius:5px; font-size:13px;
            }

            .ad-m-ok {
                background:rgba(80,160,80,0.1);
                border:1px solid rgba(80,160,80,0.25);
                color:#5ab85a;
                padding:10px 14px; border-radius:5px; font-size:13px;
            }

            .ad-m-cancel {
                background:transparent;
                border:1px solid rgba(255,255,255,0.12);
                color:rgba(255,255,255,0.55);
                padding:9px 18px; border-radius:5px;
                cursor:pointer; font-size:13px; transition:all 0.15s;
            }
            .ad-m-cancel:hover { border-color:rgba(255,255,255,0.3); color:#fff; }

            .ad-m-save {
                background:#ffc107; color:#000; border:none;
                padding:9px 22px; border-radius:5px;
                cursor:pointer; font-size:13px; font-weight:700;
                transition:background 0.15s;
            }
            .ad-m-save:hover:not(:disabled) { background:#ffd03a; }
            .ad-m-save:disabled { opacity:0.5; cursor:not-allowed; }

            @media(max-width:600px){
                .ad { padding:20px 14px 60px; }
                .ad-tab { padding:7px 11px; font-size:12px; }
                .ad-m-row { grid-template-columns:1fr; }
            }
        `}</style>

        <div className="ad">
            <div className="ad-wrap">

                {/* HEADER */}
                <div className="ad-header">
                    <div>
                        <h1 className="ad-title">Admin <span>Dashboard</span></h1>
                        <div className="ad-subtitle">BookNest control panel — {user.name}</div>
                    </div>
                    <div className="ad-tabs">
                        {[
                            { key:'analytics', label:'📊 Analytics' },
                            { key:'users',     label:'👥 Users'     },
                            { key:'books',     label:'📚 Books'     },
                            { key:'orders',    label:'🛒 Orders'    },
                            { key:'delivery',  label:'🚚 Delivery'  },
                            { key:'messages',  label:'✉️ Messages'  },
                        ].map(({ key, label }) => (
                            <button key={key} className={`ad-tab${tab === key ? ' act' : ''}`} onClick={() => setTab(key)}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="ad-err">
                        <span>⚠️ {error}</span>
                        <button className="ad-retry" onClick={fetchAll}>Retry</button>
                    </div>
                )}

                {loading ? (
                    <div className="ad-loading">
                        <span className="ad-dot"/><span className="ad-dot"/><span className="ad-dot"/>
                    </div>
                ) : <>

                    {/* ── ANALYTICS ── */}
                    {tab === 'analytics' && (
                        <>
                            <div className="ad-stats">
                                {[
                                    ['Total Users',  analytics?.totalUsers  ?? '—'],
                                    ['Total Books',  analytics?.totalBooks  ?? '—'],
                                    ['Total Orders', analytics?.totalOrders ?? '—'],
                                    ['Revenue',      analytics ? `₹${analytics.totalRevenue?.toFixed(0) ?? 0}` : '—'],
                                ].map(([label, val]) => (
                                    <div key={label} className="ad-stat">
                                        <div className="ad-stat-num">{val}</div>
                                        <div className="ad-stat-label">{label}</div>
                                    </div>
                                ))}
                            </div>
                            {analytics ? (
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
                                    <div className="ad-chart">
                                        <div className="ad-chart-title">Book Type Distribution</div>
                                        <div className="ad-chart-wrap">
                                            <Pie data={bookTypeData} options={{ plugins:{ legend:{ labels:{ color:chartTextColor, font:{ family:'Inter', size:12 } } } } }} />
                                        </div>
                                    </div>
                                    <div className="ad-chart">
                                        <div className="ad-chart-title">Revenue by Order Status</div>
                                        <Bar data={orderRevenueData} options={{ plugins:{ legend:{ display:false } }, scales:{ x:{ ticks:{ color:chartTextColor }, grid:{ color:chartGridColor } }, y:{ ticks:{ color:chartTextColor }, grid:{ color:chartGridColor } } } }} />
                                    </div>
                                </div>
                            ) : (
                                <div className="ad-empty">No analytics data. Check if backend is running.</div>
                            )}
                        </>
                    )}

                    {/* ── USERS ── */}
                    {tab === 'users' && (
                        <div className="ad-table-wrap">
                            <div className="ad-table-head">
                                <span className="ad-table-title">All Users</span>
                                <span className="ad-table-count">{users.length} total</span>
                            </div>
                            <div className="ad-table-scroll">
                                <table className="ad-table">
                                    <thead><tr>
                                        <th>ID</th><th>Name</th><th>Email</th>
                                        <th>Phone</th><th>Points</th><th>Role</th><th>Action</th>
                                    </tr></thead>
                                    <tbody>
                                        {users.length === 0
                                            ? <tr><td colSpan={7}><div className="ad-empty">No users found</div></td></tr>
                                            : users.map(u => (
                                                <tr key={u.id}>
                                                    <td style={{color:'rgba(255,255,255,0.3)',fontSize:'11px'}}>#{u.id}</td>
                                                    <td style={{fontWeight:500,color:'#fff'}}>{u.name}</td>
                                                    <td>{u.email}</td>
                                                    <td>{u.phone || '—'}</td>
                                                    <td style={{color:'#ffc107',fontWeight:600}}>{u.points ?? 0}</td>
                                                    <td><span className={`ad-badge ${u.role === 'ADMIN' ? 'ad-role-admin' : 'ad-role-user'}`}>{u.role}</span></td>
                                                    <td>{u.role !== 'ADMIN' && <button className="ad-del-btn" onClick={() => handleDeleteUser(u.id)}>Delete</button>}</td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── BOOKS ── */}
                    {tab === 'books' && (
                        <div className="ad-table-wrap">
                            <div className="ad-table-head">
                                <span className="ad-table-title">All Books</span>
                                <span className="ad-table-count">{books.length} total</span>
                            </div>
                            <div className="ad-table-scroll">
                                <table className="ad-table">
                                    <thead><tr>
                                        <th>ID</th><th>Title</th><th>Author</th>
                                        <th>Type</th><th>Price</th><th>Status</th><th>Seller</th><th>Action</th>
                                    </tr></thead>
                                    <tbody>
                                        {books.length === 0
                                            ? <tr><td colSpan={8}><div className="ad-empty">No books found</div></td></tr>
                                            : books.map(b => (
                                                <tr key={b.id}>
                                                    <td style={{color:'rgba(255,255,255,0.3)',fontSize:'11px'}}>#{b.id}</td>
                                                    <td style={{fontWeight:500,color:'#fff'}}>{b.title}</td>
                                                    <td>{b.author}</td>
                                                    <td><span className="ad-badge" style={{background:'rgba(160,120,40,0.12)',color:'#c89a32',borderColor:'rgba(160,120,40,0.25)'}}>{b.type}</span></td>
                                                    <td style={{color:'#ffc107',fontWeight:600}}>₹{b.price}</td>
                                                    <td>{b.status}</td>
                                                    <td>{b.seller?.name || '—'}</td>
                                                    <td><button className="ad-del-btn" onClick={() => handleDeleteBook(b.id)}>Delete</button></td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── ORDERS ── */}
                    {tab === 'orders' && (
                        <div className="ad-table-wrap">
                            <div className="ad-table-head">
                                <span className="ad-table-title">All Orders</span>
                                <span className="ad-table-count">{orders.length} total</span>
                            </div>
                            <div className="ad-table-scroll">
                                <table className="ad-table">
                                    <thead><tr>
                                        <th>ID</th><th>Buyer</th><th>Book</th>
                                        <th>Type</th><th>Amount</th><th>Status</th>
                                    </tr></thead>
                                    <tbody>
                                        {orders.length === 0
                                            ? <tr><td colSpan={6}><div className="ad-empty">No orders found</div></td></tr>
                                            : orders.map(o => {
                                                const s = statusStyle[o.status] || statusStyle.PENDING;
                                                return (
                                                    <tr key={o.id}>
                                                        <td style={{color:'rgba(255,255,255,0.3)',fontSize:'11px'}}>#{o.id}</td>
                                                        <td style={{fontWeight:500,color:'#fff'}}>{o.buyer?.name || '—'}</td>
                                                        <td>{o.book?.title || '—'}</td>
                                                        <td>{o.type}</td>
                                                        <td style={{color:'#ffc107',fontWeight:600}}>₹{o.amount}</td>
                                                        <td><span className="ad-badge" style={{background:s.bg,color:s.color,borderColor:s.border}}>{o.status}</span></td>
                                                    </tr>
                                                );
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── DELIVERY ── */}
                    {tab === 'delivery' && (
                        <div className="ad-table-wrap">
                            <div className="ad-table-head">
                                <span className="ad-table-title">Delivery Management</span>
                                <span className="ad-table-count">{orders.length} orders</span>
                            </div>
                            <div className="ad-table-scroll">
                                <table className="ad-table">
                                    <thead><tr>
                                        <th>Order ID</th><th>Buyer</th><th>Book</th>
                                        <th>Amount</th><th>Status</th><th>Update</th>
                                    </tr></thead>
                                    <tbody>
                                        {orders.length === 0
                                            ? <tr><td colSpan={6}><div className="ad-empty">No orders found</div></td></tr>
                                            : orders.map(o => {
                                                const s = statusStyle[o.status] || statusStyle.PENDING;
                                                return (
                                                    <tr key={o.id}>
                                                        <td style={{color:'rgba(255,255,255,0.3)',fontSize:'11px'}}>#{o.id}</td>
                                                        <td style={{fontWeight:500,color:'#fff'}}>{o.buyer?.name || '—'}</td>
                                                        <td>{o.book?.title || '—'}</td>
                                                        <td style={{color:'#ffc107',fontWeight:600}}>₹{o.amount}</td>
                                                        <td><span className="ad-badge" style={{background:s.bg,color:s.color,borderColor:s.border}}>{o.status}</span></td>
                                                        <td><button className="ad-upd-btn" onClick={() => openDeliveryModal(o)}>Update Delivery</button></td>
                                                    </tr>
                                                );
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── MESSAGES ── */}
                    {tab === 'messages' && (
                        <div className="ad-table-wrap">
                            <div className="ad-table-head">
                                <span className="ad-table-title">Contact Messages</span>
                                <div style={{display:'flex',gap:'10px',alignItems:'center',flexWrap:'wrap'}}>
                                    <span className="ad-table-count">{messages.length} total</span>
                                    <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                                        className="ad-m-select" style={{maxWidth:'150px',padding:'6px 10px'}}>
                                        <option value="ALL">All Priority</option>
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="ad-table-scroll">
                                <table className="ad-table">
                                    <thead><tr>
                                        <th>ID</th><th>Name</th><th>Email</th><th>Subject</th>
                                        <th>Priority</th><th>Status</th><th>Message</th><th>Actions</th>
                                    </tr></thead>
                                    <tbody>
                                        {messages.filter(m => filterPriority === 'ALL' || m.priority === filterPriority).length === 0
                                            ? <tr><td colSpan={8}><div className="ad-empty">No messages</div></td></tr>
                                            : messages.filter(m => filterPriority === 'ALL' || m.priority === filterPriority).map(m => (
                                                <tr key={m.id}>
                                                    <td style={{color:'rgba(255,255,255,0.3)',fontSize:'11px'}}>#{m.id}</td>
                                                    <td style={{fontWeight:500,color:'#fff'}}>{m.name}</td>
                                                    <td style={{fontSize:'12px'}}>{m.email}</td>
                                                    <td style={{fontSize:'12px'}}>{m.subject}</td>
                                                    <td>
                                                        <span className="ad-badge" style={{
                                                            background:  m.priority==='HIGH' ? 'rgba(255,80,80,0.1)'   : m.priority==='MEDIUM' ? 'rgba(255,193,7,0.1)'  : 'rgba(80,160,80,0.1)',
                                                            color:       m.priority==='HIGH' ? 'rgba(255,100,100,0.9)' : m.priority==='MEDIUM' ? '#ffc107'               : '#5ab85a',
                                                            borderColor: m.priority==='HIGH' ? 'rgba(255,80,80,0.2)'   : m.priority==='MEDIUM' ? 'rgba(255,193,7,0.2)'   : 'rgba(80,160,80,0.2)',
                                                        }}>{m.priority}</span>
                                                    </td>
                                                    <td>
                                                        <span className="ad-badge" style={{
                                                            background:  m.status==='RESOLVED' ? 'rgba(80,160,80,0.1)'  : 'rgba(255,193,7,0.1)',
                                                            color:       m.status==='RESOLVED' ? '#5ab85a'               : '#ffc107',
                                                            borderColor: m.status==='RESOLVED' ? 'rgba(80,160,80,0.2)'  : 'rgba(255,193,7,0.2)',
                                                        }}>{m.status}</span>
                                                    </td>
                                                    <td style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',maxWidth:'160px'}}>{m.message}</td>
                                                    <td style={{minWidth:'180px'}}>
                                                        <button className="ad-upd-btn" style={{width:'100%',marginBottom:'8px'}}
                                                            onClick={() => updateStatus(m.id, 'RESOLVED')}>✓ Resolve</button>
                                                        <input className="ad-m-input" placeholder="Type reply..."
                                                            style={{marginBottom:'6px'}}
                                                            value={replyText[m.id] || ''}
                                                            onChange={e => setReplyText(r => ({ ...r, [m.id]: e.target.value }))} />
                                                        <button className="ad-upd-btn"
                                                            style={{width:'100%',background:'#2563eb',color:'#fff'}}
                                                            onClick={() => sendReply(m.id)}>Send Reply 🚀</button>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </>}
            </div>
        </div>

        {/* ── DELIVERY MODAL ── */}
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
                                <label className="ad-m-label">Delivery Status</label>
                                <select className="ad-m-select" value={deliveryForm.status}
                                    onChange={e => setDeliveryForm(f => ({ ...f, status:e.target.value }))}>
                                    {DELIVERY_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="ad-m-label">Current Location (auto-fills coords on blur)</label>
                                <input className="ad-m-input" type="text" placeholder="e.g. Pune"
                                    value={deliveryForm.currentLocation}
                                    onChange={e => setDeliveryForm(f => ({ ...f, currentLocation:e.target.value }))}
                                    onBlur={() => getCoordinates(deliveryForm.currentLocation)} />
                            </div>
                            <div>
                                <label className="ad-m-label">Message to Customer</label>
                                <textarea className="ad-m-textarea" placeholder="e.g. Your package is out for delivery"
                                    value={deliveryForm.message}
                                    onChange={e => setDeliveryForm(f => ({ ...f, message:e.target.value }))} />
                            </div>
                            <div className="ad-m-row">
                                <div>
                                    <label className="ad-m-label">Latitude</label>
                                    <input className="ad-m-input" type="number" step="any" placeholder="18.5204"
                                        value={deliveryForm.latitude}
                                        onChange={e => setDeliveryForm(f => ({ ...f, latitude:e.target.value }))} />
                                </div>
                                <div>
                                    <label className="ad-m-label">Longitude</label>
                                    <input className="ad-m-input" type="number" step="any" placeholder="73.8567"
                                        value={deliveryForm.longitude}
                                        onChange={e => setDeliveryForm(f => ({ ...f, longitude:e.target.value }))} />
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