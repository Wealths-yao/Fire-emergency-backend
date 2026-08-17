// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ success: false, error: "Access Denied: Missing Authorization tracking credentials." });
    }

    const tokenParts = authHeader.split(' ');
    // FIX: Properly check if 'Bearer' prefix exists and the literal token string is present
    if (tokenParts[0] !== 'Bearer' || !tokenParts[1]) {
        return res.status(400).json({ success: false, error: "Access Denied: Token string format is invalid." });
    }

    const literalToken = tokenParts[1]; // FIX: Extract the actual encrypted string token element

    jwt.verify(literalToken, process.env.JWT_SECRET, (err, decodedPayload) => {
        if (err) {
            return res.status(401).json({ success: false, error: "Unauthorized: Access validation token check failed." });
        }
        req.user = decodedPayload;
        next();
    });
};

const authorizeRoles = (...permittedRoles) => {
    return (req, res, next) => {
        if (!req.user || !permittedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                error: `Forbidden access: Action requires one of these validation privileges: [${permittedRoles.join(', ')}]` 
            });
        }
        next();
    };
};

module.exports = { authenticateToken, authorizeRoles };