/**
 * @file Handles user login and JWT token generation.
 */

const jwtSecret = 'your_jwt_secret'; // This must match the secret used in passport.js

const jwt = require('jsonwebtoken');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const Models = require('./models.js');
const Users = Models.User;

require('./passport'); // Initialize JWT strategy

/**
 * Define LocalStrategy for username/password login with hashed password check
 */
passport.use(new LocalStrategy(
  { usernameField: 'Username', passwordField: 'Password' },
  async (username, password, done) => {
    console.log('Looking for user:', username);
    try {
      const user = await Users.findOne({ Username: username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      if (!user.validatePassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

/**
 * Generates a signed JSON Web Token (JWT) for the given user.
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: '7d',
    algorithm: 'HS256'
  });
};

/**
 * @function
 * @name /login
 * @description Handles user login using Passport local strategy and returns a signed JWT on success.
 */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }

      req.login(user, { session: false }, (error) => {
        if (error) {
          return res.send(error);
        }

        let token = generateJWTToken(user.toJSON());
          const safeUser = {
            _id: user._id,
            Username: user.Username,
            Email: user.Email,
            Birthday: user.Birthday,
            FavoriteMovies: user.FavoriteMovies
          };

          return res.json({ user: safeUser, token });
      });
    })(req, res);
  });
};