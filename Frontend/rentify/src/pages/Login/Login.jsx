// Login.js

import React, { useEffect, useState } from 'react';
import { set, useForm } from 'react-hook-form';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import Cookies from 'universal-cookie';
import { UserLoginRoute } from '../../utils/APIRoutes';
import { useNavigate } from 'react-router-dom';

const cookies = new Cookies();

const Login = () => {

    const [passwordType, setPasswordType] = useState('password');

    const togglePasswordType = () => {
        if (passwordType === 'password') {
            setPasswordType('text');
        } else {
            setPasswordType('password');
        }
    }

    useEffect(() => {
        if (cookies.get('rentify_token')) {
            navigate('/');
        }
    }, []);

    const { register, handleSubmit, formState: { errors } } = useForm();
    const [responseTypeText, setResponseTypeText] = useState({
        message: '',
        type: ''
    });
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({});
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await axios.post(UserLoginRoute, data);
            const { token, user } = response.data;
            // console.log('Token:', token);
            // console.log('Response:', response.data);
            setUser(user);
            // console.log('User:', user);

            cookies.set('rentify_token', token, { path: '/' });

            if (user.type === 'seller') {
                navigate('/seller/dashboard');
                localStorage.setItem('user_role', 'seller');
            }
            else {
                navigate('/');
                localStorage.setItem('user_role', 'buyer');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error logging in:', error);
            setResponseTypeText({ message: error.response.data.message, type: 'danger' });
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login to Rentify</h2>
            {
                responseTypeText.message && (
                    <div className={`alert alert-${responseTypeText.type} alert-dismissible fade show`} role="alert">
                        {responseTypeText.message}
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                )
            }

            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ marginBottom: '15px', position: 'relative' }}>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" {...register("email", { required: true, pattern: /^\S+@\S+$/i })} style={{ width: '100%', padding: '10px', fontSize: '16px' }} />
                    {errors.email && <span style={{ color: 'red' }}>Please enter a valid email address</span>}
                </div>
                <div style={{ marginBottom: '15px', position: 'relative' }}>
                    <label htmlFor="password">Password</label>
                    <input type={passwordType} id="password" {...register("password", { required: true })} style={{ width: '100%', padding: '10px', fontSize: '16px' }} />
                    {errors.password && <span style={{ color: 'red' }}>This field is required</span>}

                    <svg onClick={togglePasswordType} className="svg-icon" viewBox="0 0 20 20" style={{ cursor: "pointer", position: 'absolute', right: '10px', top: '65%', transform: 'translateY(-50%)' }}>
                        <path fill="none" d="M19.471,8.934L18.883,8.34c-2.096-2.14-4.707-4.804-8.903-4.804c-4.171,0-6.959,2.83-8.996,4.897L0.488,8.934c-0.307,0.307-0.307,0.803,0,1.109l0.401,0.403c2.052,2.072,4.862,4.909,9.091,4.909c4.25,0,6.88-2.666,8.988-4.807l0.503-0.506C19.778,9.737,19.778,9.241,19.471,8.934z M9.98,13.787c-3.493,0-5.804-2.254-7.833-4.3C4.182,7.424,6.493,5.105,9.98,5.105c3.536,0,5.792,2.301,7.784,4.332l0.049,0.051C15.818,11.511,13.551,13.787,9.98,13.787z"></path>
                        <circle fill="none" cx="9.98" cy="9.446" r="1.629"></circle>
                    </svg>
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', fontSize: '16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>{
                    loading ? 'Loading...' : 'Login'
                }</button>
            </form>
        </div>
    );
}

export default Login;
