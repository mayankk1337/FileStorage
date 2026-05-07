const express = require('express');
const mongoose = require('mongoose');
const UploadRoute = require('./routes/fileRoutes');
const path = require('path');
require('dotenv').config();
const app = express();
app.use('/uploads', express.static('uploads'));


app.use(express.json());
app.use("uploads", express.static("uploads"));
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


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});