// bring in mongoose
const mongoose = require('mongoose');

const connectDB = async () => {
    // create a connection based on URI connection string
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected to Host:  ${conn.connection.host}`.cyan.underline.bold)
}

module.exports = connectDB;