import nconf from 'nconf';
import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../db/models/user.mjs';
import catalogRouter from './catalog.mjs';
import searchRouter from './search.mjs';

const router = express.Router();

function isAuth (req, res, next) {
  if (!req.user) {
    res.status(401);
    next(new Error('Unauthorized'));
  } else {
    next();
  }
}

passport.serializeUser(function (data, done) {
  done(null, data);
});

passport.deserializeUser(function (data, done) {
  done(null, data);
});

// Plain username and password
passport.use(
  'local',
  new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  }, async function (req, username, password, done) {
    try {
      const user = await User.logIn({
        username,
        password,
        ipaddress: req.ip,
        useragent: req.get('user-agent')
      });
      if (!user) return done(null, false);
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  })
);

// JWT session
passport.use(
  'session',
  new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromExtractors([
      // eslint-disable-next-line new-cap
      new ExtractJwt.fromAuthHeaderAsBearerToken(),
      // eslint-disable-next-line new-cap
      new ExtractJwt.fromUrlQueryParameter('token')
    ]),
    secretOrKey: nconf.get('session:key')
  }, function (payload, done) {
    done(null, payload);
  })
);

router.use(passport.initialize());

// JWT authentication
router.use(function (req, res, next) {
  passport.authenticate('session', { session: false }, function (err, payload) {
    if (err || !payload) return next(err);
    req.user = payload;
    next();
  })(req, res, next);
});

// Get user data from session
router.get('/state', isAuth, function (req, res, next) {
  const { token } = User.getToken(req.user);
  res.json({ user: req.user, token });
});

// Log in
router.post('/login',
  passport.authenticate('local', { session: false }),
  function (req, res) {
    const { token } = User.getToken(req.user);
    res.json({ user: req.user, token });
  });

// Endpoint for catalog
router.use('/catalog', isAuth, catalogRouter);

// Endpoint to run search
router.use('/search', isAuth, searchRouter);

export default router;
