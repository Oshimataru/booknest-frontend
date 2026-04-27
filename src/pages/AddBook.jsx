import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addBook } from '../services/api';

const AddBook = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ title: '', author: '', genre: '', description: '', price: '', rentPrice: '', condition: '', type: 'SELL', location: '', quantity: 1 });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const numericFields = ['price', 'rentPrice', 'quantity'];
        const nextFormData = {
            ...formData,
            [name]: numericFields.includes(name) ? (value === '' ? '' : Number(value)) : value,
        };

        if (name === 'price' && nextFormData.type === 'RENT') {
            nextFormData.rentPrice = nextFormData.price ? Number((nextFormData.price * 0.3).toFixed(2)) : '';
        }

        if (name === 'type') {
            if (value === 'RENT') {
                nextFormData.rentPrice = nextFormData.price ? Number((nextFormData.price * 0.3).toFixed(2)) : '';
            } else {
                nextFormData.rentPrice = '';
            }
        }

        setFormData(nextFormData);
    };

    const handleImage = (e) => { const f = e.target.files[0]; if (!f) return; setImage(f); setPreview(URL.createObjectURL(f)); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const data = new FormData();
            Object.keys(formData).forEach(k => data.append(k, formData[k]));
            if (image) data.append('image', image);
            await addBook(data);
            navigate('/books');
        } catch (err) { setError(err.response?.data || 'Something went wrong!'); }
        finally { setLoading(false); }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Fraunces:ital,wght@0,600;1,400&display=swap');

                .ab-container {
                    min-height: 100vh;
                    background: #000000;
                    font-family: 'Inter', sans-serif;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding: 100px 20px 60px;
                }

                .ab-box {
                    width: 100%;
                    max-width: 600px;
                    background: #0a0a0a;
                    padding: 40px;
                    border: 1px solid #1a1a1a;
                    border-radius: 12px;
                    box-sizing: border-box;
                }

                .ab-title {
                    font-family: 'Fraunces', serif;
                    font-size: 32px;
                    color: #ffffff;
                    margin-bottom: 8px;
                }
                .ab-title span { color: #d4af37; font-style: italic; }

                .ab-sub {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 32px;
                }

                .ab-err {
                    padding: 12px;
                    background: rgba(255, 69, 58, 0.1);
                    color: #ff453a;
                    border: 1px solid rgba(255, 69, 58, 0.2);
                    border-radius: 6px;
                    font-size: 13px;
                    margin-bottom: 24px;
                }

                .ab-sec {
                    font-size: 11px;
                    color: #d4af37;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    margin: 24px 0 16px;
                    font-weight: 600;
                }

                .ab-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .ab-group {
                    margin-bottom: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .ab-label {
                    font-size: 11px;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* INPUT & TEXTAREA */
                .ab-input, .ab-textarea {
                    padding: 12px 14px;
                    background: #121212;
                    border: 1px solid #222;
                    border-radius: 6px;
                    color: #fff;
                    font-size: 14px;
                    width: 100%;
                    box-sizing: border-box;
                    transition: all 0.3s ease;
                }

                /* CUSTOM SELECT BOX - No Blue Highlight */
                .ab-select {
                    padding: 12px 14px;
                    background: #121212;
                    border: 1px solid #222;
                    border-radius: 6px;
                    color: #fff;
                    font-size: 14px;
                    width: 100%;
                    box-sizing: border-box;
                    cursor: pointer;
                    appearance: none;
                    -webkit-appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23d4af37' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: calc(100% - 14px) center;
                    transition: all 0.3s ease;
                }

                .ab-input:focus, .ab-select:focus, .ab-textarea:focus {
                    outline: none;
                    border-color: #d4af37;
                    background: #181818;
                    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
                }

                /* Dark Dropdown Options */
                .ab-select option {
                    background: #0a0a0a;
                    color: #fff;
                }

                .ab-textarea { min-height: 80px; resize: none; }

                .ab-upload {
                    border: 1px dashed #333;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #121212;
                    text-align: center;
                    transition: border-color 0.3s;
                }
                .ab-upload:hover { border-color: #d4af37; }

                .ab-upload-label {
                    display: block;
                    padding: 30px;
                    cursor: pointer;
                }

                .ab-upload-text { font-size: 13px; color: #888; }
                .ab-upload-hint { font-size: 11px; color: #444; display: block; margin-top: 4px; }

                .ab-file { display: none; }
                .ab-preview { width: 100%; height: 200px; object-fit: cover; border-top: 1px solid #222; }

                .ab-submit {
                    width: 100%;
                    padding: 14px;
                    background: #d4af37;
                    color: #000;
                    border: none;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 15px;
                    margin-top: 32px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .ab-submit:hover:not(:disabled) {
                    background: #f1c40f;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(212, 175, 55, 0.2);
                }

                .ab-submit:disabled { opacity: 0.5; cursor: not-allowed; }

                @media (max-width: 500px) {
                    .ab-row { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="ab-container">
                <div className="ab-box">
                    <h1 className="ab-title">Post a <span>Book</span></h1>
                    <p className="ab-sub">List your book on BookNest and reach nearby readers.</p>
                    
                    {error && <div className="ab-err">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <p className="ab-sec">Primary Info</p>
                        <div className="ab-group">
                            <label className="ab-label">Book Title</label>
                            <input className="ab-input" type="text" name="title" placeholder="e.g. The Great Gatsby" value={formData.title} onChange={handleChange} required />
                        </div>

                        <div className="ab-row">
                            <div className="ab-group">
                                <label className="ab-label">Author</label>
                                <input className="ab-input" type="text" name="author" placeholder="F. Scott Fitzgerald" value={formData.author} onChange={handleChange} required />
                            </div>
                            <div className="ab-group">
                                <label className="ab-label">Genre</label>
                                <select className="ab-select" name="genre" value={formData.genre} onChange={handleChange} required>
                                    <option value="">Select</option>
                                    <option value="Fiction">Fiction</option>
                                    <option value="Non-Fiction">Non-Fiction</option>
                                    <option value="Fantasy">Fantasy</option>
                                    <option value="Science">Science</option>
                                    <option value="History">History</option>
                                    <option value="Technology">Technology</option>
                                </select>
                            </div>
                        </div>

                        <div className="ab-group">
                            <label className="ab-label">Description</label>
                            <textarea className="ab-textarea" name="description" placeholder="Brief summary of the book condition or story..." value={formData.description} onChange={handleChange} required />
                        </div>

                        <p className="ab-sec">Transaction Info</p>
                        <div className="ab-row">
                            <div className="ab-group">
                                <label className="ab-label">Quantity</label>
                                <input className="ab-input" type="number" name="quantity" min="1" step="1" placeholder="1" value={formData.quantity} onChange={handleChange} required />
                            </div>
                            <div className="ab-group">
                                <label className="ab-label">List Type</label>
                                <select className="ab-select" name="type" value={formData.type} onChange={handleChange}>
                                    <option value="SELL">Sell</option>
                                    <option value="RENT">Rent</option>
                                    <option value="EXCHANGE">Exchange</option>
                                </select>
                            </div>
                        </div>
                        {formData.type === 'RENT' && (
                            <div className="ab-row">
                                <div className="ab-group">
                                    <label className="ab-label">Rent Price (30% of book price)</label>
                                    <input className="ab-input" type="number" name="rentPrice" value={formData.rentPrice} readOnly />
                                </div>
                            </div>
                        )}
                        <div className="ab-row">
                            <div className="ab-group">
                                <label className="ab-label">Condition</label>
                                <select className="ab-select" name="condition" value={formData.condition} onChange={handleChange} required>
                                    <option value="">Select</option>
                                    <option value="New">New</option>
                                    <option value="Like New">Like New</option>
                                    <option value="Good">Good</option>
                                    <option value="Fair">Fair</option>
                                </select>
                            </div>
                        </div>

                        <div className="ab-row">
                            <div className="ab-group">
                                <label className="ab-label">Price (₹)</label>
                                <input className="ab-input" type="number" name="price" placeholder="0" value={formData.price} onChange={handleChange} required />
                            </div>
                            <div className="ab-group">
                                <label className="ab-label">Location</label>
                                <input className="ab-input" type="text" name="location" placeholder="City name" value={formData.location} onChange={handleChange} required />
                            </div>
                        </div>

                        <p className="ab-sec">Cover Image</p>
                        <div className="ab-upload">
                            <label className="ab-upload-label" htmlFor="ab-file">
                                <span className="ab-upload-text">{preview ? 'Change Photo' : 'Upload Cover Photo'}</span>
                                <span className="ab-upload-hint">Click to browse files</span>
                            </label>
                            <input id="ab-file" className="ab-file" type="file" accept="image/*" onChange={handleImage} />
                            {preview && <img src={preview} alt="preview" className="ab-preview" />}
                        </div>

                        <button type="submit" className="ab-submit" disabled={loading}>
                            {loading ? 'Processing...' : 'Publish Listing'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddBook;