import React from 'react';
import { GetPropertiesRoute } from '../../utils/APIRoutes';
import { useNavigate } from 'react-router-dom';
import { likePropertyRoute, routeMakeConnection } from '../../utils/APIRoutes';
import Cookies from 'universal-cookie';

const Home = () => {
    const cookies = new Cookies();
    const navigate = useNavigate();
    const [allProperties, setAllProperties] = React.useState([]);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [selectedProperty, setSelectedProperty] = React.useState(null);
    const [showModal, setShowModal] = React.useState(false);

    React.useEffect(() => {
        // Check if user is logged in
        const userRole = localStorage.getItem('user_role');
        if (userRole) {
            setIsLoggedIn(true);
        }

        fetch(GetPropertiesRoute)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setAllProperties(data);
            })
            .catch(error => {
                console.error('Error fetching properties:', error);
            });
    }, []);

    const handleViewProperty = (property) => {
        if (isLoggedIn) {
            console.log('View Property:', property);
            setSelectedProperty(property);
            setShowModal(true);
        } else {
            navigate('/login');
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleLikeProperty = async (propertyId) => {
        const token = cookies.get('rentify_token');
        const requestData = {
            token,
            property_id: propertyId
        };

        try {
            const response = await fetch(likePropertyRoute, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(requestData)
            });
            const data = await response.json();
            console.log(data);
            // Update the likes count in the UI
            const updatedProperties = allProperties.map(property => {
                if (property.id === propertyId) {
                    return {
                        ...property,
                        likes: property.likes ? property.likes + 1 : 1
                    };
                }
                return property;
            });
            setAllProperties(updatedProperties);
        } catch (error) {
            console.error('Error liking property:', error);
        }
    }


    const handleMakeConnection = async (selectedProperty) => {
        const token = cookies.get('rentify_token');
        const requestData = {
            token,
            seller_email: selectedProperty.email,
            seller_contact: selectedProperty.phone_number
        };

        try {
            const response = await fetch(routeMakeConnection, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(requestData)
            });
            const data = await response.json();
            console.log(data);
        }
        catch (error) {
            console.error('Error making connection:', error);
        }
    }


    return (
        <div className="container">
            <h1 className="text-center">All Properties</h1>
            <div className="row">
                {allProperties.map(property => (
                    <div className="col-md-4" key={property.id}>
                        <div className="card">
                            <img src={property.image_url} className="card-img-top" alt="Property Image" />
                            <div className="card-body">
                                <h5 className="card-title">{property.title}</h5>
                                <p className="card-text">{property.description}</p>
                                <p className="card-text">Price: {property.price}</p>
                                <p className="card-text">Rooms: {property.num_rooms}</p>
                                <p className="card-text">Bathrooms: {property.num_bathrooms}</p>
                                <p className="card-text">Address: {property.address}</p>
                                <p className="card-text">City: {property.city}</p>
                                <p className="card-text">State: {property.state}</p>
                                <p className="card-text">Zipcode: {property.zipcode}</p>
                                {isLoggedIn ? (
                                    <div className='flex justify-between items-center gap-3'>
                                        <button className="btn btn-primary" onClick={() => handleViewProperty(property)}>View Property</button>
                                        <button className="btn btn-warning" onClick={() => handleLikeProperty(property.id)}>👍🏽</button> Likes: {property.like_count || 0}
                                    </div>
                                ) : (
                                    <button className="btn btn-primary" onClick={() => handleViewProperty(property)}>View Property</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {showModal && selectedProperty && (
                <div className="modalCustom">
                    <div className="modal-content-custom">
                        <span className="closeCustom" onClick={closeModal}>&times;</span>
                        <h2>Seller Details</h2>
                        <p>Name: {selectedProperty.first_name} {selectedProperty.last_name}</p>
                        <p>Email: {selectedProperty.email}</p>
                        <p>Phone Number: {selectedProperty.phone_number}</p>
                        <button className="btn btn-primary" onClick={() => handleMakeConnection(selectedProperty)}>I am interested</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
