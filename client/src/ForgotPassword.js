import React, { useState, } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from './axiosConfig';


function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    //const [errors, setErrors] = useState({});

    const handleInput = (event) => {
        setEmail(event.target.value);
    }

    
    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post('/forgot-password', {email})
            .then(res => {
                if (res.data.Status === "Success") {
                    setMessage('Please check your email for the reset link.');
                    setTimeout(() => {
                        navigate('/login');
                    }, 5000);
                } else {
                    setMessage('Email not found');
                }
            })
            .catch(err => {
                console.log('Error:', err);
                if (err.code === 'ECONNABORTED') {
                    setMessage('Request timed out. Please try again.');
                } else {
                    setMessage('An error occurred. Please try again.');
                }
            });
        
    }
    
    return (
        <div className='d-flex justify-content-center align-items-center bg-primary vh-100'>
            <div className='bg-white p-3 rounded w-25'>
                <h2>Forgot Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label htmlFor='email'><strong>Email</strong></label>
                        <input type="email" placeholder='Enter Email' name='email'
                        onChange={handleInput} className='form-control rounded-0'/>
                    </div>
                    <button type='submit' className='btn btn-success w-100 rounded-0'><strong>Send</strong></button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default ForgotPassword;
