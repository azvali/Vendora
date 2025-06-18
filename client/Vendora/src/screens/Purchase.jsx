import './Purchase.css'
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Purchase() {
    const navigate = useNavigate();
    const location = useLocation();
    const [item, setItem] = useState({});

    useEffect(() => {
        if(location.state?.item) {
            setItem(location.state?.item);
        } else {
            navigate('/screens/dashboard');
        }
    }, []);

    return(
        <>
            <div className='purchase-container'>
                <div className='left-side-purchase-info'>
                    <button
                        className="go-back-button"
                        onClick={() => navigate(-1)}
                        style={{ marginBottom: "1.5rem" }}
                    >
                        ← Go Back
                    </button>
                    {/* Item Details */}
                    <div className='item-details'>
                        <img src={item.image} alt={item.name} />
                        <h2>{item.name}</h2>
                        <p>Price: ${item.price}</p>
                        <p>Condition: {item.condition}</p>
                        <p>Seller's Wallet Address: {item.wallet}</p>
                    </div>

                    {/* Shipping Instructions */}
                    <div className='shipping-instructions'>
                        <h3>How to Purchase</h3>
                        <ol>
                            <li>Send the payment to the seller's wallet address shown above</li>
                            <li>Include your shipping address in the transaction note/memo</li>
                            <li>Wait for the seller to confirm your payment</li>
                            <li>The seller will ship your item to the address provided</li>
                        </ol>
                        <div className='note-box'>
                            <p><strong>Important:</strong> Always include your shipping address in the transaction note/memo when sending payment.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Purchase