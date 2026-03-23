import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClubById, getDiscussions, postDiscussion, leaveClub } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ClubDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [club,        setClub]        = useState(null);
    const [discussions, setDiscussions] = useState([]);
    const [message,     setMessage]     = useState('');
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState('');

    useEffect(() => { fetchClub(); fetchDiscussions(); }, [id]);

    const fetchClub = async () => {
        try { const res = await getClubById(id); setClub(res.data); }
        catch { setError('Club not found.'); }
        finally { setLoading(false); }
    };

    const fetchDiscussions = async () => {
        try { const res = await getDiscussions(id); setDiscussions(res.data); }
        catch (err) { console.error(err); }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        try { await postDiscussion(id, message); setMessage(''); fetchDiscussions(); }
        catch (err) { setError(err.response?.data || 'Something went wrong.'); }
    };

    const handleLeave = async () => {
        try { await leaveClub(id); navigate('/clubs'); }
        catch (err) { setError(err.response?.data || 'Something went wrong.'); }
    };

    const fmt = (d) => new Date(d).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Fraunces:ital,wght@0,600;1,400&display=swap');
                .cd*{box-sizing:border-box;margin:0;padding:0;}
                .cd{min-height:100vh;background:#f7f3ee;font-family:'Inter',sans-serif;color:#1a1610;padding:48px 32px 80px;}
                .cd-wrap{max-width:1000px;margin:0 auto;}

                .cd-back{display:inline-flex;align-items:center;gap:6px;background:none;border:none;font-family:'Inter',sans-serif;font-size:13px;color:rgba(26,22,16,0.38);cursor:pointer;padding:0;margin-bottom:24px;transition:color 0.15s;}
                .cd-back:hover{color:#a07828;}

                .cd-loading{text-align:center;padding:80px 0;font-size:14px;font-weight:300;color:rgba(26,22,16,0.3);}
                .cd-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#a07828;margin:0 3px;animation:cdB 1.2s ease-in-out infinite;}
                .cd-dot:nth-child(2){animation-delay:0.15s;}.cd-dot:nth-child(3){animation-delay:0.3s;}
                @keyframes cdB{0%,80%,100%{transform:scale(0.6);opacity:0.3;}40%{transform:scale(1);opacity:1;}}

                .cd-err{padding:12px 16px;border:1px solid rgba(180,60,50,0.2);border-radius:4px;background:rgba(200,60,50,0.05);color:rgba(180,60,50,0.8);font-size:13px;font-weight:300;margin-bottom:20px;}

                /* Club header card */
                .cd-hero{background:#faf7f2;border:1px solid rgba(160,120,40,0.12);padding:24px 28px;border-bottom:none;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;}
                .cd-hero-left{flex:1;min-width:0;}
                .cd-club-name{font-family:'Fraunces',serif;font-size:clamp(22px,3vw,30px);font-weight:600;color:#1a1610;letter-spacing:-0.4px;line-height:1.15;margin-bottom:6px;}
                .cd-club-desc{font-size:14px;font-weight:300;color:rgba(26,22,16,0.45);line-height:1.6;margin-bottom:10px;}
                .cd-reading{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:400;color:rgba(160,120,40,0.75);padding:5px 12px;background:rgba(160,120,40,0.07);border:1px solid rgba(160,120,40,0.15);border-radius:2px;}
                .cd-hero-right{display:flex;flex-direction:column;align-items:flex-end;gap:10px;flex-shrink:0;}
                .cd-members-count{font-size:13px;font-weight:300;color:rgba(26,22,16,0.38);}
                .cd-leave{padding:8px 16px;background:transparent;border:1px solid rgba(180,60,50,0.2);border-radius:4px;color:rgba(180,60,50,0.6);font-family:'Inter',sans-serif;font-size:12.5px;cursor:pointer;transition:background 0.15s,border-color 0.15s,color 0.15s;}
                .cd-leave:hover{background:rgba(200,60,50,0.05);border-color:rgba(180,60,50,0.4);color:rgba(180,60,50,0.9);}

                /* Body grid */
                .cd-body{display:grid;grid-template-columns:220px 1fr;gap:0;border:1px solid rgba(160,120,40,0.12);}

                /* Members panel */
                .cd-members{border-right:1px solid rgba(160,120,40,0.1);background:#faf7f2;}
                .cd-panel-head{padding:13px 16px;border-bottom:1px solid rgba(160,120,40,0.08);font-size:10.5px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:rgba(160,120,40,0.45);}
                .cd-member-item{display:flex;align-items:center;gap:10px;padding:11px 16px;border-bottom:1px solid rgba(160,120,40,0.06);transition:background 0.14s;}
                .cd-member-item:last-child{border-bottom:none;}
                .cd-member-item:hover{background:rgba(160,120,40,0.04);}
                .cd-member-av{width:28px;height:28px;border-radius:3px;background:#a07828;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:13px;font-weight:600;color:#fff;flex-shrink:0;}
                .cd-member-name{font-size:13px;font-weight:400;color:rgba(26,22,16,0.7);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
                .cd-admin-badge{font-size:9.5px;font-weight:500;letter-spacing:0.8px;text-transform:uppercase;padding:2px 6px;background:rgba(160,120,40,0.1);border:1px solid rgba(160,120,40,0.2);border-radius:2px;color:rgba(160,120,40,0.7);flex-shrink:0;}

                /* Discussions panel */
                .cd-disc{display:flex;flex-direction:column;background:#f7f3ee;}
                .cd-disc-list{flex:1;padding:0;overflow-y:auto;max-height:520px;}
                .cd-disc-empty{padding:36px 20px;text-align:center;font-size:13px;font-weight:300;color:rgba(26,22,16,0.3);}
                .cd-disc-item{display:flex;gap:12px;padding:16px 20px;border-bottom:1px solid rgba(160,120,40,0.07);}
                .cd-disc-item:last-child{border-bottom:none;}
                .cd-disc-av{width:32px;height:32px;border-radius:3px;background:#a07828;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:14px;font-weight:600;color:#fff;flex-shrink:0;margin-top:2px;}
                .cd-disc-av.me{background:#1a1610;}
                .cd-disc-content{flex:1;min-width:0;}
                .cd-disc-header{display:flex;align-items:baseline;gap:10px;margin-bottom:5px;flex-wrap:wrap;}
                .cd-disc-name{font-size:13px;font-weight:500;color:#1a1610;}
                .cd-disc-time{font-size:11px;font-weight:300;color:rgba(26,22,16,0.28);}
                .cd-disc-msg{font-size:14px;font-weight:300;color:rgba(26,22,16,0.7);line-height:1.6;}

                /* Post form */
                .cd-post-form{display:flex;gap:0;border-top:1px solid rgba(160,120,40,0.1);background:#faf7f2;}
                .cd-post-input{flex:1;padding:14px 16px;background:transparent;border:none;outline:none;font-family:'Inter',sans-serif;font-size:13.5px;font-weight:300;color:#1a1610;}
                .cd-post-input::placeholder{color:rgba(26,22,16,0.22);}
                .cd-post-btn{padding:14px 22px;background:#a07828;border:none;color:#fff;font-family:'Inter',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:background 0.15s;white-space:nowrap;flex-shrink:0;}
                .cd-post-btn:hover{background:#b5892e;}

                @media(max-width:680px){
                    .cd{padding:32px 16px 60px;}
                    .cd-body{grid-template-columns:1fr;}
                    .cd-members{border-right:none;border-bottom:1px solid rgba(160,120,40,0.1);}
                    .cd-disc-list{max-height:360px;}
                    .cd-hero{padding:18px;}
                    .cd-hero-right{align-items:flex-start;}
                }
            `}</style>

            <div className="cd">
                <div className="cd-wrap">
                    <button className="cd-back" onClick={() => navigate('/clubs')}>← Back to clubs</button>

                    {loading ? (
                        <div className="cd-loading"><span className="cd-dot"/><span className="cd-dot"/><span className="cd-dot"/></div>
                    ) : !club ? (
                        <div className="cd-err">Club not found.</div>
                    ) : (() => {
                        const isMember = club.members?.some(m => m.email === user?.email);
                        return (
                            <>
                                {error && <div className="cd-err">{error}</div>}

                                {/* Hero */}
                                <div className="cd-hero">
                                    <div className="cd-hero-left">
                                        <div className="cd-club-name">{club.name}</div>
                                        <div className="cd-club-desc">{club.description}</div>
                                        {club.currentBook && (
                                            <div className="cd-reading">📚 Reading: {club.currentBook}</div>
                                        )}
                                    </div>
                                    <div className="cd-hero-right">
                                        <span className="cd-members-count">👥 {club.members?.length || 0} members</span>
                                        {isMember && (
                                            <button className="cd-leave" onClick={handleLeave}>Leave Club</button>
                                        )}
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="cd-body">
                                    {/* Members */}
                                    <div className="cd-members">
                                        <div className="cd-panel-head">Members</div>
                                        {club.members?.map(m => (
                                            <div key={m.id} className="cd-member-item">
                                                <div className="cd-member-av">{m.name?.charAt(0).toUpperCase()}</div>
                                                <span className="cd-member-name">{m.name}</span>
                                                {m.id === club.creator?.id && <span className="cd-admin-badge">Admin</span>}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Discussions */}
                                    <div className="cd-disc">
                                        <div className="cd-panel-head">Discussions</div>
                                        <div className="cd-disc-list">
                                            {discussions.length === 0 ? (
                                                <div className="cd-disc-empty">No discussions yet. Start one!</div>
                                            ) : discussions.map(disc => (
                                                <div key={disc.id} className="cd-disc-item">
                                                    <div className={`cd-disc-av${disc.user?.email === user?.email ? ' me' : ''}`}>
                                                        {disc.user?.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="cd-disc-content">
                                                        <div className="cd-disc-header">
                                                            <span className="cd-disc-name">{disc.user?.name}</span>
                                                            <span className="cd-disc-time">{fmt(disc.createdAt)}</span>
                                                        </div>
                                                        <div className="cd-disc-msg">{disc.message}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {isMember && (
                                            <form className="cd-post-form" onSubmit={handlePost}>
                                                <input
                                                    className="cd-post-input"
                                                    type="text"
                                                    placeholder="Write a message…"
                                                    value={message}
                                                    onChange={e => setMessage(e.target.value)}
                                                />
                                                <button type="submit" className="cd-post-btn">Send</button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>
        </>
    );
};

export default ClubDetail;