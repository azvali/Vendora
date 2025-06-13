import './purchase.css'
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';


function Purchase(){

    const navigate = useNavigate();
    const location = useLocation();
    const [item, setItem] = useState({});

    useEffect(() => {
        if(location.state?.item){
            setItem(location.state?.item);
            console.log(item);
        }
        else{
            console.log('failed to pass item.');
            navigate('/screens/dashboard');
        }
    },[]);
    
    console.log(item);

    return(
        <>
            <div className='purchase-container'>
                
            </div>
        </>
    )
}

export default Purchase