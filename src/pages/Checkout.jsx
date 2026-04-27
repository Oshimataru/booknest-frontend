import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookById, placeOrder, createPaymentOrder, updateOrderStatus, createDelivery } from '../services/api';

const Checkout = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [book,    setBook]    = useState(null);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);
    const [error,   setError]   = useState('');

    useEffect(() => { fetchBook(); }, [id]);

    const fetchBook = async () => {
        try { const res = await getBookById(id); setBook(res.data); }
        catch { setError('Book not found.'); }
        finally { setLoading(false); }
    };

    const loadRazorpay = () => new Promise(resolve => {
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });

    const handlePayment = async () => {
        if (!address.trim()) { setError('Please enter your delivery address.'); return; }
        setPlacing(true); setError('');
        try {
            const loaded = await loadRazorpay();
            if (!loaded) { setError('Razorpay failed to load.'); return; }
            const orderRes = await createPaymentOrder(book.price);
            const { orderId, amount, keyId } = orderRes.data;
            const options = {
                key: keyId, amount: amount * 100, currency: 'INR',
                name: 'BookNest', description: `Payment for ${book.title}`,
                order_id: orderId,
                handler: async (response) => {
                    try {
                        const o = await placeOrder(id, book.type, address);
                        await updateOrderStatus(o.data.id, 'CONFIRMED');
                        await createDelivery(o.data.id);
                        navigate('/my-orders');
                    } catch (err) { setError(err.response?.data || 'Something went wrong.'); }
                },
                prefill: { name: 'BookNest User' },
                theme: { color: '#a07828' }
            };
            new window.Razorpay(options).open();
        } catch (err) { setError(err.response?.data || 'Something went wrong.'); }
        finally { setPlacing(false); }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Fraunces:ital,wght@0,600;1,400&display=swap');
                .co*{box-sizing:border-box;margin:0;padding:0;}
                .co{min-height:100vh;background:#f7f3ee;font-family:'Inter',sans-serif;color:#1a1610;display:flex;align-items:flex-start;justify-content:center;padding:48px 24px 80px;}
                .co-box{width:100%;max-width:520px;}

                .co-back{display:inline-flex;align-items:center;gap:6px;background:none;border:none;font-family:'Inter',sans-serif;font-size:13px;color:rgba(26,22,16,0.38);cursor:pointer;padding:0;margin-bottom:28px;transition:color 0.15s;}
                .co-back:hover{color:#a07828;}

                .co-title{font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:600;color:#1a1610;letter-spacing:-0.5px;line-height:1;margin-bottom:6px;}
                .co-title span{color:#a07828;font-style:italic;font-weight:400;}
                .co-sub{font-size:13px;font-weight:300;color:rgba(26,22,16,0.38);margin-bottom:28px;}

                .co-err{padding:12px 16px;border:1px solid rgba(180,60,50,0.2);border-radius:4px;background:rgba(200,60,50,0.05);color:rgba(180,60,50,0.8);font-size:13px;font-weight:300;margin-bottom:20px;}

                .co-loading{text-align:center;padding:80px 0;font-size:14px;font-weight:300;color:rgba(26,22,16,0.3);}
                .co-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#a07828;margin:0 3px;animation:coB 1.2s ease-in-out infinite;}
                .co-dot:nth-child(2){animation-delay:0.15s;}.co-dot:nth-child(3){animation-delay:0.3s;}
                @keyframes coB{0%,80%,100%{transform:scale(0.6);opacity:0.3;}40%{transform:scale(1);opacity:1;}}

                /* Book card */
                .co-book{display:flex;gap:16px;padding:18px;background:#faf7f2;border:1px solid rgba(160,120,40,0.12);border-radius:4px;margin-bottom:1px;}
                .co-book-img{width:64px;height:82px;border-radius:2px;overflow:hidden;background:#ede8e0;flex-shrink:0;border:1px solid rgba(160,120,40,0.1);}
                .co-book-img img{width:100%;height:100%;object-fit:cover;}
                .co-book-noimg{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:22px;color:rgba(160,120,40,0.2);}
                .co-book-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;}
                .co-book-type{font-size:10px;font-weight:500;letter-spacing:1px;text-transform:uppercase;color:#a07828;margin-bottom:2px;}
                .co-book-title{font-family:'Fraunces',serif;font-size:16px;font-weight:600;color:#1a1610;line-height:1.2;}
                .co-book-author{font-size:12px;font-weight:300;color:rgba(26,22,16,0.38);}
                .co-book-price{font-family:'Fraunces',serif;font-size:18px;font-weight:600;color:#a07828;margin-top:4px;}

                /* Summary */
                .co-summary{border:1px solid rgba(160,120,40,0.12);border-top:none;background:#faf7f2;margin-bottom:1px;}
                .co-sum-row{display:flex;justify-content:space-between;align-items:center;padding:11px 18px;border-bottom:1px solid rgba(160,120,40,0.07);}
                .co-sum-row:last-child{border-bottom:none;}
                .co-sum-label{font-size:13px;font-weight:300;color:rgba(26,22,16,0.45);}
                .co-sum-value{font-size:13px;font-weight:400;color:rgba(26,22,16,0.7);}
                .co-sum-free{font-size:13px;font-weight:500;color:#4a8c4a;}
                .co-sum-total .co-sum-label{font-weight:500;color:#1a1610;font-size:14px;}
                .co-sum-total .co-sum-value{font-family:'Fraunces',serif;font-size:18px;font-weight:600;color:#a07828;}

                /* Address */
                .co-addr-wrap{border:1px solid rgba(160,120,40,0.12);border-top:none;background:#faf7f2;padding:18px;margin-bottom:20px;}
                .co-addr-label{font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:rgba(160,120,40,0.45);margin-bottom:10px;}
                .co-textarea{width:100%;padding:10px 13px;background:#f7f3ee;border:1px solid rgba(160,120,40,0.16);border-radius:4px;color:#1a1610;font-family:'Inter',sans-serif;font-size:13.5px;font-weight:300;outline:none;resize:vertical;min-height:88px;line-height:1.6;transition:border-color 0.15s,background 0.15s;}
                .co-textarea::placeholder{color:rgba(26,22,16,0.2);}
                .co-textarea:focus{border-color:rgba(160,120,40,0.4);background:#f7f3ee;}

                /* Actions */
                .co-actions{display:flex;gap:10px;}
                .co-btn-back{padding:12px 20px;background:transparent;border:1px solid rgba(160,120,40,0.22);border-radius:4px;color:rgba(26,22,16,0.5);font-family:'Inter',sans-serif;font-size:13px;cursor:pointer;transition:border-color 0.15s,color 0.15s;}
                .co-btn-back:hover{border-color:rgba(160,120,40,0.4);color:rgba(26,22,16,0.8);}
                .co-btn-pay{flex:1;padding:13px;background:#a07828;color:#fff;border:none;border-radius:4px;font-family:'Inter',sans-serif;font-size:13.5px;font-weight:500;cursor:pointer;transition:background 0.15s,transform 0.15s;}
                .co-btn-pay:hover:not(:disabled){background:#b5892e;transform:translateY(-1px);}
                .co-btn-pay:disabled{opacity:0.5;cursor:not-allowed;transform:none;}

                @media(max-width:480px){.co{padding:32px 16px 60px;}.co-actions{flex-direction:column;}.co-btn-back{order:2;}.co-btn-pay{order:1;}}
            `}</style>

            <div className="co">
                <div className="co-box">
                    <button className="co-back" onClick={() => navigate(`/books/${id}`)}>← Back to book</button>

                    {loading ? (
                        <div className="co-loading"><span className="co-dot"/><span className="co-dot"/><span className="co-dot"/></div>
                    ) : !book ? (
                        <div className="co-err">Book not found.</div>
                    ) : (
                        <>
                            <h1 className="co-title">Confirm <span>Order</span></h1>
                            <p className="co-sub">Review your order and enter delivery details.</p>

                            {error && <div className="co-err">{error}</div>}

                            {/* Book */}
                            <div className="co-book">
                                <div className="co-book-img">
                                    {book.imageUrl
                                        ? <img src={book.imageUrl} alt={book.title} />
                                        : <div className="co-book-noimg">📚</div>
                                    }
                                </div>
                                <div className="co-book-info">
                                    <div className="co-book-type">{book.type}</div>
                                    <div className="co-book-title">{book.title}</div>
                                    <div className="co-book-author">by {book.author}</div>
                                    <div className="co-book-price">₹{book.price}</div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="co-summary">
                                <div className="co-sum-row">
                                    <span className="co-sum-label">Book price</span>
                                    <span className="co-sum-value">₹{book.price}</span>
                                </div>
                                <div className="co-sum-row">
                                    <span className="co-sum-label">Delivery</span>
                                    <span className="co-sum-free">Free</span>
                                </div>
                                <div className="co-sum-row co-sum-total">
                                    <span className="co-sum-label">Total</span>
                                    <span className="co-sum-value">₹{book.price}</span>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="co-addr-wrap">
                                <div className="co-addr-label">Delivery Address</div>
                                <textarea
                                    className="co-textarea"
                                    placeholder="Enter your full delivery address…"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    rows="3"
                                />
                            </div>

                            {/* Actions */}
                            <div className="co-actions">
                                <button className="co-btn-back" onClick={() => navigate(`/books/${id}`)}>← Back</button>
                                <button className="co-btn-pay" onClick={handlePayment} disabled={placing}>
                                    {placing ? 'Processing…' : `💳 Pay ₹${book.price}`}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Checkout;