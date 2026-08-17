// config/db.js
const mongoose = require('mongoose');
// Import Node's core network DNS resolution engine
const dns = require('dns');

const connectDB = async () => {
    try {
        // Fix for Node on Windows 11: Force public fallback DNS for cluster SRV tracking
        dns.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8']);
        
        const connectionOptions = {
            autoIndex: true,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4 // Restricts tracking strictly over verified IPv4 loops
        };

        const conn = await mongoose.connect(process.env.MONGO_URI, connectionOptions);
        console.log(`>>> MONGODB CONNECTED: ${conn.connection.host} <<<`);
    } catch (error) {
        console.error(`!!! DATABASE CONNECTION ERROR: ${error.message} !!!`);
        process.exit(1);
    }
};

module.exports = connectDB;
