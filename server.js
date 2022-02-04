const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const logger = require('./middleware/logger')
//Load env vars
dotenv.config({path: './config/config.env'});

//Connect to DB
connectDB();

// Route files
const bootcamps = require('./routes/bootcamps');

// initialize app with express
const app = express();

// Body parser
app.use(express.json());

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);

//Middleware
//dev logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// this middleware must be after mounted routes
app.use(errorHandler);


// set port variable and fallback
const PORT = process.env.PORT || 5000;

// run on port 5000 with callback to to console log welcom message
const server = app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} on port: ${PORT}`.rainbow.bold)
);

// Handle unhandled promis rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server & Exit process
    // 1 allows to close with failure
    server.close(() => process.exit(1));
})