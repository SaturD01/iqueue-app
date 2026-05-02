/**
 * @file requireRole.js
 * @description Role-based access control middleware — restricts routes to specific user roles
 * @author M1 — WDD Wickramaratne (22UG3-0550)
 * @created 2026-04-13
 */

const requireRole = (...roles) => {
  return (req, res, next) => {

    // verifyToken must run before this middleware to populate req.user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login first.'
      });
    }

    // Check if the user role matches any of the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required: ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

module.exports = requireRole;