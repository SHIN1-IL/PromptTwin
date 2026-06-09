/**
 * JWT Authentication Middleware
 *
 * Validates Bearer tokens from the Authorization header using jsonwebtoken.
 *
 * Environment:
 *   Set JWT_SECRET in your .env file (or process environment) before starting the app.
 *   Example: JWT_SECRET=your_super_secret_key_here
 */

const jwt = require('jsonwebtoken');

const { JsonWebTokenError, TokenExpiredError } = jwt;

/**
 * Parses a Bearer token from the Authorization header.
 *
 * @param {string | undefined} authHeader - Raw Authorization header value.
 * @returns {string | null} Extracted JWT string, or null when missing/invalid format.
 */
function extractBearerToken(authHeader) {
	if (!authHeader || typeof authHeader !== 'string') {
		return null;
	}

	const [scheme, token] = authHeader.split(' ');

	if (scheme !== 'Bearer' || !token?.trim()) {
		return null;
	}

	return token.trim();
}

/**
 * Express middleware that verifies JWT Bearer tokens.
 *
 * On success, attaches the decoded payload to `req.user` and calls `next()`.
 * On failure, responds with HTTP 401 Unauthorized.
 *
 * @example
 * // app.js or routes/protected.js
 * const { authenticateToken } = require('./middlewares/authMiddleware');
 *
 * app.get('/api/protected', authenticateToken, (req, res) => {
 *   res.json(req.user);
 * });
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
async function authenticateToken(req, res, next) {
	const token = extractBearerToken(req.headers.authorization);

	if (!token) {
		res.status(401).json({ message: 'Authentication token required.' });
		return;
	}

	const secret = process.env.JWT_SECRET;
	if (!secret) {
		res.status(500).json({ message: 'JWT secret is not configured.' });
		return;
	}

	try {
		const decoded = jwt.verify(token, secret);
		req.user = decoded;
		next();
	} catch (error) {
		if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
			res.status(401).json({ message: 'Invalid or expired token.' });
			return;
		}

		next(error);
	}
}

module.exports = {
	authenticateToken,
};
