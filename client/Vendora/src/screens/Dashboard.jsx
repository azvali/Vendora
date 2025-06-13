import './Dashboard.css';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { backendUrl } from '../config.js';
import { BiSearch, BiShoppingBag } from 'react-icons/bi';
import { RiStoreLine } from 'react-icons/ri';
import { FiLogOut } from 'react-icons/fi';

function Dashboard() {
    const navigate = useNavigate();
    const [id, setId] = useState('');
    const [authState, setAuthState] = useState('pending');

    const [items, setItems] = useState([]);
    const loadCount = useRef(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [filters, setFilters] = useState({
        priceMin: '',
        priceMax: '',
        condition: '',
    });

    const observer = useRef();


    useEffect(() => {
        let ignore = false;

        const authenticate = async () => {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                ?.split('=')[1];

            if (!token) {
                setAuthState('failed');
                return;
            }

            setAuthState('authenticating');
            try {
                const response = await fetch(`${backendUrl}/api/getUserData`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                if (!response.ok) {
                    throw new Error('Failed to validate token');
                }

                const data = await response.json();
                if (!ignore) {
                    setId(data.claims.id);
                    setAuthState('authenticated');
                }
            } catch (error) {
                console.error("Authentication failed:", error);
                setAuthState('failed');
            }
        };

        authenticate();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        if (authState === 'failed') {
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            navigate('/');
        }
    }, [authState, navigate]);

    const fetchItems = useCallback(async (isNewSearch) => {
        if (loading || (!hasMore && !isNewSearch)) return;

        setLoading(true);
        
        if (isNewSearch) {
            loadCount.current = 0;
            setItems([]);
            setHasMore(true);
        }

        try {
            const response = await fetch(`${backendUrl}/api/getItems`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    count: loadCount.current,
                    priceMin: filters.priceMin || null,
                    priceMax: filters.priceMax || null,
                    condition: filters.condition || null,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.length > 0) {
                    setItems(prevItems => isNewSearch ? data : [...prevItems, ...data]);
                    loadCount.current += 1;
                } else {
                    setHasMore(false);
                }
            } else {
                throw new Error('server error');
            }
        } catch (err) {
            console.error('Failed to fetch items:', err);
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, filters]);

    // This effect now handles both the initial fetch and re-fetches when filters change.
    useEffect(() => {
        if (authState === 'authenticated') {
            fetchItems(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authState, filters]);

    const lastItemRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchItems(false);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, fetchItems]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    if (authState !== 'authenticated') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <h2>Loading...</h2>
            </div>
        );
    }

    return (
        <>
            <div className='dashboard-container'>
                <header className='header-container'>
                    <div className='icon'>
                        <RiStoreLine size={30} />
                    </div>
                    <div className='search-field'>
                        <input className='search-input' type='text' placeholder='Search for anything' />
                        <button className='search-button'>
                            <BiSearch size={20} />
                        </button>
                    </div>
                    <button className='sell-button' onClick={() => {navigate('/screens/Sell', { state: { userId: id } });}}>
                        Sell
                    </button>
                    <button className='my-items' onClick={() => navigate('/screens/MyShop', { state: { userId: id } })}>
                        My Shop
                    </button>
                    <button className='sign-out' onClick={() => {
                        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        navigate('/');
                    }}>
                        <FiLogOut size={20} />
                    </button>
                </header>
                <div className='body-container'>
                    <div className='filters'>
                        <div className='price-filter'>
                            <p>Price</p>
                            <input type='number' placeholder='Min' name="priceMin" value={filters.priceMin} onChange={handleFilterChange} />
                            <input type='number' placeholder='Max' name="priceMax" value={filters.priceMax} onChange={handleFilterChange} />
                        </div>
                        <div className='condition-filter'>
                            <p>Condition</p>
                            <select name="condition" value={filters.condition} onChange={handleFilterChange}>
                                <option value=''>All</option>
                                <option value='new'>New</option>
                                <option value='used'>Used</option>
                                <option value='good'>Good</option>
                                <option value='bad'>Bad</option>
                            </select>
                        </div>
                    </div>
                    <div className='items'>
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                className='item'
                                ref={items.length === index + 1 ? lastItemRef : null}
                            >
                                <img src={item.image} alt={item.name} className='item-image' />
                                <div className='item-details'>
                                    <h3 className='item-title'>{item.name}</h3>
                                    <p className='item-price'>${item.price}</p>
                                    <p className='item-condition'>{item.condition}</p>
                                    <div className='item-footer'>
                                        <span className='item-location'>{item.location}</span>
                                        <span className='item-date'>{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <button className='Purchase' onClick={() => {navigate('/screens/Purchase', {state: {item : item}})}}>Purchase</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <footer className='footer-container'>
                    <p>&copy; {new Date().getFullYear()} Vendora. All rights reserved.</p>
                </footer>
            </div>
        </>
    );
}

export default Dashboard;