import React from 'react'
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const cookies = new Cookies();
    const navigate = useNavigate();

    const [loginState, setLoginState] = React.useState(false);

    React.useEffect(() => {
        if (cookies.get('rentify_token')) {
            setLoginState(true);
        }
    }
        , []);

    const handleLogout = () => {
        cookies.remove('rentify_token');
        localStorage.removeItem('user_role');
        setLoginState(false);
        navigate('/');
    }

    return (
        <div>
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">Rentify</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <a className="nav-link active" aria-current="page" href="/">Home</a>
                            </li>
                            {/* <li className="nav-item">
                                <a className="nav-link" href="#">Features</a>
                            </li> */}
                            <li className="nav-item">
                                <a className="nav-link" href={
                                    loginState ? '/seller/dashboard' : '/login'
                                } onClick={() => {
                                    if (loginState) {
                                        navigate('/seller/dashboard');
                                    }
                                }
                                }>{
                                        loginState ? 'Dashboard' : 'Login'

                                    }</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href={
                                    loginState ? '/seller/properties' : '/register'
                                } onClick={() => {
                                    if (loginState) {
                                        navigate('/seller/properties');
                                    }
                                }
                                }>{
                                        loginState ? 'Properties' : 'Register'

                                    }</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" onClick={handleLogout} href="/">{
                                    loginState ? 'Logout' : ''
                                }</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Navbar