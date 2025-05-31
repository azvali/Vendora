import './Dashboard.css';
import { useEffect, useState } from 'react';
import {useNavigate } from 'react-router-dom'
import { backendUrl } from '../config.js'

function Dashboard() {

    const navigate = useNavigate();
    const [id, setId] = useState('');


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
            console.log(data.message);
            console.log(data.claims);
        }
        else{
            console.log(data.message);
        }
    }

    console.log(id)

    return(
        <>
            <div className='dashboard-container'>

            </div>
        </>
    )    
}

export default Dashboard;