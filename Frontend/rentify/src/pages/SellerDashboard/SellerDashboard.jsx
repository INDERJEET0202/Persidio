import React, { useState, useEffect } from 'react';
import { AddPropertyRoute, GetPropertyRoute, editPropertyRoute } from '../../utils/APIRoutes';
import Cookies from 'universal-cookie';
import axios from 'axios';

const SellerDashboard = () => {
    const cookies = new Cookies();
    const [properties, setProperties] = useState([]);
    const [property, setProperty] = useState({
        id: '',
        area: '',
        num_rooms: 0,
        num_bathrooms: 0,
        num_garages: 0,
        price: 0,
        address: '',
        city: '',
        state: '',
        zipcode: '',
        description: '',
        property_type: '',
        image_url: '',
        nearby_parks: false,
        nearby_hospitals: false,
        nearby_schools: false
    });
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [responseTypeText, setResponseTypeText] = useState({
        message: '',
        type: ''
    });

    useEffect(() => {
        if (!localStorage.getItem('user_role') || localStorage.getItem('user_role') !== 'seller') {
            window.location.href = '/';
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProperty(prevProperty => ({
            ...prevProperty,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setProperty(prevProperty => ({
            ...prevProperty,
            [name]: checked
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const token = cookies.get('rentify_token');
            const response = isEditing
                ? await axios.put(editPropertyRoute, { token, ...property })
                : await axios.post(AddPropertyRoute, { token, ...property });

            console.log(response.data);
            setResponseTypeText({ message: response.data.message, type: 'success' });

            if (isEditing) {
                setProperties(prevProperties =>
                    prevProperties.map(p => (p.id === property.id ? property : p))
                );
            } else {
                setProperties([...properties, response.data.property]);
            }

            setLoading(false);
            setIsEditing(false);
            setProperty({
                id: '',
                area: '',
                num_rooms: 0,
                num_bathrooms: 0,
                num_garages: 0,
                price: 0,
                address: '',
                city: '',
                state: '',
                zipcode: '',
                description: '',
                property_type: '',
                image_url: '',
                nearby_parks: false,
                nearby_hospitals: false,
                nearby_schools: false
            });
        } catch (error) {
            console.error('Error adding property:', error);
            setResponseTypeText({ message: error.response.data.message, type: 'danger' });
            setLoading(false);
        }
    };

    const handleEdit = (property) => {
        setProperty(property);
        setIsEditing(true);
        const modal = new window.bootstrap.Modal(document.getElementById('propertyModal'));
        modal.show();
    };

    useEffect(() => {
        const token = cookies.get('rentify_token');
        const fetchProperties = async () => {
            try {
                const response = await axios.get(GetPropertyRoute, {
                    headers: {
                        Authorization: token
                    }
                });
                console.log(response.data);
                setProperties(response.data);
            } catch (error) {
                console.error('Error fetching properties:', error);
            }
        };
        fetchProperties();
    }, []);

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Seller Dashboard</h1>
            <div className="d-flex justify-content-center">
                <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#propertyModal">
                    Add a new property
                </button>
            </div>

            {responseTypeText.message && (
                <div className={`alert alert-${responseTypeText.type} alert-dismissible fade show mt-3`} role="alert">
                    {responseTypeText.message}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            )}

            <div className="row mt-4">
                {properties.length === 0 && <h3 className="text-center">No properties added yet</h3>}
                {properties.map(property => (
                    <div className="col-md-4" key={property.id}>
                        <div className="card mb-4 property-card">
                            <img src={property.image_url} className="card-img-top property-card-img" alt="Property" />
                            <div className="card-body property-card-details">
                                <h5 className="card-title property-card-title">{property.address}, {property.city}, {property.state}</h5>
                                <p className="card-text property-card-text"><strong>Price: Rs </strong> {property.price}</p>
                                <p className="card-text property-card-text"><strong> Area:</strong>  {property.area} sq feet</p>
                                <p className="card-text property-card-text"><strong> Type:</strong>  {property.property_type.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</p>
                                <p className="card-text property-card-text"><strong> Rooms:</strong>  {property.num_rooms}</p>
                                <p className="card-text property-card-text"><strong> Bathrooms:</strong>  {property.num_bathrooms}</p>
                                <p className="card-text property-card-text"><strong> Garages:</strong>  {property.num_garages}</p>
                                <p className="card-text property-card-description"><strong> Description:</strong>  {property.description}</p>
                                <p className="card-text property-card-text"><strong> Nearby Parks: </strong> {property.nearby_parks ? 'Yes' : 'No'}</p>
                                <p className="card-text property-card-text"><strong> Nearby Hospitals: </strong> {property.nearby_hospitals ? 'Yes' : 'No'}</p>
                                <p className="card-text property-card-text"><strong> Nearby Schools: </strong> {property.nearby_schools ? 'Yes' : 'No'}</p>
                                <button className="btn btn-secondary mt-2" onClick={() => handleEdit(property)}>Edit</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="modal fade" id="propertyModal" tabIndex="-1" aria-labelledby="propertyModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-3" id="propertyModalLabel">{isEditing ? 'Edit Property' : 'Add New Property'}</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row mb-3">
                                <div className="col">
                                    <label htmlFor="area" className="form-label">Area</label>
                                    <input type="text" className="form-control" id="area" name="area" placeholder='in sq feet' value={property.area} onChange={handleChange} />
                                </div>
                                <div className="col">
                                    <label htmlFor="num_rooms" className="form-label">Number of Rooms</label>
                                    <input type="number" className="form-control" id="num_rooms" name="num_rooms" value={property.num_rooms} onChange={handleChange} />
                                </div>
                                <div className="col">
                                    <label htmlFor="num_bathrooms" className="form-label">Number of Bathrooms</label>
                                    <input type="number" className="form-control" id="num_bathrooms" name="num_bathrooms" value={property.num_bathrooms} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col">
                                    <label htmlFor="num_garages" className="form-label">Number of Garages</label>
                                    <input type="number" className="form-control" id="num_garages" name="num_garages" value={property.num_garages} onChange={handleChange} />
                                </div>
                                <div className="col">
                                    <label htmlFor="price" className="form-label">Price</label>
                                    <input type="number" className="form-control" id="price" name="price" placeholder='in Rs' value={property.price} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col">
                                    <label htmlFor="address" className="form-label">Address</label>
                                    <input type="text" className="form-control" id="address" name="address" value={property.address} onChange={handleChange} />
                                </div>
                                <div className="col">
                                    <label htmlFor="city" className="form-label">City</label>
                                    <input type="text" className="form-control" id="city" name="city" value={property.city} onChange={handleChange} />
                                </div>
                                <div className="col">
                                    <label htmlFor="state" className="form-label">State</label>
                                    <input type="text" className="form-control" id="state" name="state" value={property.state} onChange={handleChange} />
                                </div>
                                <div className="col">
                                    <label htmlFor="zipcode" className="form-label">Zipcode</label>
                                    <input type="text" className="form-control" id="zipcode" name="zipcode" value={property.zipcode} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <textarea className="form-control" id="description" name="description" rows="3" value={property.description} onChange={handleChange}></textarea>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col">
                                    <label htmlFor="property_type" className="form-label">Property Type</label>
                                    <select className="form-control" id="property_type" name="property_type" value={property.property_type} onChange={handleChange}>
                                        <option value="">Select Property Type</option>
                                        <option value="apartment">Apartment</option>
                                        <option value="house">House</option>
                                        <option value="condo">Condo</option>
                                    </select>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col">
                                    <label htmlFor="image_url" className="form-label">Image URL</label>
                                    <input type="text" className="form-control" id="image_url" name="image_url" value={property.image_url} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="nearby_parks" name="nearby_parks" checked={property.nearby_parks} onChange={handleCheckboxChange} />
                                        <label className="form-check-label" htmlFor="nearby_parks">Nearby Parks</label>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="nearby_hospitals" name="nearby_hospitals" checked={property.nearby_hospitals} onChange={handleCheckboxChange} />
                                        <label className="form-check-label" htmlFor="nearby_hospitals">Nearby Hospitals</label>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="nearby_schools" name="nearby_schools" checked={property.nearby_schools} onChange={handleCheckboxChange} />
                                        <label className="form-check-label" htmlFor="nearby_schools">Nearby Schools</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={handleSubmit}>{
                                loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : isEditing ? 'Save Changes' : 'Add Property'
                            }</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SellerDashboard;
