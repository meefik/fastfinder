import nconf from 'nconf';
import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../db/models/user.mjs';
import pptr from '../lib/pptr.mjs';
import logger from '../lib/logger.mjs';
import parserAutozone from '../parsers/autozone.mjs';
import parserOreillyauto from '../parsers/oreillyauto.mjs';
import parserAdvanceautoparts from '../parsers/advanceautoparts.mjs';

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

// Endpoint to run search
router.use('/search', isAuth, function (req, res, next) {
  const params = {
    vin: req.body.vin,
    zip: req.body.zip,
    partNumber: req.body.partNumber
  };
  Promise.all([
    pptr(parserAutozone, params).catch(err => logger.log({
      level: 'error',
      label: 'autozone',
      message: err.message
    })),
    pptr(parserOreillyauto, params).catch(err => logger.log({
      level: 'error',
      label: 'oreillyauto',
      message: err.message
    })),
    pptr(parserAdvanceautoparts, params).catch(err => logger.log({
      level: 'error',
      label: 'advanceautoparts',
      message: err.message
    }))
  ]).then(data => {
    const output = data.reduce((arr, item) => {
      if (Array.isArray(item)) arr.push(...item);
      return arr;
    }, []).map((item, index) => {
      item.id = index + 1;
      return item;
    });
    res.json(output);
  }).catch(err => {
    next(err);
  });
});

export default router;
