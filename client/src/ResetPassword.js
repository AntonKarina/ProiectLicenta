import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from './axiosConfig';

function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { token } = useParams();

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post(`/reset-password/${token}`, { newPassword })
            .then(res => {
                if (res.data.Status === 'Success') {
                    setMessage('Password has been reset successfully.');
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                } else {
                    setMessage('Password reset token is invalid or has expired.');
                }
            })
            .catch(err => console.log(err));
    };

    return (
        <div className='d-flex justify-content-center align-items-center bg-primary vh-100'>
            <div className='bg-white p-3 rounded w-25'>
                <h2>Reset Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label htmlFor='newPassword'><strong>New Password</strong></label>
                        <input type="password" placeholder='Enter new password' name='newPassword'
                               onChange={(e) => setNewPassword(e.target.value)} className='form-control rounded-0'/>
                    </div>
                    <button type='submit' className='btn btn-success w-100 rounded-0'><strong>Reset</strong></button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default ResetPassword;
