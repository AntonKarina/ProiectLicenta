import React, { useState } from 'react';
import axios from './axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import Validation from './SignupValidation';

const styles = `
.signup-page {
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #f6d5f7, #fbeff5, #e6e6fa); /* Pale gradient background */
    height: 100vh;
    font-family: Arial, sans-serif;
}

.signup-box {
    background-color: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 300px;
    text-align: center;
}

.signup-box h2 {
    color: #ff0066;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 15px;
    text-align: left;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    color: #333;
}

.form-control {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.btn {
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn-primary {
    background-color: #ff0066;
    color: white;
    margin-top: 10px;
}

.btn-primary:hover {
    background-color: #cc0052; /* Slightly darker shade on hover */
}

.btn-secondary {
    background-color: #999999; /* Neutral grey color */
    color: white;
    margin-top: 10px;
}

.btn-secondary:hover {
    background-color: #777777; /* Slightly darker grey on hover */
}

.link-group {
    margin-top: 15px;
}

.link {
    color: #666666; /* Neutral grey color */
    text-decoration: none;
    display: block;
    margin-top: 10px;
}

.link:hover {
    text-decoration: underline;
}

.error-text {
    color: red;
    font-size: 0.9em;
}
`;

function Signup() {
    const [values, setValues] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        setValues({ ...values, [name]: value });
        if (name === 'password') {
            setErrors({ ...errors, password: Validation({ ...values, [name]: value }).password });
        }
        if (name === 'confirmPassword') {
            setConfirmPassword(value);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrors(Validation(values));
        if (values.password !== confirmPassword) {
            setErrors({ ...errors, confirmPassword: 'Passwords do not match' });
            return;
        }
        if (Object.values(errors).every(val => val === '')) {
            axios.post('/signup', values)
                .then(res => {
                    navigate('/');
                    console.log("Registered Successfully");
                })
                .catch(err => console.log(err));
        }
    };

    return (
        <div className='signup-page'>
            <style>{styles}</style>
            <div className='signup-box'>
                <h2>Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor="email">Email</label>
                        <input type="email" placeholder='Enter Email' name='email'
                            className='form-control' onChange={handleChange} />
                        {errors.email && <span className='error-text'>{errors.email}</span>}
                    </div>
                    <div className='form-group'>
                        <label htmlFor='password'>Password</label>
                        <input type='password' placeholder='Enter Password' name='password'
                            className='form-control' onChange={handleChange} />
                        {errors.password && <span className='error-text'>{errors.password}</span>}
                    </div>
                    <div className='form-group'>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input type="password" placeholder='Confirm Password' name='confirmPassword'
                            className='form-control' onChange={handleChange} />
                        {errors.confirmPassword && <span className='error-text'>{errors.confirmPassword}</span>}
                    </div>
                    <button type='submit' className='btn btn-primary w-100'>Sign up</button>
                    <div className='link-group'>
                        <Link to='/login' className='link'>Log in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Signup;
