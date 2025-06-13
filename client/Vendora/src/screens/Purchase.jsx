import './purchase.css'
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';


function Purchase(){

    const navigate = useNavigate();
    const location = useLocation();
    const [item, setItem] = useState({});
    const [buyerInfo, setBuyerInfo] = useState({
        name: '',
        email: '',
        address: ''
    });

    useEffect(() => {
        if(location.state?.item){
            setItem(location.state?.item);
        } else {
            navigate('/screens/dashboard');
        }
    }, []);

    const handlePayPalPayment = () => {
        // Create PayPal payment URL with seller's email
        const paypalUrl = `https://www.paypal.com/paypalme/${item.sellerPaypal}/${item.price}`;
        window.open(paypalUrl, '_blank');
    };

    return(
        <>
            <div className='purchase-container'>
                <div className='left-side-purchase-info'>
                    {/* Item Details */}
                    <div className='item-details'>
                        <img src={item.image} alt={item.name} />
                        <h2>{item.name}</h2>
                        <p>Price: ${item.price}</p>
                        <p>Condition: {item.condition}</p>
                    </div>

                    {/* Buyer Information Form */}
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handlePayPalPayment();
                    }}>
                        <h3>Your Information</h3>
                        <input
                            type="text"
                            placeholder="Your Name"
                            value={buyerInfo.name}
                            onChange={(e) => setBuyerInfo({...buyerInfo, name: e.target.value})}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Your Email"
                            value={buyerInfo.email}
                            onChange={(e) => setBuyerInfo({...buyerInfo, email: e.target.value})}
                            required
                        />
                        <textarea
                            placeholder="Shipping Address"
                            value={buyerInfo.address}
                            onChange={(e) => setBuyerInfo({...buyerInfo, address: e.target.value})}
                            required
                        />
                        <button type="submit">Pay with PayPal</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Purchase