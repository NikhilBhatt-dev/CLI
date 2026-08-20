import ApiError from "../utils/ApiError.js";

const normalizeRole = (role) => String(role || "").trim().toLowerCase();

const authorize = (...roles) => {
  const allowedRoles = roles.map(normalizeRole).filter(Boolean);

  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Not authorized"));
    }

    if (!allowedRoles.length) {
      return next();
    }

    const userRole = normalizeRole(req.user.role);

    if (!allowedRoles.includes(userRole)) {
      return next(new ApiError(403, "You are not authorized to access this resource."));
    }

    return next();
  };
};

export default authorize;
