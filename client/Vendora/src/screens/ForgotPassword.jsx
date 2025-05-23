import { useState } from "react"
import { backendUrl } from "../config.js"
import { useNavigate } from "react-router-dom"
import './ForgotPassword.css'
function ForgotPassword() {

    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if(email === '' || !isValidEmail(email)){
            setErrorMessage("Invalid Email.");
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
            return;
        }

        try{
            const response = await fetch(`${backendUrl}/api/sendEmail`, {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({
                        Email : email
                })
            });

            const data = await response.json()

            if(response.ok){
                setSuccessMessage(data.message || "Password reset instructions sent to your email!");
                setEmail('');
                setTimeout(() => {
                    setSuccessMessage('');
                }, 4000);
            } else {
                setErrorMessage(data.message || "Failed to send reset email.");
                setTimeout(() => {
                    setErrorMessage('');
                }, 5000);
            }
            
        }catch(error){
            setErrorMessage(error.message || "An unexpected error occurred.");
            setTimeout(() => {
                setErrorMessage('');
            }, 5000);
        }
    }

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    return(
        <>
            <div className="ForgotPassword-container">
                <div className="ForgotPassword-Box">
                    <h1>Reset Password</h1>
                    
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                    {successMessage && <div className="success-message">{successMessage}</div>}
                    
                    <p>Enter your email address and we'll send you a link to reset your password.</p>
                    
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    
                    <button onClick={handleResetPassword}>Send Reset Link</button>
                    
                    <div className="forgot-password-footer">
                        <button onClick={() => navigate("/")}>Back to Login</button>
                    </div>
                </div>
            </div>
        </>
    )    
}

export default ForgotPassword;