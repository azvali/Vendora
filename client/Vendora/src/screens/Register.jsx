import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { backendUrl } from '../config';
import './Register.css';

function Register() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    //regex for valid email format
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateRegister = async (e) => {
        e.preventDefault();
        if(password !== confirmPassword){
            setErrorMessage("Passwords do not match");
            return;
        }

        if(email === '' || password === '' || confirmPassword === ''){
            setErrorMessage("Please fill in all fields");
            return;
        }

        if(!isValidEmail(email)){
            setErrorMessage("Invalid email address");
            return;
        }

        try{
            const response = await fetch(`${backendUrl}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({email, password})
            });

            if(!response.ok){
                const data = await response.json()
                setErrorMessage(data.message);
                setTimeout(() => {
                    setErrorMessage('');
                }, 5000);
                return;
            }
            const data = await response.json();
            alert(data.message);
            navigate('/');

        }
        catch(err){
            setErrorMessage(err.message);
        }
    }


    return(
        <>
            <div className="Register-container">
                <div className="Register-Box">
                    <h1>Register</h1>
                    <div className="error-message">{errorMessage}</div>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                    <button onClick={(e) => validateRegister(e)}>Register</button>
                </div>
            </div>
        </>
    )    
}

export default Register;