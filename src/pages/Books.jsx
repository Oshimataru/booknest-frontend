import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBooks, searchBooks } from '../services/api';

const Books = () => {
    const navigate = useNavigate();
    const [books,    setBooks]    = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [keyword,  setKeyword]  = useState('');
    const [filters,  setFilters]  = useState({
        type: '', genre: '', condition: '',
        minPrice: '', maxPrice: '', sort: ''
    });

    useEffect(() => { fetchBooks(); }, []);
    useEffect(() => { applyFilters(); }, [books, filters]);

    const fetchBooks = async () => {
        try {
            const res = await getAllBooks();
            setBooks(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...books];
        if (filters.type)      result = result.filter(b => b.type === filters.type);
        if (filters.genre)     result = result.filter(b => b.genre === filters.genre);
        if (filters.condition) result = result.filter(b => b.condition === filters.condition);
        if (filters.minPrice)  result = result.filter(b => b.price >= Number(filters.minPrice));
        if (filters.maxPrice)  result = result.filter(b => b.price <= Number(filters.maxPrice));
        if (filters.sort === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (filters.sort === 'low')    result.sort((a, b) => a.price - b.price);
        if (filters.sort === 'high')   result.sort((a, b) => b.price - a.price);
        setFiltered(result);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!keyword.trim()) { fetchBooks(); return; }
        try {
            const res = await searchBooks(keyword);
            setBooks(res.data);
        } catch (err) { console.error(err); }
    };

    const handleFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

    const clearFilters = () => {
        setFilters({ type: '', genre: '', condition: '', minPrice: '', maxPrice: '', sort: '' });
        setKeyword('');
        fetchBooks();
    };

    const available = filtered.filter(b => b.status === 'AVAILABLE');

    const typeBadge = (type) => {
        const map = { SELL: '#c9a84c', RENT: '#7b9fc7', EXCHANGE: '#9b8ec4' };
        return map[type] || '#c9a84c';
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Fraunces:ital,wght@0,600;1,400&display=swap');

                .bk * { box-sizing: border-box; margin: 0; padding: 0; }

                .bk {
                    min-height: 100vh;
                    background: #0d1117;
                    font-family: 'Inter', sans-serif;
                    color: #e8dcc8;
                    padding: 48px 32px 80px;
                }

                /* ── Header ── */
                .bk-header {
                    max-width: 1100px; margin: 0 auto 36px;
                    display: flex; align-items: flex-end;
                    justify-content: space-between; gap: 20px;
                    flex-wrap: wrap;
                }
                .bk-title {
                    font-family: 'Fraunces', serif;
                    font-size: clamp(28px, 4vw, 42px);
                    font-weight: 600; color: #f0e6cc;
                    letter-spacing: -0.5px; line-height: 1;
                }
                .bk-title span { color: #c9a84c; font-style: italic; font-weight: 400; }

                /* ── Search ── */
                .bk-search {
                    display: flex; gap: 0;
                    border: 1px solid rgba(201,168,76,0.2);
                    border-radius: 4px; overflow: hidden;
                    flex: 1; max-width: 380px; min-width: 240px;
                }
                .bk-search input {
                    flex: 1; padding: 10px 14px;
                    background: rgba(201,168,76,0.04);
                    border: none; outline: none;
                    font-family: 'Inter', sans-serif;
                    font-size: 13px; color: #e8dcc8;
                }
                .bk-search input::placeholder { color: rgba(232,220,200,0.25); }
                .bk-search input:focus { background: rgba(201,168,76,0.07); }
                .bk-search button {
                    padding: 10px 18px;
                    background: #c9a84c; border: none;
                    color: #0d1117; font-family: 'Inter', sans-serif;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: background 0.15s; white-space: nowrap;
                }
                .bk-search button:hover { background: #d4b55a; }

                /* ── Filters ── */
                .bk-filters {
                    max-width: 1100px; margin: 0 auto 28px;
                    display: flex; gap: 8px; flex-wrap: wrap;
                    align-items: center;
                }
                .bk-select, .bk-input {
                    padding: 8px 12px;
                    background: rgba(201,168,76,0.04);
                    border: 1px solid rgba(201,168,76,0.15);
                    border-radius: 4px;
                    color: rgba(232,220,200,0.6);
                    font-family: 'Inter', sans-serif;
                    font-size: 12.5px; outline: none;
                    cursor: pointer;
                    transition: border-color 0.15s, background 0.15s;
                    appearance: none; -webkit-appearance: none;
                }
                .bk-select { padding-right: 28px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none' stroke='rgba(201,168,76,0.4)' stroke-width='1.5' stroke-linecap='round'%3E%3Cpath d='M1 1l4 4 4-4'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; }
                .bk-select:focus, .bk-input:focus {
                    border-color: rgba(201,168,76,0.4);
                    background: rgba(201,168,76,0.07);
                    color: rgba(232,220,200,0.9);
                }
                .bk-select option { background: #111520; color: #e8dcc8; }
                .bk-input { width: 100px; }
                .bk-input::placeholder { color: rgba(232,220,200,0.2); }

                .bk-clear {
                    padding: 8px 14px;
                    background: transparent;
                    border: 1px solid rgba(201,168,76,0.15);
                    border-radius: 4px;
                    color: rgba(201,168,76,0.5);
                    font-family: 'Inter', sans-serif;
                    font-size: 12.5px; cursor: pointer;
                    transition: border-color 0.15s, color 0.15s;
                    margin-left: auto;
                }
                .bk-clear:hover { border-color: rgba(201,168,76,0.4); color: #c9a84c; }

                /* ── Count ── */
                .bk-count {
                    max-width: 1100px; margin: 0 auto 24px;
                    font-size: 12px; font-weight: 300;
                    color: rgba(232,220,200,0.25);
                    letter-spacing: 0.3px;
                }
                .bk-count b { color: rgba(201,168,76,0.5); font-weight: 400; }

                /* ── States ── */
                .bk-loading, .bk-empty {
                    max-width: 1100px; margin: 80px auto;
                    text-align: center;
                    font-size: 14px; font-weight: 300;
                    color: rgba(232,220,200,0.25);
                }
                .bk-loading-dot {
                    display: inline-block;
                    width: 6px; height: 6px; border-radius: 50%;
                    background: #c9a84c; margin: 0 3px;
                    animation: bkBounce 1.2s ease-in-out infinite;
                }
                .bk-loading-dot:nth-child(2) { animation-delay: 0.15s; }
                .bk-loading-dot:nth-child(3) { animation-delay: 0.3s; }
                @keyframes bkBounce {
                    0%,80%,100%{ transform: scale(0.6); opacity: 0.3; }
                    40%{ transform: scale(1); opacity: 1; }
                }

                /* ── Grid ── */
                .bk-grid {
                    max-width: 1100px; margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 1px;
                    border: 1px solid rgba(201,168,76,0.1);
                }

                /* ── Card ── */
                .bk-card {
                    background: #0d1117;
                    padding: 0;
                    cursor: pointer;
                    transition: background 0.18s;
                    display: flex; flex-direction: column;
                    border-right: 1px solid rgba(201,168,76,0.08);
                    border-bottom: 1px solid rgba(201,168,76,0.08);
                    position: relative;
                }
                .bk-card:hover { background: #111520; }
                .bk-card:hover .bk-card-arrow { opacity: 1; transform: translate(0,0); }

                /* Image area */
                .bk-card-img {
                    width: 100%; aspect-ratio: 3/4;
                    background: #0a0d14;
                    overflow: hidden; position: relative;
                    border-bottom: 1px solid rgba(201,168,76,0.08);
                }
                .bk-card-img img {
                    width: 100%; height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }
                .bk-card:hover .bk-card-img img { transform: scale(1.04); }
                .bk-card-no-img {
                    width: 100%; height: 100%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 36px;
                    color: rgba(201,168,76,0.15);
                    background: repeating-linear-gradient(
                        45deg,
                        rgba(201,168,76,0.02),
                        rgba(201,168,76,0.02) 1px,
                        transparent 1px,
                        transparent 12px
                    );
                }

                /* Type badge */
                .bk-badge {
                    position: absolute; top: 10px; left: 10px;
                    padding: 3px 9px;
                    border-radius: 2px;
                    font-size: 10px; font-weight: 500;
                    letter-spacing: 1px; text-transform: uppercase;
                    color: #0d1117;
                }

                /* Card body */
                .bk-card-body { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 4px; }

                .bk-card-title {
                    font-family: 'Fraunces', serif;
                    font-size: 15px; font-weight: 600;
                    color: #f0e6cc; line-height: 1.3;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .bk-card-author {
                    font-size: 12px; font-weight: 300;
                    color: rgba(232,220,200,0.35);
                }
                .bk-card-meta {
                    display: flex; align-items: center;
                    gap: 8px; margin-top: 8px; flex-wrap: wrap;
                }
                .bk-card-genre {
                    font-size: 11px; font-weight: 400;
                    color: rgba(201,168,76,0.45);
                    padding: 2px 8px;
                    border: 1px solid rgba(201,168,76,0.15);
                    border-radius: 2px;
                }
                .bk-card-condition {
                    font-size: 11px; font-weight: 300;
                    color: rgba(232,220,200,0.25);
                }

                .bk-card-footer {
                    display: flex; align-items: center;
                    justify-content: space-between;
                    margin-top: auto; padding-top: 12px;
                    border-top: 1px solid rgba(201,168,76,0.07);
                }
                .bk-card-price {
                    font-family: 'Fraunces', serif;
                    font-size: 17px; font-weight: 600;
                    color: #c9a84c;
                }
                .bk-card-price.exchange {
                    font-size: 12px; font-weight: 400;
                    color: rgba(201,168,76,0.5);
                    font-family: 'Inter', sans-serif;
                }
                .bk-card-location {
                    font-size: 11px; font-weight: 300;
                    color: rgba(232,220,200,0.22);
                }

                .bk-card-arrow {
                    position: absolute; top: 12px; right: 12px;
                    font-size: 14px; color: rgba(201,168,76,0.6);
                    opacity: 0; transform: translate(-3px, 3px);
                    transition: opacity 0.2s, transform 0.2s;
                }

                @media(max-width:640px){
                    .bk { padding: 32px 16px 60px; }
                    .bk-header { flex-direction: column; align-items: flex-start; }
                    .bk-search { max-width: 100%; }
                    .bk-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
                    .bk-clear { margin-left: 0; }
                }
            `}</style>

            <div className="bk">

                {/* Header + Search */}
                <div className="bk-header">
                    <h1 className="bk-title">Browse <span>Books</span></h1>
                    <form className="bk-search" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search title or author…"
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                        />
                        <button type="submit">Search</button>
                    </form>
                </div>

                {/* Filters */}
                <div className="bk-filters">
                    <select className="bk-select" name="type" value={filters.type} onChange={handleFilter}>
                        <option value="">All Types</option>
                        <option value="SELL">Sell</option>
                        <option value="RENT">Rent</option>
                        <option value="EXCHANGE">Exchange</option>
                    </select>

                    <select className="bk-select" name="genre" value={filters.genre} onChange={handleFilter}>
                        <option value="">All Genres</option>
                        <option value="Fiction">Fiction</option>
                        <option value="Non-Fiction">Non-Fiction</option>
                        <option value="Fantasy">Fantasy</option>
                        <option value="Science">Science</option>
                        <option value="History">History</option>
                        <option value="Biography">Biography</option>
                        <option value="Technology">Technology</option>
                        <option value="Other">Other</option>
                    </select>

                    <select className="bk-select" name="condition" value={filters.condition} onChange={handleFilter}>
                        <option value="">All Conditions</option>
                        <option value="New">New</option>
                        <option value="Like New">Like New</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                    </select>

                    <input
                        className="bk-input"
                        type="number" name="minPrice"
                        placeholder="Min ₹"
                        value={filters.minPrice}
                        onChange={handleFilter}
                    />
                    <input
                        className="bk-input"
                        type="number" name="maxPrice"
                        placeholder="Max ₹"
                        value={filters.maxPrice}
                        onChange={handleFilter}
                    />

                    <select className="bk-select" name="sort" value={filters.sort} onChange={handleFilter}>
                        <option value="">Sort By</option>
                        <option value="newest">Newest First</option>
                        <option value="low">Price: Low → High</option>
                        <option value="high">Price: High → Low</option>
                    </select>

                    <button className="bk-clear" onClick={clearFilters}>Clear</button>
                </div>

                {/* Count */}
                <div className="bk-count">
                    Showing <b>{available.length}</b> books
                </div>

                {/* States */}
                {loading ? (
                    <div className="bk-loading">
                        <span className="bk-loading-dot" />
                        <span className="bk-loading-dot" />
                        <span className="bk-loading-dot" />
                    </div>
                ) : available.length === 0 ? (
                    <div className="bk-empty">No books found.</div>
                ) : (
                    <div className="bk-grid">
                        {available.map(book => (
                            <div
                                key={book.id}
                                className="bk-card"
                                onClick={() => navigate(`/books/${book.id}`)}
                            >
                                {/* Arrow indicator */}
                                <span className="bk-card-arrow">↗</span>

                                {/* Image */}
                                <div className="bk-card-img">
                                    {book.imageUrl
                                        ? <img src={book.imageUrl} alt={book.title} />
                                        : <div className="bk-card-no-img">📚</div>
                                    }
                                    <span
                                        className="bk-badge"
                                        style={{ background: typeBadge(book.type) }}
                                    >
                                        {book.type}
                                    </span>
                                </div>

                                {/* Body */}
                                <div className="bk-card-body">
                                    <div className="bk-card-title">{book.title}</div>
                                    <div className="bk-card-author">by {book.author}</div>

                                    <div className="bk-card-meta">
                                        <span className="bk-card-genre">{book.genre}</span>
                                        <span className="bk-card-condition">{book.condition}</span>
                                    </div>

                                    <div className="bk-card-footer">
                                        {book.type === 'EXCHANGE'
                                            ? <span className="bk-card-price exchange">Free Exchange</span>
                                            : <span className="bk-card-price">₹{book.price}</span>
                                        }
                                        <span className="bk-card-location">📍 {book.location}</span>
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

export default Books;
