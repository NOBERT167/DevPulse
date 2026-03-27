const { getAuth } = require("@clerk/express");

// Require any authenticated user
function requireAuth(req, res, next) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = userId;
  next();
}

// Require admin role (checks Clerk publicMetadata.role === "admin")
function requireAdmin(req, res, next) {
  const { userId, sessionClaims } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log(
    "Session claims for admin check:",
    JSON.stringify(sessionClaims, null, 2),
  );

  // Clerk exposes publicMetadata in different claim paths depending on config:
  // - Default JWT: sessionClaims.public_metadata
  // - Custom session token with {{user.public_metadata}}: sessionClaims.metadata
  const role =
    sessionClaims?.metadata?.role ||
    sessionClaims?.public_metadata?.role ||
    sessionClaims?.publicMetadata?.role;

  if (role !== "admin") {
    console.log(
      "Admin check failed. sessionClaims:",
      JSON.stringify(sessionClaims, null, 2),
    );
    return res.status(403).json({ error: "Forbidden: admin access required" });
  }
  req.userId = userId;
  next();
}

module.exports = { requireAuth, requireAdmin };
