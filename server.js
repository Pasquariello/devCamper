const express = require('express');
const dotenv = require('dotenv');

//Load env vars
dotenv.config({path: './config/config.env'});

// initialize app with express
const app = express();

// set port variable and fallback
const PORT = process.env.PORT || 5000;

// run on port 5000 with callback to to console log welcom message
app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} on port: ${PORT}`)
);