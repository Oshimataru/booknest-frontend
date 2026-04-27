import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement,
    PointElement, LineElement, Title, Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
    ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement,
    PointElement, LineElement, Title, Filler
);

/* ─── CONFIG ──────────────────────────────────────────────── */
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const statusStyle = {
    PENDING:          { bg: 'rgba(184,134,11,0.12)',  color: '#b8860b',              border: 'rgba(184,134,11,0.3)'   },
    CONFIRMED:        { bg: 'rgba(74,127,165,0.12)',  color: '#4a7fa5',              border: 'rgba(74,127,165,0.3)'   },
    SHIPPED:          { bg: 'rgba(122,104,168,0.12)', color: '#7a68a8',              border: 'rgba(122,104,168,0.3)'  },
    DELIVERED:        { bg: 'rgba(74,140,74,0.12)',   color: '#4a8c4a',              border: 'rgba(74,140,74,0.3)'    },
    CANCELLED:        { bg: 'rgba(200,60,50,0.08)',   color: 'rgba(200,60,50,0.85)', border: 'rgba(200,60,50,0.25)'   },
    PROCESSING:       { bg: 'rgba(184,134,11,0.12)',  color: '#b8860b',              border: 'rgba(184,134,11,0.3)'   },
    OUT_FOR_DELIVERY: { bg: 'rgba(122,104,168,0.12)', color: '#7a68a8',              border: 'rgba(122,104,168,0.3)'  },
};

const DELIVERY_STATUSES = ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

/* ─── CHART DEFAULTS ──────────────────────────────────────── */
const GOLD     = '#b8860b';
const BLUE     = '#4a7fa5';
const PURPLE   = '#7a68a8';
const GREEN    = '#4a8c4a';
const RED      = '#c0392b';
const MUTED    = 'rgba(255,255,255,0.45)';
const GRID     = 'rgba(255,193,7,0.07)';

const tooltipStyle = {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(184,134,11,0.35)',
    borderWidth: 1,
    titleColor: '#fff',
    bodyColor: 'rgba(255,255,255,0.65)',
    padding: 10,
    cornerRadius: 6,
    titleFont: { family: "'DM Sans', sans-serif", size: 13 },
    bodyFont:  { family: "'DM Sans', sans-serif", size: 12 },
};

