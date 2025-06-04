import './Sell.css'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { backendUrl } from '../config.js'

function Sell(){
    const [itemName, setItemName] = useState('');
    const [price, setPrice] = useState('');
    const [condition, setCondition] = useState('');
    const [itemLocation, setItemLocation] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [userId, setUserId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');


    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if(location.state?.userId){
            setUserId(location.state?.userId);
            console.log('user ID recieved.')
        }
        else{
            console.log('error passing user id');
        }
    },[setUserId, location.state?.userId]);

    const handleImageUpload = (e) => {
        console.log('hello')
        const file = e.target.files[0]

        if(file){
            setImage(file);
            const previewURL = URL.createObjectURL(file);
            setImagePreview(previewURL);
        }
        else{
            console.log('failed to upload image');
            setImage(null);
            setImagePreview(null);
            return;
        }
    }

    const setError = (msg) => {
        setErrorMessage(`${msg}`);
            setTimeout(() => {
                setErrorMessage('');
            }, 5000);
    }

    const setSuccess = (msg) => {
        setSuccessMessage(`${msg}`);
            setTimeout(() => {
                setSuccessMessage('');
            }, 5000);
    }

    const handleUpload = async (e) => {
        e.preventDefault();

        const trimmedPrice = price.trim();

        //filtering
        if(isNaN(trimmedPrice)){
            setError("Price must be a number.");
            return;
        }

        if(parseFloat(trimmedPrice) <= 0){
            setError('Price must be a positive number.');
            return;
        }

        if(!itemName || !image || !userId || !trimmedPrice || !condition || !itemLocation){
            setError('Please fill all fields.');
            return;
        }

        const formData = new FormData();
        formData.append('Id', userId);
        formData.append('Name', itemName.trim());
        formData.append('Image', image);
        formData.append('Price', trimmedPrice);
        formData.append('Condition', condition);
        formData.append('Location', itemLocation);

        try{
            const response = await fetch(`${backendUrl}/api/UploadItem`, {
                method: 'POST',
                body: formData
            });

            
            const data = await response.json();

            if(!response.ok){
                setError(data.message || 'Upload failed. Please try again.');
                return;
            }
            
            console.log('upload success', data);
            setSuccess('Upload Successful!')
            
            setItemName('');
            setImage('');
            setImagePreview('');
            setPrice('');
            setCondition('');
            setItemLocation('');

        }catch(err){
            console.log(err);
            setError('An error occurred during upload. Please try again.');
        }
    };


    return(
        <>
            <form className='sell-container'>
                <h1>List your item.</h1>
                <div className='success-message'>{successMessage}</div>
                <div className='error-message'>{errorMessage}</div>
                <input className='item-name' type='text' placeholder='Item Name'onChange={(e) => {setItemName(e.target.value);}}></input>
                <div className='image-preview'>
                    {imagePreview && (<img src={imagePreview} alt='Preview Image' style={{maxWidth: '400px', maxHeight: '400px'}}></img>)}
                </div>
                <input type='file' accept='image/*' onChange={(e) => {handleImageUpload(e);}}></input>
                <input className='item-price' type='text' placeholder='Price' onChange={(e) => {setPrice(e.target.value);}}></input>
                <select onChange={(e) => {setCondition(e.target.value);}}>
                    <option value='new'>New</option>
                    <option value='used'>Used</option>
                    <option value='good'>Good</option>
                    <option value='bad'>Bad</option>
                </select>
                <input className='location' type='text' placeholder='location' onChange={(e) => {setItemLocation(e.target.value);}}></input>
                <button className='submit-button' onClick={(e) => {handleUpload(e);}}>Upload</button>
            </form>
        </>
    )
}

export default Sell