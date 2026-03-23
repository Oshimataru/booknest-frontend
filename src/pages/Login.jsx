import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error,    setError]    = useState('');
    const [loading,  setLoading]  = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await loginUser(formData);
            login(res.data, res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data || 'Something went wrong.');
        } finally { setLoading(false); }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Fraunces:ital,wght@0,600;1,400&display=swap');
                .lg*{box-sizing:border-box;margin:0;padding:0;}
                .lg{min-height:100vh;background:#f7f3ee;font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:center;padding:32px 20px;}
                .lg-box{width:100%;max-width:400px;}

                .lg-brand{font-family:'Fraunces',serif;font-size:22px;font-weight:600;color:#1a1610;letter-spacing:-0.3px;margin-bottom:32px;cursor:pointer;width:fit-content;}
                .lg-brand span{color:#a07828;}

                .lg-title{font-family:'Fraunces',serif;font-size:clamp(24px,4vw,32px);font-weight:600;color:#1a1610;letter-spacing:-0.5px;line-height:1;margin-bottom:6px;}
                .lg-title span{color:#a07828;font-style:italic;font-weight:400;}
                .lg-sub{font-size:13px;font-weight:300;color:rgba(26,22,16,0.4);margin-bottom:28px;}

                .lg-err{padding:11px 14px;border:1px solid rgba(180,60,50,0.2);border-radius:4px;background:rgba(200,60,50,0.05);color:rgba(180,60,50,0.8);font-size:13px;font-weight:300;margin-bottom:20px;}

                .lg-group{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;}
                .lg-label{font-size:12px;font-weight:400;color:rgba(26,22,16,0.45);}
                .lg-input{padding:10px 13px;background:#faf7f2;border:1px solid rgba(160,120,40,0.16);border-radius:4px;color:#1a1610;font-family:'Inter',sans-serif;font-size:13.5px;font-weight:300;outline:none;transition:border-color 0.15s,background 0.15s;width:100%;}
                .lg-input::placeholder{color:rgba(26,22,16,0.2);}
                .lg-input:focus{border-color:rgba(160,120,40,0.4);background:#f7f3ee;}

                .lg-btn{width:100%;margin-top:8px;padding:12px;background:#a07828;color:#fff;border:none;border-radius:4px;font-family:'Inter',sans-serif;font-size:13.5px;font-weight:500;cursor:pointer;transition:background 0.15s,transform 0.15s;}
                .lg-btn:hover:not(:disabled){background:#b5892e;transform:translateY(-1px);}
                .lg-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}

                .lg-divider{height:1px;background:rgba(160,120,40,0.1);margin:22px 0;}

                .lg-footer{font-size:13px;font-weight:300;color:rgba(26,22,16,0.4);text-align:center;}
                .lg-footer a{color:#a07828;text-decoration:none;font-weight:400;transition:color 0.15s;}
                .lg-footer a:hover{color:#b5892e;}
            `}</style>

            <div className="lg">
                <div className="lg-box">
                    <div className="lg-brand" onClick={() => navigate('/')}>Book<span>Nest</span></div>

                    <h1 className="lg-title">Welcome <span>back</span></h1>
                    <p className="lg-sub">Sign in to your account to continue.</p>

                    {error && <div className="lg-err">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="lg-group">
                            <label className="lg-label">Email</label>
                            <input className="lg-input" type="email" name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange} required />
                        </div>
                        <div className="lg-group">
                            <label className="lg-label">Password</label>
                            <input className="lg-input" type="password" name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange} required />
                        </div>
                        <button className="lg-btn" type="submit" disabled={loading}>
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <div className="lg-divider" />
                    <p className="lg-footer">Don't have an account? <Link to="/register">Register</Link></p>
                </div>
            </div>
        </>
    );
};

export default Login;