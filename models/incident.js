const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
    reporterEmail: { 
        type: String, 
        required: true 
    },
    latitude: { 
        type: Number, 
        required: [true, 'Latitude coordinate index required.'] 
    },
    longitude: { 
        type: Number, 
        required: [true, 'Longitude coordinate index required.'] 
    },
    message: { 
        type: String, 
        required: [true, 'Descriptive text details of the emergency are required.'] 
    },
    status: { 
        type: String, 
        enum: ['pending', 'dispatched', 'resolved'], 
        default: 'pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Incident', IncidentSchema);