import express from 'express';
import authRouter from './auth.mjs';
import catalogRouter from './catalog.mjs';
import searchRouter from './search.mjs';
import usersRouter from './users.mjs';
import logsRouter from './logs.mjs';
import csvRouter from './csv.mjs';

const router = express.Router();

/**
 * Check the permissions for the role.
 *
 * @param {string[]} roles
 * @param {Object} req
 * @param {Object} res
 * @param {function} next
 */
function isAuth (roles, req, res, next) {
  if (arguments.length <= 1) {
    return isAuth.bind(this, roles);
  }
  if (req.user) {
    if (roles && !~roles.indexOf(req.user.role)) {
      res.status(403);
      next(new Error('Access denied'));
    } else {
      next();
    }
  } else {
    res.status(401);
    next(new Error('Unauthorized'));
  }
}

// Endpoint for authorization
router.use('/', authRouter);

// Endpoint for catalog
router.use('/catalog', isAuth(['user', 'admin']), catalogRouter);

// Endpoint to run search
router.use('/search', isAuth(['user', 'admin']), searchRouter);

// Endpoint for user administration
router.use('/users', isAuth(['admin']), usersRouter);

// Endpoint for log administration
router.use('/logs', isAuth(['admin']), logsRouter);

// Endpoint for csv export
router.use('/csv', isAuth(['admin']), csvRouter);

export default router;
