const express = require('express');
const mongoose = require('mongoose');
const UploadRoute = require('./routes/fileRoutes');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const app = express();

//Cors configuration

const cors = require('cors');
const corsOptions = {
    origin: 'https://filestoragefrontend.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api", UploadRoute);

app.get('/', (req, res) => {
    res.send('API is working!');
});

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});