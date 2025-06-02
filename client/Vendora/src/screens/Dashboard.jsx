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

    const testItems = [
        {
            id: 1,
            title: "Vintage Leather Jacket",
            price: 129.99,
            condition: "Good",
            image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
            seller: "JohnDoe",
            location: "New York, NY",
            postedDate: "2024-03-10"
        },
        {
            id: 2,
            title: "Nike Air Max 2023",
            price: 89.99,
            condition: "Like New",
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
            seller: "SneakerHead",
            location: "Los Angeles, CA",
            postedDate: "2024-03-12"
        },
        {
            id: 3,
            title: "MacBook Pro 2022",
            price: 1299.99,
            condition: "Excellent",
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
            seller: "TechDeals",
            location: "San Francisco, CA",
            postedDate: "2024-03-11"
        },
        {
            id: 4,
            title: "Vintage Polaroid Camera",
            price: 65.00,
            condition: "Fair",
            image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500",
            seller: "RetroCollector",
            location: "Chicago, IL",
            postedDate: "2024-03-09"
        },
        {
            id: 5,
            title: "Guitar Fender Stratocaster",
            price: 799.99,
            condition: "Good",
            image: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=500",
            seller: "MusicPro",
            location: "Nashville, TN",
            postedDate: "2024-03-10"
        },
        {
            id: 6,
            title: "Designer Handbag",
            price: 299.99,
            condition: "Like New",
            image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500",
            seller: "Fashionista",
            location: "Miami, FL",
            postedDate: "2024-03-12"
        }
    ];

    //check and grab token
    useEffect(() => {
        const cookies = document.cookie.split(';');
        let foundToken = null;

        for(let i = 0; i < cookies.length; i++){
            const curr = cookies[i].trim();

            if(curr.startsWith('token=')){
                const tokenValue = curr.split('=')[1]
                // setToken(tokenValue);
                foundToken = tokenValue
                break;
            }
        }

        if(!foundToken){
            console.log('token not found')
            navigate('/');
        }else{
            decodeToken(foundToken);
        }
    },[navigate]);


    const decodeToken = async (token) => {

        const response = await fetch(`${backendUrl}/api/getUserData`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                token : token
            })
        });

        const data = await response.json()

        if(response.ok){
            setId(data.claims.id);
        }
        else{
            console.log(data.message);
            navigate('/');
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
                    <button className='my-items'>My Shop</button>
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
                        {testItems.map((item) => {
                            return(
                                <div key={item.id} className='item'>
                                    <img src={item.image} alt={item.title} className='item-image' />
                                    <div className='item-details'>
                                        <h3 className='item-title'>{item.title}</h3>
                                        <p className='item-price'>${item.price}</p>
                                        <p className='item-condition'>{item.condition}</p>
                                        <div className='item-footer'>
                                            <span className='item-location'>{item.location}</span>
                                            <span className='item-date'>{item.postedDate}</span>
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