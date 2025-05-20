import './App.css'
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { backendUrl } from './config.js';
import { useNavigate } from 'react-router-dom';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();



  const validateLogin = async (e) => {
    e.preventDefault();

    if (email === '' || password === '') {
      setErrorMessage('Please enter email and password');
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
      return;
    }

    if(!email.includes('@') || !email.includes('.')){
      setErrorMessage('Please enter a valid email');
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
      return;
    }


    const response = await fetch(`${backendUrl}/api/login`, 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
      }
    )

    const data = await response.json();

    if(!response.ok){
      setErrorMessage(data.message);
      setPassword('');
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
      return;
    }

    console.log(data.token);
    localStorage.setItem('token', data.token);
    navigate('/screens/dashboard')

  }

  return (
    <>
      <div className="Login-container">

        <div className="Login-Box">
          <h1>Vendora</h1>
          <div className='error-message'>{errorMessage}</div>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
          <button onClick={(e) => validateLogin(e)}>Login</button>
          <div className='login-Footer'>
            <Link to={`/screens/register`}>Sign Up</Link>
            <Link to='/screens/forgot-password'>Forgot Password?</Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
