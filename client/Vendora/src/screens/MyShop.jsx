import './MyShop.css'
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiLogOut, FiTrash2 } from 'react-icons/fi';
import { useEffect, useState} from 'react';

function MyShop(){
    const navigate = useNavigate();
    const location = useLocation();

    const [Id, setId] = useState('');
    const [items, setItems] = useState([]);


    useEffect(() => {
        if(location.state?.userId){
            setId(location.state?.userId);
        }
    },[]);

    const getMyItems = async () => {


        const response = await fetch(`${backendUrl}/api/getMyItems`, {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                userId : Id
            })
        });

        const data = await response.json();
        
        if(response.ok){
            console.log('items recieved', data);
        }else{
            console.log('items not recieved', data);
        }

    };


    const placeholderItems = [
    //     { id: 1, title: 'Vintage Denim Jacket', price: '45.00', image: 'https://picsum.photos/seed/1/400/300' },
    //     { id: 2, title: 'Leather Ankle Boots', price: '75.50', image: 'https://picsum.photos/seed/2/400/300' },
    //     { id: 3, title: 'Graphic T-Shirt', price: '22.00', image: 'https://picsum.photos/seed/3/400/300' },
    //     { id: 4, title: 'Classic Wristwatch', price: '120.00', image: 'https://picsum.photos/seed/4/400/300' },
    //     { id: 5, title: 'Wool Scarf', price: '30.00', image: 'https://picsum.photos/seed/5/400/300' },
    //     { id: 6, title: 'Canvas Backpack', price: '55.00', image: 'https://picsum.photos/seed/6/400/300' },
    //     { id: 1, title: 'Vintage Denim Jacket', price: '45.00', image: 'https://picsum.photos/seed/1/400/300' },
    //     { id: 2, title: 'Leather Ankle Boots', price: '75.50', image: 'https://picsum.photos/seed/2/400/300' },
    //     { id: 3, title: 'Graphic T-Shirt', price: '22.00', image: 'https://picsum.photos/seed/3/400/300' },
    //     { id: 4, title: 'Classic Wristwatch', price: '120.00', image: 'https://picsum.photos/seed/4/400/300' },
    //     { id: 5, title: 'Wool Scarf', price: '30.00', image: 'https://picsum.photos/seed/5/400/300' },
    //     { id: 6, title: 'Canvas Backpack', price: '55.00', image: 'https://picsum.photos/seed/6/400/300' },
    //     { id: 1, title: 'Vintage Denim Jacket', price: '45.00', image: 'https://picsum.photos/seed/1/400/300' },
    //     { id: 2, title: 'Leather Ankle Boots', price: '75.50', image: 'https://picsum.photos/seed/2/400/300' },
    //     { id: 3, title: 'Graphic T-Shirt', price: '22.00', image: 'https://picsum.photos/seed/3/400/300' },
    //     { id: 4, title: 'Classic Wristwatch', price: '120.00', image: 'https://picsum.photos/seed/4/400/300' },
    //     { id: 5, title: 'Wool Scarf', price: '30.00', image: 'https://picsum.photos/seed/5/400/300' },
    //     { id: 6, title: 'Canvas Backpack', price: '55.00', image: 'https://picsum.photos/seed/6/400/300' },
    //     { id: 1, title: 'Vintage Denim Jacket', price: '45.00', image: 'https://picsum.photos/seed/1/400/300' },
    //     { id: 2, title: 'Leather Ankle Boots', price: '75.50', image: 'https://picsum.photos/seed/2/400/300' },
    //     { id: 3, title: 'Graphic T-Shirt', price: '22.00', image: 'https://picsum.photos/seed/3/400/300' },
    //     { id: 4, title: 'Classic Wristwatch', price: '120.00', image: 'https://picsum.photos/seed/4/400/300' },
    //     { id: 5, title: 'Wool Scarf', price: '30.00', image: 'https://picsum.photos/seed/5/400/300' },
    //     { id: 6, title: 'Canvas Backpack', price: '55.00', image: 'https://picsum.photos/seed/6/400/300' },
    //     { id: 1, title: 'Vintage Denim Jacket', price: '45.00', image: 'https://picsum.photos/seed/1/400/300' },
    //     { id: 2, title: 'Leather Ankle Boots', price: '75.50', image: 'https://picsum.photos/seed/2/400/300' },
    //     { id: 3, title: 'Graphic T-Shirt', price: '22.00', image: 'https://picsum.photos/seed/3/400/300' },
    //     { id: 4, title: 'Classic Wristwatch', price: '120.00', image: 'https://picsum.photos/seed/4/400/300' },
    //     { id: 5, title: 'Wool Scarf', price: '30.00', image: 'https://picsum.photos/seed/5/400/300' },
    //     { id: 6, title: 'Canvas Backpack', price: '55.00', image: 'https://picsum.photos/seed/6/400/300' },
    //     { id: 1, title: 'Vintage Denim Jacket', price: '45.00', image: 'https://picsum.photos/seed/1/400/300' },
    //     { id: 2, title: 'Leather Ankle Boots', price: '75.50', image: 'https://picsum.photos/seed/2/400/300' },
    //     { id: 3, title: 'Graphic T-Shirt', price: '22.00', image: 'https://picsum.photos/seed/3/400/300' },
    //     { id: 4, title: 'Classic Wristwatch', price: '120.00', image: 'https://picsum.photos/seed/4/400/300' },
    //     { id: 5, title: 'Wool Scarf', price: '30.00', image: 'https://picsum.photos/seed/5/400/300' },
    //     { id: 6, title: 'Canvas Backpack', price: '55.00', image: 'https://picsum.photos/seed/6/400/300' },
    //     { id: 1, title: 'Vintage Denim Jacket', price: '45.00', image: 'https://picsum.photos/seed/1/400/300' },
    //     { id: 2, title: 'Leather Ankle Boots', price: '75.50', image: 'https://picsum.photos/seed/2/400/300' },
    //     { id: 3, title: 'Graphic T-Shirt', price: '22.00', image: 'https://picsum.photos/seed/3/400/300' },
    //     { id: 4, title: 'Classic Wristwatch', price: '120.00', image: 'https://picsum.photos/seed/4/400/300' },
    //     { id: 5, title: 'Wool Scarf', price: '30.00', image: 'https://picsum.photos/seed/5/400/300' },
    //     { id: 6, title: 'Canvas Backpack', price: '55.00', image: 'https://picsum.photos/seed/6/400/300' },
    ];
    
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
                        {placeholderItems.map(item => (
                            <div key={item.id} className='item-card'>
                                <img src={item.image} alt={item.title} className='item-card-image' />
                                <div className='item-card-details'>
                                    <h3 className='item-card-title'>{item.title}</h3>
                                    <p className='item-card-price'>${item.price}</p>
                                </div>
                                <div className='item-card-actions'>
                                    <button className='delete-button'><FiTrash2 /> Delete</button>
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