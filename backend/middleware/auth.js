const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    // Expecting "Bearer <token>"
    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2) return res.status(401).json({ message: 'Invalid token format' });

    jwt.verify(tokenParts[1], process.env.JWT_SECRET || 'supersecret_jwt_key_job_portal_2026', (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized, token failed' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

exports.isHR = (req, res, next) => {
    if (req.userRole !== 'hr') {
        return res.status(403).json({ message: 'Requires HR role!' });
    }
    next();
};

exports.isSeeker = (req, res, next) => {
    if (req.userRole !== 'seeker') {
        return res.status(403).json({ message: 'Requires Seeker role!' });
    }
    next();
};
