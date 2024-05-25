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
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" {...register("email", { required: true, pattern: /^\S+@\S+$/i })} style={{ width: '100%', padding: '10px', fontSize: '16px' }} />
                    {errors.email && <span style={{ color: 'red' }}>Please enter a valid email address</span>}
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" {...register("password", { required: true })} style={{ width: '100%', padding: '10px', fontSize: '16px' }} />
                    {errors.password && <span style={{ color: 'red' }}>This field is required</span>}
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', fontSize: '16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>{
                    loading ? 'Loading...' : 'Login'
                }</button>
            </form>
        </div>
    );
}

export default Login;
