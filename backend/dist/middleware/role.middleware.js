export const requireRoles = (...allowedRoles) => (request, response, next) => {
    if (!request.auth || !allowedRoles.includes(request.auth.role)) {
        response.status(403).json({ error: "Rol no autorizado", code: "ROLE_FORBIDDEN" });
        return;
    }
    next();
};
//# sourceMappingURL=role.middleware.js.map