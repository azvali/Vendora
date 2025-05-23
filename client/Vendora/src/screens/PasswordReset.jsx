import "./PasswordReset.css";
import { useState, useEffect } from 'react'
import { backendUrl } from '../config.js'
import { useSearchParams, useNavigate } from 'react-router-dom'

function PasswordReset(){
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [urlToken, setUrlToken] = useState(null);

    useEffect(() => {
        const tokenFromURL = searchParams.get('token');
        if(tokenFromURL){
            setUrlToken(tokenFromURL);
            console.log("Token found in URL:", tokenFromURL);
        }
        else{
            console.error('Token not found in URL.');
            setErrorMessage('Invalid or missing password reset link.');
        }
    },[searchParams]);

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setErrorMessage(''); 
        setSuccessMessage('');

        if (!urlToken) {
            setErrorMessage("Password reset token is missing or invalid. Please use the link from your email.");
            return;
        }

        if(newPassword.length < 8){
            setErrorMessage('Passwords must be at least 8 characters');
            return;
        }
        if(newPassword !== confirmPassword){
            setErrorMessage('Passwords do not match');
            return;
        }

        try{
            const response = await fetch(`${backendUrl}/api/PasswordReset`, {
                method : "PUT",
                headers : {
                    "Content-Type" : 'application/json'
                },
                body : JSON.stringify({
                    Token: urlToken,
                    NewPassword: newPassword
                })
            });

            const data = await response.json()

            if(response.ok){
                setSuccessMessage(data.message || 'Password has been reset successfully!');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => {
                    navigate('/'); 
                }, 3000);
            }
            else{
                setErrorMessage(data.message || 'Failed to reset password.');
                setTimeout(() => {
                    setErrorMessage('');
                }, 5000);
            }
        }catch(err){
            console.error("Password reset error:", err);
            setErrorMessage(err.message || 'An error occurred. Please try again.');
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
        }
    }

    if (!searchParams.get('token') && !urlToken && !errorMessage) {
        return <div>Validating reset link... If this persists, the link may be invalid.</div>;
    }
    if (errorMessage && !urlToken && searchParams.get('token') === null) { 
        return (
            <div className='reset-container'>
                <div className='reset-box'>
                    <h1>Reset Password</h1>
                    <div className='errorMessage'>{errorMessage}</div>
                </div>
            </div>
        );
    }

    return(
        <>
            <div className='reset-container'>
                <form className='reset-box' onSubmit={handlePasswordReset}>
                    <h1>Reset Password</h1>
                    {errorMessage && <div className='errorMessage'>{errorMessage}</div>}
                    {successMessage && <div className='successMessage'>{successMessage}</div>}
                    <input 
                        type="password"
                        placeholder='New Password' 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <input 
                        type="password"
                        placeholder='Confirm New Password' 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button type="submit">Reset Password</button>
                </form>
            </div>
        </>
    )
}

export default PasswordReset;