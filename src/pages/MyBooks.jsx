import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBooks, deleteBook } from '../services/api';

const MyBooks = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchMyBooks(); }, []);

    const fetchMyBooks = async () => {
        try { const res = await getMyBooks(); setBooks(res.data); }
        catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this book?')) return;
        try { await deleteBook(id); fetchMyBooks(); }
        catch (err) { console.error(err); }
    };

    const typeColor = { SELL: '#a07828', RENT: '#4a7fa5', EXCHANGE: '#7a68a8' };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Fraunces:ital,wght@0,600;1,400&display=swap');
                .mb*{box-sizing:border-box;margin:0;padding:0;}
                .mb{min-height:100vh;background:#f7f3ee;font-family:'Inter',sans-serif;color:#1a1610;padding:48px 32px 80px;}

                .mb-header{max-width:1100px;margin:0 auto 32px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;}
                .mb-title{font-family:'Fraunces',serif;font-size:clamp(26px,4vw,40px);font-weight:600;color:#1a1610;letter-spacing:-0.5px;line-height:1;}
                .mb-title span{color:#a07828;font-style:italic;font-weight:400;}
                .mb-post-btn{padding:10px 22px;background:#a07828;color:#fff;border:none;border-radius:4px;font-family:'Inter',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:background 0.15s,transform 0.15s;white-space:nowrap;}
                .mb-post-btn:hover{background:#b5892e;transform:translateY(-1px);}

                .mb-loading,.mb-empty{max-width:1100px;margin:80px auto;text-align:center;font-size:14px;font-weight:300;color:rgba(26,22,16,0.3);}
                .mb-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#a07828;margin:0 3px;animation:mbB 1.2s ease-in-out infinite;}
                .mb-dot:nth-child(2){animation-delay:0.15s;}.mb-dot:nth-child(3){animation-delay:0.3s;}
                @keyframes mbB{0%,80%,100%{transform:scale(0.6);opacity:0.3;}40%{transform:scale(1);opacity:1;}}
                .mb-empty-btn{margin-top:16px;padding:10px 22px;background:#a07828;color:#fff;border:none;border-radius:4px;font-family:'Inter',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:background 0.15s;}
                .mb-empty-btn:hover{background:#b5892e;}

                .mb-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:1px;border:1px solid rgba(160,120,40,0.1);}

                .mb-card{background:#f7f3ee;display:flex;flex-direction:column;border-right:1px solid rgba(160,120,40,0.08);border-bottom:1px solid rgba(160,120,40,0.08);position:relative;transition:background 0.18s;}
                .mb-card:hover{background:#faf7f2;}

                .mb-img{width:100%;aspect-ratio:3/4;background:#ede8e0;overflow:hidden;position:relative;border-bottom:1px solid rgba(160,120,40,0.08);cursor:pointer;}
                .mb-img img{width:100%;height:100%;object-fit:cover;transition:transform 0.3s;}
                .mb-card:hover .mb-img img{transform:scale(1.04);}
                .mb-noimg{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px;color:rgba(160,120,40,0.2);background:repeating-linear-gradient(45deg,rgba(160,120,40,0.03),rgba(160,120,40,0.03) 1px,transparent 1px,transparent 12px);}

                .mb-badge{position:absolute;top:10px;left:10px;padding:3px 9px;border-radius:2px;font-size:10px;font-weight:500;letter-spacing:1px;text-transform:uppercase;color:#fff;}
                .mb-status{position:absolute;top:10px;right:10px;padding:3px 9px;border-radius:2px;font-size:10px;font-weight:500;letter-spacing:0.5px;text-transform:uppercase;}
                .mb-status.avail{background:rgba(160,120,40,0.12);color:#a07828;border:1px solid rgba(160,120,40,0.2);}
                .mb-status.sold{background:rgba(26,22,16,0.06);color:rgba(26,22,16,0.4);border:1px solid rgba(26,22,16,0.1);}

                .mb-body{padding:14px 14px 10px;flex:1;display:flex;flex-direction:column;gap:3px;}
                .mb-book-title{font-family:'Fraunces',serif;font-size:14px;font-weight:600;color:#1a1610;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;cursor:pointer;}
                .mb-book-title:hover{color:#a07828;}
                .mb-author{font-size:12px;font-weight:300;color:rgba(26,22,16,0.38);}
                .mb-price{font-family:'Fraunces',serif;font-size:15px;font-weight:600;color:#a07828;margin-top:6px;}
                .mb-price.ex{font-size:12px;font-weight:400;color:rgba(160,120,40,0.5);font-family:'Inter',sans-serif;}
                .mb-cond{font-size:11px;font-weight:300;color:rgba(26,22,16,0.3);}

                .mb-actions{display:flex;gap:8px;padding:10px 14px 14px;border-top:1px solid rgba(160,120,40,0.07);margin-top:auto;}
                .mb-edit{flex:1;padding:8px;background:transparent;border:1px solid rgba(160,120,40,0.25);border-radius:4px;color:#a07828;font-family:'Inter',sans-serif;font-size:12px;font-weight:500;cursor:pointer;transition:background 0.15s,border-color 0.15s;}
                .mb-edit:hover{background:rgba(160,120,40,0.07);border-color:rgba(160,120,40,0.45);}
                .mb-del{flex:1;padding:8px;background:transparent;border:1px solid rgba(180,60,50,0.2);border-radius:4px;color:rgba(180,60,50,0.65);font-family:'Inter',sans-serif;font-size:12px;font-weight:500;cursor:pointer;transition:background 0.15s,border-color 0.15s;}
                .mb-del:hover{background:rgba(200,60,50,0.05);border-color:rgba(180,60,50,0.4);color:rgba(180,60,50,0.9);}

                @media(max-width:640px){.mb{padding:32px 16px 60px;}.mb-grid{grid-template-columns:repeat(auto-fill,minmax(155px,1fr));}}
            `}</style>

            <div className="mb">
                <div className="mb-header">
                    <h1 className="mb-title">My <span>Books</span></h1>
                    <button className="mb-post-btn" onClick={() => navigate('/add-book')}>+ Post New Book</button>
                </div>

                {loading ? (
                    <div className="mb-loading"><span className="mb-dot"/><span className="mb-dot"/><span className="mb-dot"/></div>
                ) : books.length === 0 ? (
                    <div className="mb-empty">
                        <p>You haven't posted any books yet.</p>
                        <button className="mb-empty-btn" onClick={() => navigate('/add-book')}>Post your first book</button>
                    </div>
                ) : (
                    <div className="mb-grid">
                        {books.map(book => (
                            <div key={book.id} className="mb-card">
                                <div className="mb-img" onClick={() => navigate(`/books/${book.id}`)}>
                                    {book.imageUrl
                                        ? <img src={book.imageUrl} alt={book.title} />
                                        : <div className="mb-noimg">📚</div>
                                    }
                                    <span className="mb-badge" style={{ background: typeColor[book.type] || '#a07828' }}>{book.type}</span>
                                    <span className={`mb-status ${book.status === 'AVAILABLE' ? 'avail' : 'sold'}`}>{book.status}</span>
                                </div>

                                <div className="mb-body">
                                    <div className="mb-book-title" onClick={() => navigate(`/books/${book.id}`)}>{book.title}</div>
                                    <div className="mb-author">by {book.author}</div>
                                    {book.type === 'EXCHANGE'
                                        ? <div className="mb-price ex">Free Exchange</div>
                                        : <div className="mb-price">₹{book.price}</div>
                                    }
                                    <div className="mb-cond">{book.condition}</div>
                                </div>

                                <div className="mb-actions">
                                    <button className="mb-edit" onClick={() => navigate(`/edit-book/${book.id}`)}>✏️ Edit</button>
                                    <button className="mb-del"  onClick={() => handleDelete(book.id)}>🗑️ Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default MyBooks;