import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOrders, cancelOrder } from '../services/api';

const statusStyle = {
    PENDING:   { bg: 'rgba(160,120,40,0.1)',  color: '#a07828',          border: 'rgba(160,120,40,0.25)'  },
    CONFIRMED: { bg: 'rgba(74,127,165,0.1)',  color: '#4a7fa5',          border: 'rgba(74,127,165,0.25)'  },
    SHIPPED:   { bg: 'rgba(122,104,168,0.1)', color: '#7a68a8',          border: 'rgba(122,104,168,0.25)' },
    DELIVERED: { bg: 'rgba(80,140,80,0.1)',   color: '#4a8c4a',          border: 'rgba(80,140,80,0.25)'   },
    CANCELLED: { bg: 'rgba(180,60,50,0.08)',  color: 'rgba(180,60,50,0.75)', border: 'rgba(180,60,50,0.2)' },
};

const MyOrders = () => {
    const navigate = useNavigate();
    const [orders,  setOrders]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try { const res = await getMyOrders(); setOrders(res.data); }
        catch { setError('Failed to load orders.'); }
        finally { setLoading(false); }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this order?')) return;
        try { await cancelOrder(id); fetchOrders(); }
        catch (err) { setError(err.response?.data || 'Something went wrong.'); }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Fraunces:ital,wght@0,600;1,400&display=swap');
                .mo*{box-sizing:border-box;margin:0;padding:0;}
                .mo{min-height:100vh;background:#f7f3ee;font-family:'Inter',sans-serif;color:#1a1610;padding:48px 32px 80px;}

                .mo-header{max-width:760px;margin:0 auto 32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}
                .mo-title{font-family:'Fraunces',serif;font-size:clamp(26px,4vw,40px);font-weight:600;color:#1a1610;letter-spacing:-0.5px;line-height:1;}
                .mo-title span{color:#a07828;font-style:italic;font-weight:400;}

                .mo-err{max-width:760px;margin:0 auto 20px;padding:12px 16px;border:1px solid rgba(180,60,50,0.2);border-radius:4px;background:rgba(200,60,50,0.05);color:rgba(180,60,50,0.8);font-size:13px;font-weight:300;}

                .mo-loading{max-width:760px;margin:80px auto;text-align:center;font-size:14px;font-weight:300;color:rgba(26,22,16,0.3);}
                .mo-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#a07828;margin:0 3px;animation:moB 1.2s ease-in-out infinite;}
                .mo-dot:nth-child(2){animation-delay:0.15s;}.mo-dot:nth-child(3){animation-delay:0.3s;}
                @keyframes moB{0%,80%,100%{transform:scale(0.6);opacity:0.3;}40%{transform:scale(1);opacity:1;}}

                .mo-empty{max-width:760px;margin:80px auto;text-align:center;}
                .mo-empty p{font-size:14px;font-weight:300;color:rgba(26,22,16,0.35);margin-bottom:16px;}
                .mo-browse{padding:10px 22px;background:#a07828;color:#fff;border:none;border-radius:4px;font-family:'Inter',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:background 0.15s;}
                .mo-browse:hover{background:#b5892e;}

                .mo-list{max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:1px;border:1px solid rgba(160,120,40,0.1);}

                .mo-card{background:#f7f3ee;padding:20px 24px;transition:background 0.15s;border-bottom:1px solid rgba(160,120,40,0.08);}
                .mo-card:last-child{border-bottom:none;}
                .mo-card:hover{background:#faf7f2;}

                /* Book row */
                .mo-book{display:flex;gap:16px;margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid rgba(160,120,40,0.07);}
                .mo-img{width:56px;height:72px;border-radius:2px;overflow:hidden;background:#ede8e0;flex-shrink:0;border:1px solid rgba(160,120,40,0.1);}
                .mo-img img{width:100%;height:100%;object-fit:cover;}
                .mo-noimg{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:20px;color:rgba(160,120,40,0.2);}
                .mo-info{flex:1;min-width:0;}
                .mo-book-title{font-family:'Fraunces',serif;font-size:16px;font-weight:600;color:#1a1610;line-height:1.25;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
                .mo-book-author{font-size:12px;font-weight:300;color:rgba(26,22,16,0.38);margin-bottom:6px;}
                .mo-book-type{display:inline-block;font-size:10px;font-weight:500;letter-spacing:1px;text-transform:uppercase;padding:2px 8px;border-radius:2px;background:rgba(160,120,40,0.1);color:#a07828;border:1px solid rgba(160,120,40,0.2);margin-bottom:6px;}
                .mo-amount{font-family:'Fraunces',serif;font-size:18px;font-weight:600;color:#a07828;}

                /* Details rows */
                .mo-details{display:flex;flex-direction:column;gap:8px;margin-bottom:16px;}
                .mo-row{display:flex;justify-content:space-between;align-items:center;gap:16px;}
                .mo-row-label{font-size:12px;font-weight:400;color:rgba(26,22,16,0.38);flex-shrink:0;}
                .mo-row-value{font-size:13px;font-weight:300;color:rgba(26,22,16,0.7);text-align:right;}
                .mo-row-id{font-size:13px;font-weight:500;color:rgba(26,22,16,0.5);font-family:'Inter',sans-serif;letter-spacing:0.3px;}
                .mo-status{display:inline-block;padding:3px 10px;border-radius:2px;font-size:11px;font-weight:500;letter-spacing:0.5px;text-transform:uppercase;border:1px solid;}

                /* Action buttons */
                .mo-actions{display:flex;gap:8px;padding-top:14px;border-top:1px solid rgba(160,120,40,0.07);}
                .mo-cancel{padding:8px 16px;background:transparent;border:1px solid rgba(180,60,50,0.22);border-radius:4px;color:rgba(180,60,50,0.65);font-family:'Inter',sans-serif;font-size:12.5px;font-weight:400;cursor:pointer;transition:background 0.15s,border-color 0.15s,color 0.15s;}
                .mo-cancel:hover{background:rgba(200,60,50,0.05);border-color:rgba(180,60,50,0.4);color:rgba(180,60,50,0.9);}
                .mo-track{padding:8px 16px;background:#a07828;border:none;border-radius:4px;color:#fff;font-family:'Inter',sans-serif;font-size:12.5px;font-weight:500;cursor:pointer;transition:background 0.15s;}
                .mo-track:hover{background:#b5892e;}

                @media(max-width:540px){.mo{padding:32px 16px 60px;}.mo-card{padding:16px;}.mo-row{flex-direction:column;align-items:flex-start;gap:2px;}.mo-row-value{text-align:left;}}
            `}</style>

            <div className="mo">
                <div className="mo-header">
                    <h1 className="mo-title">My <span>Orders</span></h1>
                </div>

                {error && <div className="mo-err">{error}</div>}

                {loading ? (
                    <div className="mo-loading"><span className="mo-dot"/><span className="mo-dot"/><span className="mo-dot"/></div>
                ) : orders.length === 0 ? (
                    <div className="mo-empty">
                        <p>No orders yet.</p>
                        <button className="mo-browse" onClick={() => navigate('/books')}>Browse Books</button>
                    </div>
                ) : (
                    <div className="mo-list">
                        {orders.map(order => {
                            const s = statusStyle[order.status] || statusStyle.PENDING;
                            return (
                                <div key={order.id} className="mo-card">
                                    {/* Book info */}
                                    <div className="mo-book">
                                        <div className="mo-img">
                                            {order.book?.imageUrl
                                                ? <img src={order.book.imageUrl} alt={order.book.title} />
                                                : <div className="mo-noimg">📚</div>
                                            }
                                        </div>
                                        <div className="mo-info">
                                            <div className="mo-book-title">{order.book?.title}</div>
                                            <div className="mo-book-author">by {order.book?.author}</div>
                                            <div className="mo-book-type">{order.type}</div>
                                            <div className="mo-amount">₹{order.amount}</div>
                                        </div>
                                    </div>

                                    {/* Order details */}
                                    <div className="mo-details">
                                        <div className="mo-row">
                                            <span className="mo-row-label">Order ID</span>
                                            <span className="mo-row-id"># {order.id}</span>
                                        </div>
                                        <div className="mo-row">
                                            <span className="mo-row-label">Address</span>
                                            <span className="mo-row-value">{order.address}</span>
                                        </div>
                                        <div className="mo-row">
                                            <span className="mo-row-label">Status</span>
                                            <span className="mo-status" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mo-actions">
                                        {order.status === 'PENDING' && (
                                            <button className="mo-cancel" onClick={() => handleCancel(order.id)}>Cancel Order</button>
                                        )}
                                        <button className="mo-track" onClick={() => navigate(`/track/${order.id}`)}>📍 Track Order</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default MyOrders;