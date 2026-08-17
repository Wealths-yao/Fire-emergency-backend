const express = require('express');
const router = express.Router();
const { createIncident, getAllIncidents, updateIncidentStatus } = require('../controllers/incidentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, authorizeRoles('user', 'admin'), createIncident);
router.get('/', authenticateToken, authorizeRoles('fire_team', 'admin'), getAllIncidents);
router.patch('/:id', authenticateToken, authorizeRoles('fire_team', 'admin'), updateIncidentStatus);

module.exports = router;