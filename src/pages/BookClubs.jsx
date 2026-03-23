import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllClubs, createClub, joinClub } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookClubs = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [clubs,      setClubs]      = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [error,      setError]      = useState('');
    const [formData,   setFormData]   = useState({ name: '', description: '', currentBook: '' });

    useEffect(() => { fetchClubs(); }, []);

    const fetchClubs = async () => {
        try { const res = await getAllClubs(); setClubs(res.data); }
        catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await createClub(formData.name, formData.description, formData.currentBook);
            setShowCreate(false);
            setFormData({ name: '', description: '', currentBook: '' });
            navigate(`/clubs/${res.data.id}`);
        } catch (err) { setError(err.response?.data || 'Something went wrong.'); }
    };

    const handleJoin = async (id) => {
        try { await joinClub(id); navigate(`/clubs/${id}`); }
        catch (err) { setError(err.response?.data || 'Something went wrong.'); }
    };

    const isMember = (club) => club.members?.some(m => m.email === user?.email);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Fraunces:ital,wght@0,600;1,400&display=swap');
                .cl*{box-sizing:border-box;margin:0;padding:0;}
                .cl{min-height:100vh;background:#f7f3ee;font-family:'Inter',sans-serif;color:#1a1610;padding:48px 32px 80px;}

                .cl-header{max-width:1100px;margin:0 auto 32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;}
                .cl-title{font-family:'Fraunces',serif;font-size:clamp(26px,4vw,40px);font-weight:600;color:#1a1610;letter-spacing:-0.5px;line-height:1;}
                .cl-title span{color:#a07828;font-style:italic;font-weight:400;}
                .cl-create-btn{padding:10px 22px;background:#a07828;color:#fff;border:none;border-radius:4px;font-family:'Inter',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:background 0.15s,transform 0.15s;}
                .cl-create-btn:hover{background:#b5892e;transform:translateY(-1px);}

                .cl-err{max-width:1100px;margin:0 auto 20px;padding:12px 16px;border:1px solid rgba(180,60,50,0.2);border-radius:4px;background:rgba(200,60,50,0.05);color:rgba(180,60,50,0.8);font-size:13px;font-weight:300;}

                /* Create form panel */
                .cl-form-wrap{max-width:1100px;margin:0 auto 28px;border:1px solid rgba(160,120,40,0.18);border-radius:4px;background:#faf7f2;overflow:hidden;}
                .cl-form-header{padding:16px 24px;border-bottom:1px solid rgba(160,120,40,0.1);display:flex;align-items:center;justify-content:space-between;}
                .cl-form-title{font-family:'Fraunces',serif;font-size:17px;font-weight:600;color:#1a1610;letter-spacing:-0.3px;}
                .cl-form-close{background:none;border:none;font-size:18px;color:rgba(26,22,16,0.3);cursor:pointer;line-height:1;padding:2px 6px;transition:color 0.15s;}
                .cl-form-close:hover{color:rgba(26,22,16,0.7);}
                .cl-form{padding:20px 24px;display:flex;flex-direction:column;gap:12px;}
                .cl-input,.cl-textarea{padding:10px 13px;background:#f7f3ee;border:1px solid rgba(160,120,40,0.16);border-radius:4px;color:#1a1610;font-family:'Inter',sans-serif;font-size:13.5px;font-weight:300;outline:none;transition:border-color 0.15s,background 0.15s;width:100%;}
                .cl-input::placeholder,.cl-textarea::placeholder{color:rgba(26,22,16,0.22);}
                .cl-input:focus,.cl-textarea:focus{border-color:rgba(160,120,40,0.4);background:#f7f3ee;}
                .cl-textarea{resize:vertical;min-height:80px;line-height:1.6;}
                .cl-form-actions{display:flex;gap:10px;justify-content:flex-end;}
                .cl-cancel{padding:9px 18px;background:transparent;border:1px solid rgba(160,120,40,0.2);border-radius:4px;color:rgba(26,22,16,0.5);font-family:'Inter',sans-serif;font-size:13px;cursor:pointer;transition:border-color 0.15s,color 0.15s;}
                .cl-cancel:hover{border-color:rgba(160,120,40,0.4);color:rgba(26,22,16,0.8);}
                .cl-submit{padding:9px 20px;background:#a07828;border:none;border-radius:4px;color:#fff;font-family:'Inter',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:background 0.15s;}
                .cl-submit:hover{background:#b5892e;}

                .cl-loading,.cl-empty{max-width:1100px;margin:80px auto;text-align:center;font-size:14px;font-weight:300;color:rgba(26,22,16,0.3);}
                .cl-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#a07828;margin:0 3px;animation:clB 1.2s ease-in-out infinite;}
                .cl-dot:nth-child(2){animation-delay:0.15s;}.cl-dot:nth-child(3){animation-delay:0.3s;}
                @keyframes clB{0%,80%,100%{transform:scale(0.6);opacity:0.3;}40%{transform:scale(1);opacity:1;}}

                /* Grid */
                .cl-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1px;border:1px solid rgba(160,120,40,0.1);}

                .cl-card{background:#f7f3ee;padding:22px;display:flex;flex-direction:column;gap:8px;border-right:1px solid rgba(160,120,40,0.08);border-bottom:1px solid rgba(160,120,40,0.08);transition:background 0.18s;}
                .cl-card:hover{background:#faf7f2;}

                .cl-card-icon{font-size:22px;margin-bottom:2px;}
                .cl-card-name{font-family:'Fraunces',serif;font-size:18px;font-weight:600;color:#1a1610;line-height:1.2;letter-spacing:-0.3px;}
                .cl-card-desc{font-size:13px;font-weight:300;color:rgba(26,22,16,0.45);line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
                .cl-card-book{font-size:12px;font-weight:400;color:rgba(160,120,40,0.7);padding:5px 10px;background:rgba(160,120,40,0.07);border:1px solid rgba(160,120,40,0.15);border-radius:2px;width:fit-content;display:flex;align-items:center;gap:5px;}

                .cl-card-footer{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:14px;border-top:1px solid rgba(160,120,40,0.07);}
                .cl-members{font-size:12px;font-weight:300;color:rgba(26,22,16,0.35);}
                .cl-btns{display:flex;gap:8px;align-items:center;}
                .cl-view{padding:7px 14px;background:transparent;border:1px solid rgba(160,120,40,0.22);border-radius:4px;color:#a07828;font-family:'Inter',sans-serif;font-size:12.5px;cursor:pointer;transition:background 0.15s,border-color 0.15s;}
                .cl-view:hover{background:rgba(160,120,40,0.07);border-color:rgba(160,120,40,0.4);}
                .cl-join{padding:7px 14px;background:#a07828;border:none;border-radius:4px;color:#fff;font-family:'Inter',sans-serif;font-size:12.5px;font-weight:500;cursor:pointer;transition:background 0.15s;}
                .cl-join:hover{background:#b5892e;}
                .cl-joined{font-size:12px;font-weight:400;color:#4a8c4a;padding:4px 10px;background:rgba(80,140,80,0.08);border:1px solid rgba(80,140,80,0.2);border-radius:2px;}

                @media(max-width:640px){.cl{padding:32px 16px 60px;}.cl-grid{grid-template-columns:1fr;}.cl-form{padding:16px;}}
            `}</style>

            <div className="cl">
                <div className="cl-header">
                    <h1 className="cl-title">Book <span>Clubs</span></h1>
                    {user && (
                        <button className="cl-create-btn" onClick={() => setShowCreate(o => !o)}>
                            + Create Club
                        </button>
                    )}
                </div>

                {error && <div className="cl-err">{error}</div>}

                {/* Create form */}
                {showCreate && (
                    <div className="cl-form-wrap">
                        <div className="cl-form-header">
                            <span className="cl-form-title">Create a new club</span>
                            <button className="cl-form-close" onClick={() => setShowCreate(false)}>×</button>
                        </div>
                        <form className="cl-form" onSubmit={handleCreate}>
                            <input className="cl-input" type="text" placeholder="Club name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required />
                            <textarea className="cl-textarea" placeholder="Description…"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows="3" required />
                            <input className="cl-input" type="text" placeholder="Currently reading (optional)"
                                value={formData.currentBook}
                                onChange={e => setFormData({ ...formData, currentBook: e.target.value })} />
                            <div className="cl-form-actions">
                                <button type="button" className="cl-cancel" onClick={() => setShowCreate(false)}>Cancel</button>
                                <button type="submit" className="cl-submit">Create Club</button>
                            </div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="cl-loading"><span className="cl-dot"/><span className="cl-dot"/><span className="cl-dot"/></div>
                ) : clubs.length === 0 ? (
                    <div className="cl-empty">No book clubs yet. Create the first one!</div>
                ) : (
                    <div className="cl-grid">
                        {clubs.map(club => (
                            <div key={club.id} className="cl-card">
                                <div className="cl-card-icon">📖</div>
                                <div className="cl-card-name">{club.name}</div>
                                <div className="cl-card-desc">{club.description}</div>
                                {club.currentBook && (
                                    <div className="cl-card-book">
                                        <span>📚</span> {club.currentBook}
                                    </div>
                                )}
                                <div className="cl-card-footer">
                                    <span className="cl-members">👥 {club.members?.length || 0} members</span>
                                    <div className="cl-btns">
                                        <button className="cl-view" onClick={() => navigate(`/clubs/${club.id}`)}>View</button>
                                        {isMember(club)
                                            ? <span className="cl-joined">✓ Joined</span>
                                            : <button className="cl-join" onClick={() => handleJoin(club.id)}>Join</button>
                                        }
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default BookClubs;