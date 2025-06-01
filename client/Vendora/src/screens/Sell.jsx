import './Sell.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'


function Sell(){
    const [itemName, setItemName] = useState('');
    const [price, setPrice] = useState('');
    const [condition, setCondition] = useState('');
    const [location, setLocation] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);


    const navigate = useNavigate();

    const handleUpload = () => {

    };


    return(
        <>
            <form className='sell-container'>
                <h1>List your item.</h1>
                <div className='success-message'></div>
                <div className='error-message'></div>
                <input className='item-name' type='text' placeholder='Item Name' onChange={(e) => {setItemName(e.target.value)}}></input>
                <input type='file' accept='image/*'></input>
                <input className='item-price' type='text' placeholder='Price' onChange={(e) => {setPrice(e.target.value)}}></input>
                <select onChange={(e) => {setCondition(e.target.value)}}>
                    <option value='new'>New</option>
                    <option value='used'>Used</option>
                    <option value='good'>Good</option>
                    <option value='bad'>Bad</option>
                </select>
                <input className='location' type='text' placeholder='location' onChange={(e) => {setLocation(e.target.value)}}></input>
                <button className='submit-button' onClick={() => {handleUpload()}}>Upload</button>
            </form>
        </>
    )
}

export default Sell