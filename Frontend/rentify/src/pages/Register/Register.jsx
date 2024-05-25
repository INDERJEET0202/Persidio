import React from 'react';
import { useForm } from 'react-hook-form';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';
import { UserRegisterRoute } from '../../utils/APIRoutes';

const Register = () => {
    const cookies = new Cookies();
    const navigate = useNavigate();
    React.useEffect(() => {
        if (cookies.get('rentify_token')) {
            navigate('/');
        }
    }, []);

    const { register, handleSubmit, formState: { errors } } = useForm();
    const [responseTypeText, setResponseTypeText] = React.useState({
        message: '',
        type: ''
    });
    const [loading, setLoading] = React.useState(false);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const onSubmit = async (data) => {
        setLoading(true);
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const requestData = {
            first_name: data.firstName,
            last_name: data.lastName,
            password: hashedPassword,
            email: data.email,
            phone_number: data.phone,
            type: data.userType
        };

        try {
            const response = await axios.post(UserRegisterRoute, requestData);
            console.log(response.data);
            setResponseTypeText({ message: response.data.message, type: 'success' });
            setLoading(false);

        } catch (error) {
            console.error('Error registering user:', error);
            setResponseTypeText({ message: error.response.data.message, type: 'danger' });
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register to Rentify</h2>
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
                    <label htmlFor="firstName">First Name</label>
                    <input type="text" id="firstName" {...register("firstName", { required: true })} style={{ width: '100%', padding: '10px', fontSize: '16px' }} />
                    {errors.firstName && <span style={{ color: 'red' }}>This field is required</span>}
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="lastName">Last Name</label>
                    <input type="text" id="lastName" {...register("lastName", { required: true })} style={{ width: '100%', padding: '10px', fontSize: '16px' }} />
                    {errors.lastName && <span style={{ color: 'red' }}>This field is required</span>}
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" {...register("email", { required: true, pattern: emailRegex })} style={{ width: '100%', padding: '10px', fontSize: '16px' }} />
                    {errors.email && <span style={{ color: 'red' }}>Please enter a valid email address</span>}
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="phone">Phone Number</label>
                    <input type="tel" id="phone" {...register("phone", { required: true })} style={{ width: '100%', padding: '10px', fontSize: '16px' }} />
                    {errors.phone && <span style={{ color: 'red' }}>This field is required</span>}
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" {...register("password", { required: true, minLength: 6 })} style={{ width: '100%', padding: '10px', fontSize: '16px' }} />
                    {errors.password && errors.password.type === "required" && <span style={{ color: 'red' }}>This field is required</span>}
                    {errors.password && errors.password.type === "minLength" && <span style={{ color: 'red' }}>Password must be at least 6 characters</span>}
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="userType">User Type</label>
                    <select id="userType" {...register("userType", { required: true })} style={{ width: '100%', padding: '10px', fontSize: '16px' }}>
                        <option value="">Select User Type</option>
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                    </select>
                    {errors.userType && <span style={{ color: 'red' }}>Please select a user type</span>}
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', fontSize: '16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>{
                    loading ? 'Loading...' : 'Register'
                }</button>
            </form>
        </div>
    );
}

export default Register;