/* ─── MAIN COMPONENT ──────────────────────────────────────── */
const AdminDashboard = () => {
    const [tab,            setTab]            = useState('analytics');
    const [analytics,      setAnalytics]      = useState(null);
    const [users,          setUsers]          = useState([]);
    const [books,          setBooks]          = useState([]);
    const [orders,         setOrders]         = useState([]);
    const [messages,       setMessages]       = useState([]);
    const [filterPriority, setFilterPriority] = useState('ALL');
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState('');
    const [replyText,      setReplyText]      = useState({});
    const [deliveryModal,  setDeliveryModal]  = useState(null);
    const [deliveryForm,   setDeliveryForm]   = useState({ status: 'PROCESSING', currentLocation: '', message: '', latitude: '', longitude: '' });
    const [deliverySaving, setDeliverySaving] = useState(false);
    const [deliveryOk,     setDeliveryOk]     = useState(false);
    const [deliveryError,  setDeliveryError]  = useState('');

    useEffect(() => { fetchAll(); }, []);

    const token = () => localStorage.getItem('token');

    const fetchAll = async () => {
        setLoading(true); setError('');
        try {
            const headers = { Authorization: `Bearer ${token()}` };
            const [aR, uR, bR, oR, mR] = await Promise.all([
                axios.get(`${API}/api/admin/analytics`,  { headers }),
                axios.get(`${API}/api/admin/users`,      { headers }),
                axios.get(`${API}/api/admin/books`,      { headers }),
                axios.get(`${API}/api/admin/orders`,     { headers }),
                axios.get(`${API}/api/contact/all`,      { headers }),
            ]);
            setAnalytics(aR.data);
            setUsers(uR.data);
            setBooks(bR.data);
            setOrders(oR.data);
            setMessages(mR.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load admin data.');
        } finally { setLoading(false); }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await axios.delete(`${API}/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
            setUsers(u => u.filter(x => x.id !== id));
        } catch (err) { setError(err.response?.data?.message || 'Delete failed.'); }
    };

    const handleDeleteBook = async (id) => {
        if (!window.confirm('Delete this book?')) return;
        try {
            await axios.delete(`${API}/api/admin/books/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
            setBooks(b => b.filter(x => x.id !== id));
        } catch (err) { setError(err.response?.data?.message || 'Delete failed.'); }
    };

    const sendReply = async (id) => {
        try {
            await axios.put(`${API}/api/contact/${id}/reply`, { reply: replyText[id] }, { headers: { Authorization: `Bearer ${token()}` } });
            setMessages(m => m.map(x => x.id === id ? { ...x, reply: replyText[id], status: 'RESOLVED' } : x));
            setReplyText(r => ({ ...r, [id]: '' }));
        } catch { alert('Failed to send reply'); }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`${API}/api/contact/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token()}` } });
            setMessages(m => m.map(x => x.id === id ? { ...x, status } : x));
        } catch { alert('Failed to update status'); }
    };

    const getCoordinates = async (place) => {
        if (!place?.trim()) return;
        try {
            const res = await fetch(
                `https://api.api-ninjas.com/v1/geocoding?city=${encodeURIComponent(place)}`,
                { headers: { 'X-Api-Key': import.meta.env.VITE_GEOCODING_API_KEY || '' } }
            );
            const data = await res.json();
            if (!data?.length) { alert('Location not found'); return; }
            setDeliveryForm(f => ({ ...f, latitude: data[0].latitude, longitude: data[0].longitude }));
        } catch (err) { alert(`Geocoding failed: ${err.message}`); }
    };

    const openDeliveryModal = (order) => {
        setDeliveryModal(order);
        setDeliveryForm({ status: 'PROCESSING', currentLocation: '', message: '', latitude: '', longitude: '' });
        setDeliveryError(''); setDeliveryOk(false);
    };

    const handleDeliveryUpdate = async (e) => {
        e.preventDefault();
        setDeliverySaving(true); setDeliveryError(''); setDeliveryOk(false);
        try {
            await axios.put(
                `${API}/api/admin/deliveries/${deliveryModal.id}`,
                {
                    status:          deliveryForm.status,
                    currentLocation: deliveryForm.currentLocation,
                    message:         deliveryForm.message,
                    latitude:        deliveryForm.latitude  ? parseFloat(deliveryForm.latitude)  : null,
                    longitude:       deliveryForm.longitude ? parseFloat(deliveryForm.longitude) : null,
                },
                { headers: { Authorization: `Bearer ${token()}` } }
            );
            setDeliveryOk(true);
            setTimeout(() => setDeliveryModal(null), 1400);
        } catch (err) {
            setDeliveryError(err.response?.data?.message || 'Failed to update delivery.');
        } finally { setDeliverySaving(false); }
    };

    /* ── CHART DATA ── */
    const a = analytics || {};

    const bookStatusData = {
        labels: ['Available', 'Sold', 'Rented', 'Exchanged'],
        datasets: [{
            data: [a.availableBooks || 0, a.soldBooks || 0, a.rentedBooks || 0, a.exchangedBooks || 0],
            backgroundColor: [GOLD, BLUE, PURPLE, GREEN],
            borderColor: '#0d0d0d',
            borderWidth: 3,
            hoverOffset: 10,
        }],
    };

    const orderStatusData = {
        labels: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
        datasets: [{
            label: 'Orders',
            data: [
                a.pendingOrders   || 0,
                a.confirmedOrders || 0,
                a.shippedOrders   || 0,
                a.deliveredOrders || 0,
                a.cancelledOrders || 0,
            ],
            backgroundColor: [GOLD, BLUE, PURPLE, GREEN, RED],
            borderRadius: 6,
            borderSkipped: false,
        }],
    };

    const revenueMonths = a.monthlyRevenue || [12000, 19800, 15400, 28000, 22600, 31000, 26800, 38500, 29200, 44100, 37600, 52000];
    const revenueData = {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{
            label: 'Revenue (₹)',
            data: revenueMonths,
            borderColor: GOLD,
            backgroundColor: 'rgba(184,134,11,0.12)',
            pointBackgroundColor: GOLD,
            pointBorderColor: '#0d0d0d',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true,
        }],
    };

    const userGrowth = a.monthlyUsers || [4,9,7,15,12,20,17,24,18,31,27,38];
    const userGrowthData = {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{
            label: 'New Users',
            data: userGrowth,
            backgroundColor: userGrowth.map(() => `rgba(122,104,168,0.75)`),
            borderRadius: 5,
            borderSkipped: false,
        }],
    };

    const doughnutOptions = {
        responsive: true,
        cutout: '68%',
        plugins: {
            legend: { labels: { color: MUTED, font: { family: "'DM Sans', sans-serif", size: 12 }, padding: 16, usePointStyle: true, pointStyleWidth: 8 } },
            tooltip: tooltipStyle,
        },
    };

    const barOptions = {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: tooltipStyle },
        scales: {
            x: { ticks: { color: MUTED, font: { family: "'DM Sans', sans-serif", size: 11 } }, grid: { color: GRID } },
            y: { ticks: { color: MUTED, font: { family: "'DM Sans', sans-serif", size: 11 } }, grid: { color: GRID }, border: { dash: [4,4] } },
        },
    };

    const lineOptions = {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: tooltipStyle },
        scales: {
            x: { ticks: { color: MUTED, font: { family: "'DM Sans', sans-serif", size: 11 } }, grid: { color: GRID } },
            y: { ticks: { color: MUTED, font: { family: "'DM Sans', sans-serif", size: 11 }, callback: v => `₹${(v/1000).toFixed(0)}k` }, grid: { color: GRID }, border: { dash: [4,4] } },
        },
    };

    const userBarOptions = {
        ...barOptions,
        scales: {
            ...barOptions.scales,
            y: { ticks: { color: MUTED, font: { family: "'DM Sans', sans-serif", size: 11 } }, grid: { color: GRID }, border: { dash: [4,4] } },
        },
    };

    const TABS = [
        { key: 'analytics', label: '📊 Analytics' },
        { key: 'users',     label: '👥 Users'     },
        { key: 'books',     label: '📚 Books'     },
        { key: 'orders',    label: '🛒 Orders'    },
        { key: 'delivery',  label: '🚚 Delivery'  },
        { key: 'messages',  label: '✉️ Messages'  },
    ];

    return (
        <>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

            .ad *, .ad *::before, .ad *::after { box-sizing: border-box; }

            .ad {
                min-height: 100vh;
                background: #080808;
                font-family: 'DM Sans', sans-serif;
                color: #f0ebe0;
                padding: 36px 28px 80px;
            }

            .ad-wrap { max-width: 1300px; margin: 0 auto; }

            .ad-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 32px;
                flex-wrap: wrap;
                gap: 16px;
                padding-bottom: 24px;
                border-bottom: 1px solid rgba(184,134,11,0.15);
            }

            .ad-title {
                font-family: 'DM Serif Display', serif;
                font-size: 34px;
                color: #f0ebe0;
                line-height: 1;
                letter-spacing: -0.5px;
            }
            .ad-title span { color: #b8860b; font-style: italic; }
            .ad-subtitle { font-size: 12px; color: rgba(240,235,224,0.35); margin-top: 5px; letter-spacing: 0.02em; }

            .ad-tabs {
                display: flex;
                flex-wrap: wrap;
                gap: 3px;
                background: #111;
                border: 1px solid rgba(184,134,11,0.15);
                border-radius: 10px;
                padding: 4px;
            }

            .ad-tab {
                padding: 8px 16px;
                background: transparent;
                border: none;
                border-radius: 7px;
                color: rgba(240,235,224,0.45);
                cursor: pointer;
                font-size: 13px;
                font-family: 'DM Sans', sans-serif;
                font-weight: 500;
                transition: all 0.18s;
                white-space: nowrap;
            }
            .ad-tab:hover { color: #f0ebe0; background: rgba(184,134,11,0.1); }
            .ad-tab.act { background: #b8860b; color: #fff; font-weight: 600; }

            .ad-err {
                background: rgba(200,50,50,0.08);
                border: 1px solid rgba(200,50,50,0.25);
                color: rgba(240,120,120,0.9);
                padding: 13px 18px;
                border-radius: 8px;
                margin-bottom: 24px;
                font-size: 13px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }
            .ad-retry {
                background: rgba(200,50,50,0.15);
                border: 1px solid rgba(200,50,50,0.3);
                color: rgba(240,120,120,0.9);
                padding: 5px 14px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                font-family: 'DM Sans', sans-serif;
            }

            .ad-loading {
                display: flex; gap: 8px;
                justify-content: center;
                padding: 120px 0;
            }
            @keyframes adBounce {
                0%,80%,100% { transform: translateY(0); opacity: 0.25; }
                40%         { transform: translateY(-10px); opacity: 1; }
            }
            .ad-dot {
                width: 9px; height: 9px; border-radius: 50%;
                background: #b8860b; display: inline-block;
                animation: adBounce 1.3s ease-in-out infinite;
            }
            .ad-dot:nth-child(2) { animation-delay: .18s; }
            .ad-dot:nth-child(3) { animation-delay: .36s; }

            /* ── STAT CARDS ── */
            .ad-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 14px;
                margin-bottom: 28px;
            }
            .ad-stat {
                background: #0f0f0f;
                border: 1px solid rgba(184,134,11,0.12);
                border-radius: 10px;
                padding: 22px 20px 18px;
                position: relative;
                overflow: hidden;
                transition: border-color 0.2s, transform 0.2s;
            }
            .ad-stat::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0;
                height: 2px;
                background: linear-gradient(90deg, #b8860b, transparent);
            }
            .ad-stat:hover { border-color: rgba(184,134,11,0.35); transform: translateY(-2px); }
            .ad-stat-num { font-size: 32px; font-weight: 600; color: #b8860b; line-height: 1; letter-spacing: -1px; }
            .ad-stat-label { font-size: 11px; color: rgba(240,235,224,0.35); margin-top: 7px; text-transform: uppercase; letter-spacing: 0.08em; }
            .ad-stat-icon { position: absolute; bottom: 14px; right: 16px; font-size: 22px; opacity: 0.15; }

            /* ── CHARTS ── */
            .ad-charts-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 16px;
            }
            .ad-charts-wide { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

            @media(max-width: 780px) {
                .ad-charts-grid, .ad-charts-wide { grid-template-columns: 1fr; }
            }

            .ad-chart {
                background: #0f0f0f;
                border: 1px solid rgba(184,134,11,0.1);
                border-radius: 10px;
                padding: 22px 20px;
            }
            .ad-chart-title {
                font-size: 11px; font-weight: 600;
                color: rgba(184,134,11,0.75);
                text-transform: uppercase; letter-spacing: 0.08em;
                margin-bottom: 18px;
            }
            .ad-chart-wrap { max-width: 280px; margin: 0 auto; }

            /* ── TABLES ── */
            .ad-table-wrap {
                background: #0f0f0f;
                border: 1px solid rgba(184,134,11,0.1);
                border-radius: 10px;
                overflow: hidden;
            }
            .ad-table-head {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid rgba(184,134,11,0.08);
                flex-wrap: wrap;
                gap: 10px;
            }
            .ad-table-title { font-size: 15px; font-weight: 600; color: #f0ebe0; }
            .ad-table-count { font-size: 12px; color: rgba(240,235,224,0.3); }
            .ad-table-scroll { overflow-x: auto; }
            .ad-table { width: 100%; border-collapse: collapse; }
            .ad-table thead { background: #080808; }
            .ad-table th {
                color: rgba(184,134,11,0.8);
                padding: 11px 16px;
                text-align: left;
                font-size: 11px; font-weight: 600;
                text-transform: uppercase; letter-spacing: 0.06em;
                border-bottom: 1px solid rgba(184,134,11,0.08);
                white-space: nowrap;
            }
            .ad-table td {
                padding: 13px 16px;
                color: rgba(240,235,224,0.7);
                border-bottom: 1px solid rgba(255,255,255,0.04);
                font-size: 13px;
                vertical-align: middle;
            }
            .ad-table tbody tr { transition: background 0.15s; }
            .ad-table tbody tr:hover { background: rgba(184,134,11,0.04); }
            .ad-table tbody tr:last-child td { border-bottom: none; }
            .ad-empty {
                text-align: center; padding: 60px 20px;
                color: rgba(240,235,224,0.2); font-size: 14px;
            }

            /* ── BADGES ── */
            .ad-badge {
                display: inline-block;
                padding: 3px 10px;
                border-radius: 20px;
                font-size: 11px; font-weight: 600;
                border: 1px solid transparent;
                white-space: nowrap;
            }

            /* ── BUTTONS ── */
            .ad-upd-btn {
                background: #b8860b; color: #fff;
                padding: 6px 14px; border: none; border-radius: 6px;
                cursor: pointer; font-size: 12px; font-weight: 600;
                font-family: 'DM Sans', sans-serif;
                transition: background 0.15s, transform 0.1s;
                white-space: nowrap;
            }
            .ad-upd-btn:hover { background: #d4a017; transform: translateY(-1px); }

            .ad-del-btn {
                border: 1px solid rgba(200,50,50,0.3);
                color: rgba(220,90,90,0.85);
                padding: 5px 13px; background: transparent;
                border-radius: 6px; cursor: pointer;
                font-size: 12px; font-family: 'DM Sans', sans-serif;
                transition: background 0.15s;
            }
            .ad-del-btn:hover { background: rgba(200,50,50,0.1); }

            /* ── MODAL ── */
            .ad-modal-overlay {
                position: fixed; inset: 0;
                background: rgba(0,0,0,0.85);
                display: flex; align-items: center; justify-content: center;
                z-index: 9999; padding: 20px;
                backdrop-filter: blur(6px);
            }
            .ad-modal {
                width: 540px; max-width: 100%;
                background: #111;
                border: 1px solid rgba(184,134,11,0.25);
                border-radius: 12px;
                overflow: hidden;
                max-height: 90vh; overflow-y: auto;
            }
            .ad-modal-head {
                display: flex; justify-content: space-between; align-items: flex-start;
                padding: 20px 22px;
                background: #0d0d0d;
                border-bottom: 1px solid rgba(184,134,11,0.1);
            }
            .ad-modal-title { font-size: 17px; font-weight: 600; color: #f0ebe0; }
            .ad-modal-sub   { font-size: 12px; color: rgba(240,235,224,0.35); margin-top: 4px; }
            .ad-modal-close {
                background: none; border: none;
                color: rgba(240,235,224,0.4); font-size: 24px;
                cursor: pointer; line-height: 1; padding: 0;
                transition: color 0.15s;
            }
            .ad-modal-close:hover { color: #f0ebe0; }

            .ad-modal-body { padding: 22px; display: flex; flex-direction: column; gap: 18px; }
            .ad-modal-foot {
                display: flex; justify-content: flex-end; gap: 10px;
                padding: 16px 22px;
                border-top: 1px solid rgba(255,255,255,0.05);
                background: #0d0d0d;
            }

            .ad-m-label {
                display: block;
                font-size: 11px; font-weight: 600;
                color: rgba(184,134,11,0.7);
                margin-bottom: 7px;
                text-transform: uppercase; letter-spacing: 0.06em;
            }
            .ad-m-input, .ad-m-select, .ad-m-textarea {
                background: #0d0d0d; color: #f0ebe0;
                border: 1px solid rgba(255,255,255,0.08);
                padding: 10px 13px; width: 100%;
                border-radius: 6px;
                font-family: 'DM Sans', sans-serif; font-size: 13px;
                outline: none; transition: border-color 0.15s;
            }
            .ad-m-textarea { min-height: 90px; resize: vertical; }
            .ad-m-input:focus, .ad-m-select:focus, .ad-m-textarea:focus { border-color: rgba(184,134,11,0.5); }
            .ad-m-select option { background: #111; }
            .ad-m-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

            .ad-m-err {
                background: rgba(200,50,50,0.08); border: 1px solid rgba(200,50,50,0.25);
                color: rgba(240,100,100,0.9); padding: 10px 14px; border-radius: 6px; font-size: 13px;
            }
            .ad-m-ok {
                background: rgba(74,140,74,0.1); border: 1px solid rgba(74,140,74,0.25);
                color: #5ab85a; padding: 10px 14px; border-radius: 6px; font-size: 13px;
            }
            .ad-m-cancel {
                background: transparent; border: 1px solid rgba(255,255,255,0.12);
                color: rgba(240,235,224,0.5); padding: 9px 20px; border-radius: 6px;
                cursor: pointer; font-size: 13px; font-family: 'DM Sans', sans-serif;
                transition: all 0.15s;
            }
            .ad-m-cancel:hover { border-color: rgba(255,255,255,0.3); color: #f0ebe0; }
            .ad-m-save {
                background: #b8860b; color: #fff; border: none;
                padding: 9px 24px; border-radius: 6px;
                cursor: pointer; font-size: 13px; font-weight: 700;
                font-family: 'DM Sans', sans-serif;
                transition: background 0.15s;
            }
            .ad-m-save:hover:not(:disabled) { background: #d4a017; }
            .ad-m-save:disabled { opacity: 0.45; cursor: not-allowed; }

            @media(max-width: 600px) {
                .ad { padding: 20px 14px 60px; }
                .ad-tab { padding: 7px 10px; font-size: 12px; }
                .ad-m-row { grid-template-columns: 1fr; }
            }
        `}</style>

        <div className="ad">
        <div className="ad-wrap">

            {/* HEADER */}
            <div className="ad-header">
                <div>
                    <h1 className="ad-title">Admin <span>Dashboard</span></h1>
                    <div className="ad-subtitle">BookNest control panel</div>
                </div>
                <div className="ad-tabs">
                    {TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            className={`ad-tab${tab === key ? ' act' : ''}`}
                            onClick={() => setTab(key)}
                        >
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
                                ['Total Users',  a.totalUsers  ?? '—', '👥'],
                                ['Total Books',  a.totalBooks  ?? '—', '📚'],
                                ['Total Orders', a.totalOrders ?? '—', '🛒'],
                                ['Revenue',      a.totalRevenue != null ? `₹${Math.round(a.totalRevenue).toLocaleString('en-IN')}` : '—', '💰'],
                                ['Pending',      a.pendingOrders  ?? '—', '⏳'],
                                ['Delivered',    a.deliveredOrders ?? '—', '✅'],
                            ].map(([label, val, icon]) => (
                                <div key={label} className="ad-stat">
                                    <div className="ad-stat-num">{val}</div>
                                    <div className="ad-stat-label">{label}</div>
                                    <div className="ad-stat-icon">{icon}</div>
                                </div>
                            ))}
                        </div>

                        <div className="ad-charts-grid">
                            <div className="ad-chart">
                                <div className="ad-chart-title">Book Status Distribution</div>
                                <div className="ad-chart-wrap">
                                    <Doughnut data={bookStatusData} options={doughnutOptions} />
                                </div>
                            </div>
                            <div className="ad-chart">
                                <div className="ad-chart-title">Orders by Status</div>
                                <Bar data={orderStatusData} options={barOptions} />
                            </div>
                        </div>

                        <div className="ad-charts-wide">
                            <div className="ad-chart">
                                <div className="ad-chart-title">Monthly Revenue (₹)</div>
                                <Line data={revenueData} options={lineOptions} />
                            </div>
                            <div className="ad-chart">
                                <div className="ad-chart-title">Monthly New Users</div>
                                <Bar data={userGrowthData} options={userBarOptions} />
                            </div>
                        </div>
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
                                                <td style={{color:'rgba(240,235,224,0.3)',fontSize:'11px'}}>#{u.id}</td>
                                                <td style={{fontWeight:600,color:'#f0ebe0'}}>{u.name}</td>
                                                <td>{u.email}</td>
                                                <td>{u.phone || '—'}</td>
                                                <td style={{color:'#b8860b',fontWeight:600}}>{u.points ?? 0}</td>
                                                <td>
                                                    <span className="ad-badge" style={
                                                        u.role === 'ADMIN'
                                                            ? {background:'rgba(122,104,168,0.15)',color:'#9d8fd4',borderColor:'rgba(122,104,168,0.3)'}
                                                            : {background:'rgba(74,127,165,0.12)', color:'#6aadd4',borderColor:'rgba(74,127,165,0.25)'}
                                                    }>{u.role}</span>
                                                </td>
                                                <td>
                                                    {u.role !== 'ADMIN' && (
                                                        <button className="ad-del-btn" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                                                    )}
                                                </td>
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
                                                <td style={{color:'rgba(240,235,224,0.3)',fontSize:'11px'}}>#{b.id}</td>
                                                <td style={{fontWeight:600,color:'#f0ebe0'}}>{b.title}</td>
                                                <td>{b.author}</td>
                                                <td>
                                                    <span className="ad-badge" style={{background:'rgba(184,134,11,0.12)',color:'#c89a32',borderColor:'rgba(184,134,11,0.25)'}}>
                                                        {b.type}
                                                    </span>
                                                </td>
                                                <td style={{color:'#b8860b',fontWeight:600}}>₹{b.price}</td>
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
                                                    <td style={{color:'rgba(240,235,224,0.3)',fontSize:'11px'}}>#{o.id}</td>
                                                    <td style={{fontWeight:600,color:'#f0ebe0'}}>{o.buyer?.name || '—'}</td>
                                                    <td>{o.book?.title || '—'}</td>
                                                    <td>{o.type}</td>
                                                    <td style={{color:'#b8860b',fontWeight:600}}>₹{o.amount}</td>
                                                    <td>
                                                        <span className="ad-badge" style={{background:s.bg,color:s.color,borderColor:s.border}}>
                                                            {o.status}
                                                        </span>
                                                    </td>
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
                                                    <td style={{color:'rgba(240,235,224,0.3)',fontSize:'11px'}}>#{o.id}</td>
                                                    <td style={{fontWeight:600,color:'#f0ebe0'}}>{o.buyer?.name || '—'}</td>
                                                    <td>{o.book?.title || '—'}</td>
                                                    <td style={{color:'#b8860b',fontWeight:600}}>₹{o.amount}</td>
                                                    <td>
                                                        <span className="ad-badge" style={{background:s.bg,color:s.color,borderColor:s.border}}>
                                                            {o.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="ad-upd-btn" onClick={() => openDeliveryModal(o)}>
                                                            Update Delivery
                                                        </button>
                                                    </td>
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
                                <select
                                    value={filterPriority}
                                    onChange={e => setFilterPriority(e.target.value)}
                                    className="ad-m-select"
                                    style={{maxWidth:'150px',padding:'6px 10px'}}
                                >
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
                                        : messages
                                            .filter(m => filterPriority === 'ALL' || m.priority === filterPriority)
                                            .map(m => (
                                                <tr key={m.id}>
                                                    <td style={{color:'rgba(240,235,224,0.3)',fontSize:'11px'}}>#{m.id}</td>
                                                    <td style={{fontWeight:600,color:'#f0ebe0'}}>{m.name}</td>
                                                    <td style={{fontSize:'12px'}}>{m.email}</td>
                                                    <td style={{fontSize:'12px'}}>{m.subject}</td>
                                                    <td>
                                                        <span className="ad-badge" style={{
                                                            background:  m.priority==='HIGH' ? 'rgba(200,50,50,0.1)'   : m.priority==='MEDIUM' ? 'rgba(184,134,11,0.1)'  : 'rgba(74,140,74,0.1)',
                                                            color:       m.priority==='HIGH' ? 'rgba(230,100,100,0.9)' : m.priority==='MEDIUM' ? '#b8860b'               : '#4a8c4a',
                                                            borderColor: m.priority==='HIGH' ? 'rgba(200,50,50,0.2)'   : m.priority==='MEDIUM' ? 'rgba(184,134,11,0.25)' : 'rgba(74,140,74,0.25)',
                                                        }}>{m.priority}</span>
                                                    </td>
                                                    <td>
                                                        <span className="ad-badge" style={{
                                                            background:  m.status==='RESOLVED' ? 'rgba(74,140,74,0.1)'   : 'rgba(184,134,11,0.1)',
                                                            color:       m.status==='RESOLVED' ? '#4a8c4a'               : '#b8860b',
                                                            borderColor: m.status==='RESOLVED' ? 'rgba(74,140,74,0.25)'  : 'rgba(184,134,11,0.25)',
                                                        }}>{m.status}</span>
                                                    </td>
                                                    <td style={{fontSize:'12px',color:'rgba(240,235,224,0.45)',maxWidth:'160px'}}>{m.message}</td>
                                                    <td style={{minWidth:'190px'}}>
                                                        <button
                                                            className="ad-upd-btn"
                                                            style={{width:'100%',marginBottom:'8px',fontSize:'12px'}}
                                                            onClick={() => updateStatus(m.id,'RESOLVED')}
                                                        >✓ Mark Resolved</button>
                                                        <input
                                                            className="ad-m-input"
                                                            placeholder="Type reply…"
                                                            style={{marginBottom:'6px'}}
                                                            value={replyText[m.id] || ''}
                                                            onChange={e => setReplyText(r => ({ ...r, [m.id]: e.target.value }))}
                                                        />
                                                        <button
                                                            className="ad-upd-btn"
                                                            style={{width:'100%',background:'#2563eb',fontSize:'12px'}}
                                                            onClick={() => sendReply(m.id)}
                                                        >Send Reply 🚀</button>
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
            <div
                className="ad-modal-overlay"
                onClick={e => { if (e.target === e.currentTarget) setDeliveryModal(null); }}
            >
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
                                <select
                                    className="ad-m-select"
                                    value={deliveryForm.status}
                                    onChange={e => setDeliveryForm(f => ({ ...f, status: e.target.value }))}
                                >
                                    {DELIVERY_STATUSES.map(s => (
                                        <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="ad-m-label">Current Location (auto-fills coords on blur)</label>
                                <input
                                    className="ad-m-input"
                                    type="text"
                                    placeholder="e.g. Pune"
                                    value={deliveryForm.currentLocation}
                                    onChange={e => setDeliveryForm(f => ({ ...f, currentLocation: e.target.value }))}
                                    onBlur={() => getCoordinates(deliveryForm.currentLocation)}
                                />
                            </div>
                            <div>
                                <label className="ad-m-label">Message to Customer</label>
                                <textarea
                                    className="ad-m-textarea"
                                    placeholder="e.g. Your package is out for delivery"
                                    value={deliveryForm.message}
                                    onChange={e => setDeliveryForm(f => ({ ...f, message: e.target.value }))}
                                />
                            </div>
                            <div className="ad-m-row">
                                <div>
                                    <label className="ad-m-label">Latitude</label>
                                    <input
                                        className="ad-m-input"
                                        type="number" step="any" placeholder="18.5204"
                                        value={deliveryForm.latitude}
                                        onChange={e => setDeliveryForm(f => ({ ...f, latitude: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="ad-m-label">Longitude</label>
                                    <input
                                        className="ad-m-input"
                                        type="number" step="any" placeholder="73.8567"
                                        value={deliveryForm.longitude}
                                        onChange={e => setDeliveryForm(f => ({ ...f, longitude: e.target.value }))}
                                    />
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