// index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const connectToDatabase = require('./db');
const usersTable = require('./Schema/UsersTable');
const propertiesTable = require('./Schema/PropertiesTable');
const propertyUsersMapping = require('./Schema/PropertyUsersMapping');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

const secretKey = process.env.JWT_SECRET

// Middleware
app.use(bodyParser.json());
app.use(cors());

// usersTable();
// propertiesTable();
// propertyUsersMapping();

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

app.post('/api/user/register', async (req, res) => {
    const client = await connectToDatabase();
    const { first_name, last_name, password, email, phone_number, type } = req.body;

    try {
        const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const result = await client.query(
            'INSERT INTO users (first_name, last_name, password, email, phone_number, type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [first_name, last_name, password, email, phone_number, type]
        );
        res.json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ message: 'Error registering user' });
    } finally {
        await client.end();
    }
});

app.post('/api/user/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const client = await connectToDatabase();
        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '15d' });

        // res.json({ token });
        res.json({ message: "User logged in successfully", "token": token, "user": { "id": user.id, "first_name": user.first_name, "last_name": user.last_name, "email": user.email, "phone_number": user.phone_number, "type": user.type } })

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});


app.post('/api/property/add', async (req, res) => {
    const { token, area, num_rooms, num_bathrooms, num_garages, price, address, city, state, zipcode, description, property_type, image_url, nearby_parks, nearby_hospitals, nearby_schools, sold } = req.body;

    try {
        const decoded = jwt.verify(token, secretKey);
        console.log('Decoded:', decoded)
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const client = await connectToDatabase();
        const result = await client.query(
            'INSERT INTO properties (area, num_rooms, num_bathrooms, num_garages, price, address, city, state, zipcode, description, property_type, image_url, nearby_parks, nearby_hospitals, nearby_schools, sold) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *',
            [area, num_rooms, num_bathrooms, num_garages, price, address, city, state, zipcode, description, property_type, image_url, nearby_parks, nearby_hospitals, nearby_schools, 0]
        );
        // push the property id and user id to the property_users_mapping table
        const propertyId = result.rows[0].id;
        const userId = decoded.userId;
        await client.query(
            'INSERT INTO property_users_mapping (property_id, user_id) VALUES ($1, $2)',
            [propertyId, userId]
        );

        res.json({ message: 'Property added successfully' });
    } catch (error) {
        console.error('Error adding property:', error);
        res.status(500).json({ message: 'Error adding property' });
    }
});

// edit property route
app.put('/api/property/edit', async (req, res) => {
    const { token, property_id, area, num_rooms, num_bathrooms, num_garages, price, address, city, state, zipcode, description, property_type, image_url, nearby_parks, nearby_hospitals, nearby_schools } = req.body;

    try {
        const decoded = jwt.verify(token, secretKey);
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const client = await connectToDatabase();
        const result = await client.query(
            'UPDATE properties SET area = $1, num_rooms = $2, num_bathrooms = $3, num_garages = $4, price = $5, address = $6, city = $7, state = $8, zipcode = $9, description = $10, property_type = $11, image_url = $12, nearby_parks = $13, nearby_hospitals = $14, nearby_schools = $15 WHERE id = $16 RETURNING *',
            [area, num_rooms, num_bathrooms, num_garages, price, address, city, state, zipcode, description, property_type, image_url, nearby_parks, nearby_hospitals, nearby_schools, property_id]
        );
        res.json({ message: 'Property updated successfully' });
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({ message: 'Error updating property' });
    }
});

app.get('/api/properties', async (req, res) => {
    try {
        const client = await connectToDatabase();
        // there is a briging table between then as property_users_mapping, retrive the data by joining those tables
        const result = await client.query(`
            SELECT p.*, u.first_name, u.last_name, u.email, u.phone_number
            FROM properties p
            JOIN property_users_mapping map ON p.id = map.property_id
            JOIN users u ON map.user_id = u.id;
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Error fetching properties' });
    }
});

app.get('/api/properties/user', async (req, res) => {
    const token = req.headers.authorization;
    try {
        const decoded = jwt.verify(token, secretKey);
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const client = await connectToDatabase();
        const result = await client.query(`
            SELECT p.*, u.first_name, u.last_name, u.email, u.phone_number
            FROM properties p
            JOIN property_users_mapping map ON p.id = map.property_id
            JOIN users u ON map.user_id = u.id
            WHERE u.id = $1
        `, [decoded.userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Error fetching properties' });
    }
});


app.post('/api/property/like', async (req, res) => {
    const { token, property_id } = req.body;
    try {
        const decoded = jwt.verify(token, secretKey);
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const client = await connectToDatabase();
        const result = await client.query('UPDATE properties SET like_count = like_count + 1 WHERE id = $1 RETURNING *', [property_id]);
        res.json({ message: 'Property liked successfully' });
    } catch (error) {
        console.error('Error liking property:', error);
        res.status(500).json({ message: 'Error liking property' });
    }
});

// send email to the user about the details of the property he saw / clicked on im am interested in
app.post('/api/email/sendToBuyer', async (req, res) => {
    const { token, seller_email, seller_contact } = req.body;

    try {
        const decoded = jwt.verify(token, secretKey);
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Retrieve buyer email and contact from database
        const client = await connectToDatabase();
        const result = await client.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
        const buyer_email = result.rows[0].email;
        const buyer_contact = result.rows[0].phone_number;

        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'palindrajit11@gmail.com',
                pass: 'jngc tzfv dvjl pudo',
            },
        });

        // Email options for seller
        const mailOptionsSeller = {
            from: 'palindrajit11@gmail.com',
            to: seller_email,
            subject: 'Property Interest Notification',
            text: `Hello,

        A potential buyer has shown interest in your property. Here are their contact details:

        Email: ${buyer_email}
        Phone Number: ${buyer_contact}

        Best regards,
        Your Real Estate Platform
        `
        };

        // Email options for buyer
        const mailOptionsBuyer = {
            from: 'palindrajit11@gmail.com',
            to: buyer_email,
            subject: 'Property Inquiry Confirmation',
            text: `Hello,

            You have shown interest in a property. Here are the seller's contact details:

            Email: ${seller_email}
            Phone Number: ${seller_contact}

            Best regards,
            Your Real Estate Platform
            `
        };

        // Send emails to both parties
        await transporter.sendMail(mailOptionsSeller);
        await transporter.sendMail(mailOptionsBuyer);

        console.log('Emails sent successfully');

        res.status(200).json({ message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
