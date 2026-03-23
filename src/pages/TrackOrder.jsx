import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getDelivery, createDelivery } from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STEPS = [
    { key: 'PROCESSING',       icon: '📋', label: 'Processing'       },
    { key: 'SHIPPED',          icon: '🚚', label: 'Shipped'          },
    { key: 'OUT_FOR_DELIVERY', icon: '📍', label: 'Out for Delivery' },
    { key: 'DELIVERED',        icon: '✓',  label: 'Delivered'        },
];

const stepIndex = (status) => STEPS.findIndex(s => s.key === status);

const statusStyle = {
    PROCESSING:       { bg: 'rgba(160,120,40,0.1)',  color: '#a07828',      border: 'rgba(160,120,40,0.25)'  },
    SHIPPED:          { bg: 'rgba(74,127,165,0.1)',  color: '#4a7fa5',      border: 'rgba(74,127,165,0.25)'  },
    OUT_FOR_DELIVERY: { bg: 'rgba(122,104,168,0.1)', color: '#7a68a8',      border: 'rgba(122,104,168,0.25)' },
    DELIVERED:        { bg: 'rgba(80,140,80,0.1)',   color: '#4a8c4a',      border: 'rgba(80,140,80,0.25)'   },
};

const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const TrackOrder = () => {
    const { orderId } = useParams();
    const navigate    = useNavigate();

    const [delivery, setDelivery] = useState(null);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState('');

    useEffect(() => { fetchDelivery(); }, [orderId]);

    const fetchDelivery = async () => {
        try {
            const res = await createDelivery(orderId);
            setDelivery(res.data);
        } catch {
            try { const res = await getDelivery(orderId); setDelivery(res.data); }
            catch { setError('Failed to load delivery tracking.'); }
        } finally { setLoading(false); }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Fraunces:ital,wght@0,600;1,400&display=swap');
                .tk*{box-sizing:border-box;margin:0;padding:0;}
                .tk{min-height:100vh;background:#f7f3ee;font-family:'Inter',sans-serif;color:#1a1610;padding:48px 32px 80px;}
                .tk-wrap{max-width:680px;margin:0 auto;}

                .tk-back{display:inline-flex;align-items:center;gap:6px;background:none;border:none;font-family:'Inter',sans-serif;font-size:13px;color:rgba(26,22,16,0.38);cursor:pointer;padding:0;margin-bottom:24px;transition:color 0.15s;}
                .tk-back:hover{color:#a07828;}

                .tk-title{font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:600;color:#1a1610;letter-spacing:-0.5px;line-height:1;margin-bottom:28px;}
                .tk-title span{color:#a07828;font-style:italic;font-weight:400;}

                .tk-loading{text-align:center;padding:80px 0;font-size:14px;font-weight:300;color:rgba(26,22,16,0.3);}
                .tk-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#a07828;margin:0 3px;animation:tkB 1.2s ease-in-out infinite;}
                .tk-dot:nth-child(2){animation-delay:0.15s;}.tk-dot:nth-child(3){animation-delay:0.3s;}
                @keyframes tkB{0%,80%,100%{transform:scale(0.6);opacity:0.3;}40%{transform:scale(1);opacity:1;}}
                .tk-err{padding:14px 16px;border:1px solid rgba(180,60,50,0.2);border-radius:4px;background:rgba(200,60,50,0.05);color:rgba(180,60,50,0.8);font-size:13px;}

                /* Progress stepper */
                .tk-steps{display:flex;align-items:center;padding:24px 20px;background:#faf7f2;border:1px solid rgba(160,120,40,0.12);border-bottom:none;margin-bottom:0;}
                .tk-step{display:flex;flex-direction:column;align-items:center;gap:6px;flex:0 0 auto;}
                .tk-step-circle{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;border:1.5px solid rgba(160,120,40,0.15);background:#f7f3ee;transition:all 0.2s;color:rgba(26,22,16,0.3);}
                .tk-step.done .tk-step-circle{background:#a07828;border-color:#a07828;color:#fff;}
                .tk-step.curr .tk-step-circle{background:#faf7f2;border-color:#a07828;color:#a07828;box-shadow:0 0 0 3px rgba(160,120,40,0.12);}
                .tk-step-label{font-size:11px;font-weight:400;color:rgba(26,22,16,0.35);white-space:nowrap;text-align:center;}
                .tk-step.done .tk-step-label,.tk-step.curr .tk-step-label{color:#a07828;}
                .tk-step-line{flex:1;height:1.5px;background:rgba(160,120,40,0.12);margin:0 6px;margin-bottom:20px;transition:background 0.2s;}
                .tk-step-line.done{background:#a07828;}

                /* Info rows */
                .tk-info{border:1px solid rgba(160,120,40,0.12);border-bottom:none;background:#faf7f2;}
                .tk-row{display:flex;justify-content:space-between;align-items:center;padding:12px 18px;border-bottom:1px solid rgba(160,120,40,0.08);}
                .tk-row:last-child{border-bottom:none;}
                .tk-row-label{font-size:12px;font-weight:400;color:rgba(26,22,16,0.38);}
                .tk-row-value{font-size:13px;font-weight:300;color:rgba(26,22,16,0.7);text-align:right;max-width:60%;}
                .tk-status-badge{display:inline-block;padding:3px 10px;border-radius:2px;font-size:11px;font-weight:500;letter-spacing:0.5px;text-transform:uppercase;border:1px solid;}

                /* Map */
                .tk-map-wrap{border:1px solid rgba(160,120,40,0.12);overflow:hidden;}
                .tk-map-head{padding:13px 18px;border-bottom:1px solid rgba(160,120,40,0.08);font-size:10.5px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:rgba(160,120,40,0.45);background:#faf7f2;}
                .tk-no-map{border:1px solid rgba(160,120,40,0.12);padding:32px 18px;text-align:center;font-size:13px;font-weight:300;color:rgba(26,22,16,0.35);background:#faf7f2;line-height:1.6;}

                /* Override leaflet z-index for cream bg */
                .leaflet-container{background:#ede8e0 !important;}

                @media(max-width:540px){
                    .tk{padding:32px 16px 60px;}
                    .tk-step-label{font-size:9.5px;}
                    .tk-step-circle{width:30px;height:30px;font-size:13px;}
                }
            `}</style>

            <div className="tk">
                <div className="tk-wrap">
                    <button className="tk-back" onClick={() => navigate('/my-orders')}>← Back to orders</button>

                    {loading ? (
                        <div className="tk-loading"><span className="tk-dot"/><span className="tk-dot"/><span className="tk-dot"/></div>
                    ) : error ? (
                        <div className="tk-err">{error}</div>
                    ) : delivery && (() => {
                        const curr  = stepIndex(delivery.status);
                        const s     = statusStyle[delivery.status] || statusStyle.PROCESSING;
                        const hasLoc = delivery.latitude && delivery.longitude;

                        return (
                            <>
                                <h1 className="tk-title">Track <span>Order</span></h1>

                                {/* Stepper */}
                                <div className="tk-steps">
                                    {STEPS.map((step, i) => (
                                        <>
                                            <div key={step.key} className={`tk-step${i < curr ? ' done' : i === curr ? ' curr' : ''}`}>
                                                <div className="tk-step-circle">{step.icon}</div>
                                                <div className="tk-step-label">{step.label}</div>
                                            </div>
                                            {i < STEPS.length - 1 && (
                                                <div key={`line-${i}`} className={`tk-step-line${i < curr ? ' done' : ''}`} />
                                            )}
                                        </>
                                    ))}
                                </div>

                                {/* Info */}
                                <div className="tk-info">
                                    <div className="tk-row">
                                        <span className="tk-row-label">Status</span>
                                        <span className="tk-status-badge" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
                                            {delivery.status?.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="tk-row">
                                        <span className="tk-row-label">Current Location</span>
                                        <span className="tk-row-value">{delivery.currentLocation || 'Not updated yet'}</span>
                                    </div>
                                    <div className="tk-row">
                                        <span className="tk-row-label">Message</span>
                                        <span className="tk-row-value">{delivery.message || 'No updates yet'}</span>
                                    </div>
                                    <div className="tk-row">
                                        <span className="tk-row-label">Last Updated</span>
                                        <span className="tk-row-value">{fmt(delivery.updatedAt)}</span>
                                    </div>
                                </div>

                                {/* Map */}
                                {hasLoc ? (
                                    <div className="tk-map-wrap">
                                        <div className="tk-map-head">Live Location</div>
                                        <MapContainer
                                            center={[delivery.latitude, delivery.longitude]}
                                            zoom={13}
                                            style={{ height: '320px' }}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; OpenStreetMap contributors'
                                            />
                                            <Marker position={[delivery.latitude, delivery.longitude]}>
                                                <Popup>📦 Your book is here!<br />{delivery.currentLocation}</Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>
                                ) : (
                                    <div className="tk-no-map">
                                        Location will appear here once the seller ships your order.
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            </div>
        </>
    );
};

export default TrackOrder;