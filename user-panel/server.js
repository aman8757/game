require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve frontend files

// MongoDB Connection Logic
let isConnected;

const connectDB = async () => {
    if (isConnected) {
        return;
    }
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is not defined in environment variables');
        throw new Error('Database connection string missing');
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI);
        isConnected = db.connections[0].readyState;
        console.log('MongoDB Atlas Connected Successfully! ✅');
    } catch (err) {
        console.error('MongoDB Connection Error ❌:', err);
        throw err;
    }
};

// Define Schema for Registration
const registrationSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    squadName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    transactionId: { type: String, required: true },
    status: { type: String, default: 'Pending' } // For admin panel to approve/reject
}, { timestamps: true });

const Registration = mongoose.model('Registration', registrationSchema);

// API Route: Register a new Squad
app.post('/api/register', async (req, res) => {
    try {
        await connectDB();
        const newRegistration = new Registration(req.body);
        await newRegistration.save();
        res.status(201).json({ message: 'Registration successful!', data: newRegistration });
    } catch (error) {
        console.error('Error in registration:', error);
        res.status(500).json({ error: 'Internal Server Error: ' + error.message });
    }
});

// API Route: Get all Registered Squads (for frontend and admin)
app.get('/api/squads', async (req, res) => {
    try {
        await connectDB();
        const squads = await Registration.find().sort({ createdAt: -1 });
        res.status(200).json(squads);
    } catch (error) {
        console.error('Error fetching squads:', error);
        res.status(500).json({ error: 'Internal Server Error: ' + error.message });
    }
});

// API Route: Delete a Registration (for admin panel)
app.delete('/api/register/:id', async (req, res) => {
    try {
        await connectDB();
        await Registration.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Registration deleted successfully!' });
    } catch (error) {
        console.error('Error deleting registration:', error);
        res.status(500).json({ error: 'Internal Server Error: ' + error.message });
    }
});

// API Route: Delete all Registrations (for clear all functionality)
app.delete('/api/register', async (req, res) => {
    try {
        await connectDB();
        await Registration.deleteMany({});
        res.status(200).json({ message: 'All registrations cleared!' });
    } catch (error) {
        console.error('Error clearing registrations:', error);
        res.status(500).json({ error: 'Internal Server Error: ' + error.message });
    }
});

// Create a basic default route
app.get('/', (req, res) => {
    res.send('Esports Registration API is Running! 🚀');
});

// Export the app for Vercel Serverless Function
module.exports = app;
