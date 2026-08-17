const Incident = require('../models/incident');
const { emitGlobalEvent } = require('../services/socketService');

exports.createIncident = async (req, res, next) => {
    try {
        const { latitude, longitude, message } = req.body;
        if (latitude === undefined || longitude === undefined || !message) {
            res.status(400);
            throw new Error("Missing transaction processing attributes: latitude, longitude, and message notes are mandatory.");
        }

        const incident = await Incident.create({
            reporterEmail: req.user.email,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            message: message.trim()
        });

        emitGlobalEvent('NEW_INCIDENT_DISPATCH_ALERT', incident);
        return res.status(201).json({ success: true, data: incident });
    } catch (error) {
        next(error);
    }
};

exports.getAllIncidents = async (req, res, next) => {
    try {
        const incidents = await Incident.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: incidents.length, data: incidents });
    } catch (error) {
        next(error);
    }
};

exports.updateIncidentStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!status || !['pending', 'dispatched', 'resolved'].includes(status)) {
            res.status(400);
            throw new Error("Invalid incident resolution state conversion requested.");
        }

        const incident = await Incident.findById(req.params.id);
        if (!incident) {
            res.status(404);
            throw new Error("Incident profile under requested ID could not be located.");
        }

        incident.status = status;
        await incident.save();

        emitGlobalEvent('INCIDENT_STATUS_STATE_UPDATED', incident);
        return res.status(200).json({ success: true, data: incident });
    } catch (error) {
        next(error);
    }
};