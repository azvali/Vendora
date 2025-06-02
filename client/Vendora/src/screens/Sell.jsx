import './Sell.css'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'


function Sell(){
    const [itemName, setItemName] = useState('');
    const [price, setPrice] = useState('');
    const [condition, setCondition] = useState('');
    const [itemLocation, setItemLocation] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [userId, setUserId] = useState(null);

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

    const handleUpload = () => {
        
    };


    return(
        <>
            <form className='sell-container'>
                <h1>List your item.</h1>
                <div className='success-message'></div>
                <div className='error-message'></div>
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
                <button className='submit-button' onClick={() => {handleUpload();}}>Upload</button>
            </form>
        </>
    )
}

export default Sell