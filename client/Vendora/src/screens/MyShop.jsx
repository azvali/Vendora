import './MyShop.css'
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiLogOut, FiTrash2 } from 'react-icons/fi';
import { useEffect, useState} from 'react';
import { backendUrl } from '../config.js'
function MyShop(){
    const navigate = useNavigate();
    const location = useLocation();

    const [id, setId] = useState(null);
    const [items, setItems] = useState([]);


    useEffect(() => {
        const userIdFromState = location.state?.userId;
        if (userIdFromState) {
            setId(userIdFromState);
        }
    }, [location.state]);

    useEffect(() => {


        getMyItems();
    }, [id]); // This effect now correctly runs whenever the `id` state changes.

    const getMyItems = async () => {
        if (!id) {
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/getMyItems`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: id
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                setItems(data); 
            } else {
                console.error('Failed to receive items:', data.message);
            }
        } catch (error) {
            console.error('An error occurred while fetching items:', error);
        }
    };

    const deleteItem = async (itemID) => {
        console.log(itemID);
    }

    return (
        <>
            <div className='myShop-container'>
                <header className='my-shop-header-container'>
                    <div className='leftSide-header'>
                        <h1>My Shop</h1>
                    </div>
                    <div className='rightSide-header'>
                        <button className='back-button' onClick={() => navigate('/screens/dashboard')}><FiArrowLeft size={24} /></button>
                        <button className='signOut-button' onClick={() => navigate('/')}><FiLogOut size={24} /></button>
                    </div>
                </header>
                <div className='my-shop-body-container'>
                    <div className='my-shop-items-grid'>
                        {items.map(item => (
                            <div key={item.id} className='item-card'>
                                <img src={item.image} alt={item.name} className='item-card-image' />
                                <div className='item-card-details'>
                                    <h3 className='item-card-title'>{item.name}</h3>
                                    <p className='item-card-price'>${item.price}</p>
                                </div>
                                <div className='item-card-actions'>
                                    <button className='delete-button' onClick={() => {deleteItem(item.id)}}><FiTrash2 /> Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <footer className='my-shop-footer-container'>
                    <p>&copy; {new Date().getFullYear()} Vendora. All rights reserved.</p>
                </footer>
            </div>
        </>
    )
}

export default MyShop