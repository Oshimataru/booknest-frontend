import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addBook } from '../services/api';

const AddBook = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '', author: '', genre: '', description: '',
        price: '', rentPrice: '', condition: '',
        type: 'SELL', location: '', quantity: 1
    });

    const [image,   setImage]   = useState(null);
    const [preview, setPreview] = useState(null);
    const [error,   setError]   = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = new FormData();
            Object.keys(formData).forEach(k => data.append(k, formData[k]));
            if (image) data.append('image', image);
            await addBook(data);
            navigate('/books');
        } catch (err) {
            setError(err.response?.data || 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Fraunces:ital,wght@0,600;1,400&display=swap');

                .ab * { box-sizing: border-box; margin: 0; padding: 0; }

                .ab {
                    min-height: 100vh;
                    background: #0d1117;
                    font-family: 'Inter', sans-serif;
                    color: #e8dcc8;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding: 48px 24px 80px;
                }

                .ab-box {
                    width: 100%; max-width: 680px;
                }

                /* ── Header ── */
                .ab-header { margin-bottom: 36px; }
                .ab-title {
                    font-family: 'Fraunces', serif;
                    font-size: clamp(26px, 4vw, 38px);
                    font-weight: 600; color: #f0e6cc;
                    letter-spacing: -0.5px; line-height: 1;
                    margin-bottom: 6px;
                }
                .ab-title span { color: #c9a84c; font-style: italic; font-weight: 400; }
                .ab-sub {
                    font-size: 13px; font-weight: 300;
                    color: rgba(232,220,200,0.3);
                }

                /* ── Error ── */
                .ab-error {
                    padding: 12px 16px;
                    border: 1px solid rgba(220,80,80,0.25);
                    border-radius: 4px;
                    background: rgba(220,80,80,0.06);
                    color: rgba(240,120,100,0.85);
                    font-size: 13px; font-weight: 300;
                    margin-bottom: 24px;
                }

                /* ── Section label ── */
                .ab-section {
                    font-size: 10.5px; font-weight: 500;
                    letter-spacing: 2px; text-transform: uppercase;
                    color: rgba(201,168,76,0.4);
                    margin-bottom: 14px; margin-top: 28px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(201,168,76,0.08);
                }

                /* ── Form rows ── */
                .ab-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 14px;
                    margin-bottom: 14px;
                }
                .ab-group {
                    display: flex; flex-direction: column; gap: 6px;
                    margin-bottom: 14px;
                }
                .ab-group.no-mb { margin-bottom: 0; }

                .ab-label {
                    font-size: 12px; font-weight: 400;
                    color: rgba(232,220,200,0.45);
                    letter-spacing: 0.2px;
                }

                /* ── Inputs ── */
                .ab-input, .ab-select, .ab-textarea {
                    padding: 10px 13px;
                    background: rgba(201,168,76,0.04);
                    border: 1px solid rgba(201,168,76,0.15);
                    border-radius: 4px;
                    color: #e8dcc8;
                    font-family: 'Inter', sans-serif;
                    font-size: 13.5px; font-weight: 300;
                    outline: none;
                    transition: border-color 0.15s, background 0.15s;
                    width: 100%;
                }
                .ab-input::placeholder, .ab-textarea::placeholder {
                    color: rgba(232,220,200,0.18);
                }
                .ab-input:focus, .ab-select:focus, .ab-textarea:focus {
                    border-color: rgba(201,168,76,0.4);
                    background: rgba(201,168,76,0.07);
                }
                .ab-select {
                    appearance: none; -webkit-appearance: none; cursor: pointer;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none' stroke='rgba(201,168,76,0.4)' stroke-width='1.5' stroke-linecap='round'%3E%3Cpath d='M1 1l4 4 4-4'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                    padding-right: 32px;
                }
                .ab-select option { background: #111520; color: #e8dcc8; }
                .ab-textarea { resize: vertical; min-height: 96px; line-height: 1.6; }

                /* ── Image upload ── */
                .ab-upload-wrap {
                    border: 1px dashed rgba(201,168,76,0.2);
                    border-radius: 4px;
                    overflow: hidden;
                }
                .ab-upload-label {
                    display: flex; align-items: center; justify-content: center;
                    flex-direction: column; gap: 8px;
                    padding: 28px 20px; cursor: pointer;
                    transition: background 0.15s;
                    background: rgba(201,168,76,0.03);
                }
                .ab-upload-label:hover { background: rgba(201,168,76,0.06); }
                .ab-upload-icon {
                    font-size: 24px; color: rgba(201,168,76,0.3);
                }
                .ab-upload-text {
                    font-size: 13px; font-weight: 300;
                    color: rgba(232,220,200,0.3);
                }
                .ab-upload-hint {
                    font-size: 11px; color: rgba(232,220,200,0.18);
                }
                .ab-file-input { display: none; }

                .ab-preview {
                    width: 100%; max-height: 220px;
                    object-fit: cover;
                    display: block;
                    border-top: 1px solid rgba(201,168,76,0.1);
                }

                /* ── Submit ── */
                .ab-submit {
                    width: 100%; margin-top: 32px;
                    padding: 13px;
                    background: #c9a84c; color: #0d1117;
                    border: none; border-radius: 4px;
                    font-family: 'Inter', sans-serif;
                    font-size: 13.5px; font-weight: 500;
                    cursor: pointer;
                    transition: background 0.15s, transform 0.15s;
                    letter-spacing: 0.3px;
                }
                .ab-submit:hover:not(:disabled) { background: #d4b55a; transform: translateY(-1px); }
                .ab-submit:disabled {
                    opacity: 0.5; cursor: not-allowed; transform: none;
                }

                /* ── Divider line ── */
                .ab-divider {
                    height: 1px;
                    background: rgba(201,168,76,0.08);
                    margin: 28px 0;
                }

                @media (max-width: 540px) {
                    .ab { padding: 32px 16px 60px; }
                    .ab-row { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="ab">
                <div className="ab-box">

                    {/* Header */}
                    <div className="ab-header">
                        <h1 className="ab-title">Post a <span>Book</span></h1>
                        <p className="ab-sub">Fill in the details and connect with readers near you.</p>
                    </div>

                    {error && <div className="ab-error">{error}</div>}

                    <form onSubmit={handleSubmit}>

                        {/* Book details */}
                        <p className="ab-section">Book Details</p>

                        <div className="ab-row">
                            <div className="ab-group no-mb">
                                <label className="ab-label">Title</label>
                                <input className="ab-input" type="text" name="title"
                                    placeholder="Book title"
                                    value={formData.title}
                                    onChange={handleChange} required />
                            </div>
                            <div className="ab-group no-mb">
                                <label className="ab-label">Author</label>
                                <input className="ab-input" type="text" name="author"
                                    placeholder="Author name"
                                    value={formData.author}
                                    onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="ab-row">
                            <div className="ab-group no-mb">
                                <label className="ab-label">Genre</label>
                                <select className="ab-select" name="genre"
                                    value={formData.genre}
                                    onChange={handleChange} required>
                                    <option value="">Select genre</option>
                                    <option value="Fiction">Fiction</option>
                                    <option value="Non-Fiction">Non-Fiction</option>
                                    <option value="Fantasy">Fantasy</option>
                                    <option value="Science">Science</option>
                                    <option value="History">History</option>
                                    <option value="Biography">Biography</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="ab-group no-mb">
                                <label className="ab-label">Condition</label>
                                <select className="ab-select" name="condition"
                                    value={formData.condition}
                                    onChange={handleChange} required>
                                    <option value="">Select condition</option>
                                    <option value="New">New</option>
                                    <option value="Like New">Like New</option>
                                    <option value="Good">Good</option>
                                    <option value="Fair">Fair</option>
                                </select>
                            </div>
                        </div>

                        <div className="ab-group">
                            <label className="ab-label">Description</label>
                            <textarea className="ab-textarea" name="description"
                                placeholder="Describe the book — edition, notes, why you're listing it…"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3" required />
                        </div>

                        <div className="ab-divider" />

                        {/* Listing details */}
                        <p className="ab-section">Listing Details</p>

                        <div className="ab-row">
                            <div className="ab-group no-mb">
                                <label className="ab-label">Type</label>
                                <select className="ab-select" name="type"
                                    value={formData.type}
                                    onChange={handleChange}>
                                    <option value="SELL">Sell</option>
                                    <option value="RENT">Rent</option>
                                    <option value="EXCHANGE">Exchange</option>
                                </select>
                            </div>
                            <div className="ab-group no-mb">
                                <label className="ab-label">Location</label>
                                <input className="ab-input" type="text" name="location"
                                    placeholder="Your city"
                                    value={formData.location}
                                    onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="ab-row">
                            <div className="ab-group no-mb">
                                <label className="ab-label">Price (₹)</label>
                                <input className="ab-input" type="number" name="price"
                                    placeholder="0"
                                    value={formData.price}
                                    onChange={handleChange} required />
                            </div>
                            <div className="ab-group no-mb">
                                <label className="ab-label">Quantity</label>
                                <input className="ab-input" type="number" name="quantity"
                                    placeholder="1"
                                    value={formData.quantity}
                                    onChange={handleChange} min="1" required />
                            </div>
                        </div>

                        <div className="ab-divider" />

                        {/* Image */}
                        <p className="ab-section">Book Image</p>

                        <div className="ab-upload-wrap">
                            <label className="ab-upload-label" htmlFor="ab-file">
                                <span className="ab-upload-icon">📷</span>
                                <span className="ab-upload-text">
                                    {preview ? 'Change image' : 'Click to upload a cover image'}
                                </span>
                                <span className="ab-upload-hint">JPG, PNG, WEBP — max 5MB</span>
                            </label>
                            <input
                                id="ab-file"
                                className="ab-file-input"
                                type="file" accept="image/*"
                                onChange={handleImage}
                            />
                            {preview && (
                                <img src={preview} alt="preview" className="ab-preview" />
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="ab-submit"
                            disabled={loading}
                        >
                            {loading ? 'Posting…' : 'Post Book'}
                        </button>

                    </form>
                </div>
            </div>
        </>
    );
};

export default AddBook;
