import './Dashboard.css';
import { useEffect, useState } from 'react';
import {useNavigate } from 'react-router-dom'
import { backendUrl } from '../config.js'
import { BiSearch, BiShoppingBag } from 'react-icons/bi';
import { RiStoreLine } from 'react-icons/ri';
import { FiLogOut } from 'react-icons/fi';

function Dashboard() {

    const navigate = useNavigate();
    const [id, setId] = useState('');

    const [items, setItems] = useState([]);
    const [loadCount, setLoadCount] = useState(0);

    //check and grab token
    useEffect(() => {
        let ignore = false;

        const initializeDashboard = async () => {
            const cookies = document.cookie.split(';');
            let foundToken = null;

            for(let i = 0; i < cookies.length; i++){
                const curr = cookies[i].trim();
                if(curr.startsWith('token=')){
                    foundToken = curr.split('=')[1];
                    break;
                }
            }

            if(!foundToken){
                console.log('token not found');
                if (!ignore) navigate('/');
                return;
            }

            // Fetch user data and initial items in parallel
            const userPromise = fetch(`${backendUrl}/api/getUserData`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: foundToken })
            });
            
            const itemsPromise = fetch(`${backendUrl}/api/getItems`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 0 })
            });

            try {
                const [userResponse, itemsResponse] = await Promise.all([userPromise, itemsPromise]);

                // Process user data
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    if (!ignore) setId(userData.claims.id);
                } else {
                    if (!ignore) navigate('/');
                    return; 
                }

                // Process items data
                if (itemsResponse.ok) {
                    const itemsData = await itemsResponse.json();
                    if (!ignore) {
                        setItems(itemsData);
                        setLoadCount(1);
                    }
                } else {
                    console.error('Failed to fetch initial items');
                }
            } catch (error) {
                console.error('Initialization failed:', error);
                if (!ignore) navigate('/');
            }
        };

        initializeDashboard();

        // Cleanup function to prevent setting state on unmounted component
        return () => {
            ignore = true;
        };
    }, [navigate]);

    const fetch30 = async () => {

        try{
            const response = await fetch(`${backendUrl}/api/getItems`, {
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify({
                    count : loadCount
                })
            });

            const data = await response.json();

            if(response.ok){
                console.log('items recieved');
                //update items array here
                setItems(prevItems => [...prevItems, ...data])
                setLoadCount(prevCount => prevCount += 1);
                return;
            }
            else{
                throw new Error('server error');
            }
        }catch(err){
            console.log('failed to fetch :(', err);
        }
    }

    return(
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
                    <button className='sell-button' onClick={() => {navigate('/screens/Sell', {state : { userId: id}});}}>
                        Sell
                    </button>
                    <button className='my-items' onClick={() => navigate('/screens/MyShop', {state : {userId: id}})}>My Shop</button>
                    <button className='cart'>
                        <BiShoppingBag size={20} />
                    </button>
                    <button className='sign-out' onClick={() => {navigate('/'); document.cookie = "token=; expires=Thu, 01 jan 1960 00:00:00 UTC; path=/;";}}>
                        <FiLogOut size={20} />
                    </button>
                </header>
                <div className='body-container'>
                    <div className='filters'>
                        <div className='price-filter'>
                            <p>Price</p>
                            <input type='text' placeholder='Min' />
                            <input type='text' placeholder='Max' />
                        </div>
                        <div className='date-filter '>
                            <p>Date</p>
                            <input type='text' placeholder='Min' />
                            <input type='text' placeholder='Max' />
                        </div>
                        <div className='condition-filter'>
                            <p>Condition</p>
                            <select>
                                <option value=''>All</option>
                                <option value='new'>New</option>
                                <option value='used'>Used</option>
                                <option value='good'>Good</option>
                                <option value='bad'>Bad</option>
                            </select>
                            <button>Apply</button>
                        </div>
                    </div>
                    <div className='items'>
                        {items.map((item) => {
                            console.log(item.id);
                            return(
                                <div key={item.id} className='item'>
                                    <img src={item.image} alt={item.name} className='item-image' />
                                    <div className='item-details'>
                                        <h3 className='item-title'>{item.name}</h3>
                                        <p className='item-price'>${item.price}</p>
                                        <p className='item-condition'>{item.condition}</p>
                                        <div className='item-footer'>
                                            <span className='item-location'>{item.location}</span>
                                            <span className='item-date'>{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <button className='add-to-cart'>Add to Cart</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <footer className='footer-container'>
                    <p>&copy; {new Date().getFullYear()} Vendora. All rights reserved.</p>
                </footer>
            </div>
        </>
    )    
}

export default Dashboard;