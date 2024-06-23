import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from './axiosConfig';
import Validation from './LoginValidation';
import { AuthContext } from './AuthContext';

const styles = `
.login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #f6d5f7, #fbeff5, #e6e6fa); /* Pale gradient background */
    height: 100vh;
    font-family: Arial, sans-serif;
}

.login-box {
    background-color: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 300px;
    text-align: center;
}

.login-box h2 {
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

function Login() {
    const { login } = useContext(AuthContext); 
    const [values, setValues] = useState({
        email:'',
        password:''
    });

    const navigate = useNavigate();
    const [errors, setErrors] = useState({});

    const handleInput = (event) => {
        setValues(prev => ({...prev, [event.target.name]:event.target.value}));
    }

    useEffect(() => {
        setErrors(Validation(values));
    }, [values]);

    const handleSubmit = (event) => {
        event.preventDefault();
        if(errors.email === "" && errors.password === "") {
            axios.post('/login', values)
            .then(res => {
                if(res.data.errors) {
                    setErrors(res.data.errors);
                } else {
                    setErrors([]);
                    if(res.data.Login){
                       localStorage.setItem("token", res.data.token);
                       login(res.data.token, { email: values.email });
                       console.log("Token saved");
                       navigate('/home');
                    } else {
                        alert("No record existed");
                    }
                }
            })
            .catch(err => {
                console.log("Error during login request:", err);
                if(err.response) {
                    console.log("Response data:", err.response.data);
                    console.log("Response status:", err.response.status);
                    console.log("Response headers:", err.response.headers);
                }
            });
        }
    }
    
    return (
        <div className='login-page'>
            <style>{styles}</style>
            <div className='login-box'>
                <h2>Sign in</h2>
                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor='email'>Email</label>
                        <input type="email" placeholder='Enter Email' name='email'
                        onChange={handleInput} className='form-control'/>
                        {errors.email && <span className='error-text'>{errors.email}</span>}
                    </div>
                    <div className='form-group'>
                        <label htmlFor='password'>Password</label>
                        <input type="password" placeholder='Enter Password' name='password'
                        onChange={handleInput} className='form-control'/>
                        {errors.password && <span className='error-text'>{errors.password}</span>}
                    </div>
                    <button type='submit' className='btn btn-primary w-100'>Log in</button>
                    <div className='link-group'>
                        <Link to="/forgot-password" className='link'>Forgot Password</Link>
                        <Link to="/signup" className='btn btn-secondary w-100'>Create Account</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
