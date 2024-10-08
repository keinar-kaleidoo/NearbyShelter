const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Get token from Authorization header
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

  // Check if token exists
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // Add admin info to request object
    next(); // Proceed to next middleware or route
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
