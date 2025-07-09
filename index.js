/**
 * @file Main server file for the myFlix API.
 * Sets up Express server, connects to MongoDB, and defines all routes.
 */

require('dotenv').config(); // Load env variables first

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const { check, validationResult } = require('express-validator');

const app = express(); // ✅ Declare after express is required

// ✅ FINAL CORS CONFIGURATION
const allowedOrigins = [
  'http://localhost:1234',
  'https://kvnflix.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    console.log('Request origin:', origin);
    if (!origin) return callback(null, true); // allow requests with no origin (e.g., Postman)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS error: ' + origin + ' not allowed'), false);
    }
  },
  optionsSuccessStatus: 200
}));

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Import authentication logic
 */
let auth = require('./auth')(app);

// Set up Passport authentication strategies
require('./passport');

// Import Mongoose models
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

// Connect to MongoDB (fallback to local if env var not set)
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movieDB';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once('open', () => {
  console.log('✅ Connected to MongoDB');
});

mongoose.connection.on('error', err => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Log current environment
console.log(`App running in ${process.env.NODE_ENV || 'development'} mode`);

/**
 * Root route to confirm server is running
 */
app.get('/', (req, res) => {
  res.send('API is working and connected to MongoDB!');
});

/**
 * Get all movies
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const allMovies = await Movies.find();
    res.json(allMovies);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

/**
 * Get a movie by title
 */
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movie = await Movies.findOne({ Title: req.params.title });
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).send("Movie not found.");
    }
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

/**
 * Get genre info by name
 */
app.get('/genres/:name', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movie = await Movies.findOne({ "Genre.Name": req.params.name });
    if (movie) {
      res.json(movie.Genre);
    } else {
      res.status(404).send("Genre not found.");
    }
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

/**
 * Get director info by name
 */
app.get('/directors/:name', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movie = await Movies.findOne({ "Director.Name": req.params.name });
    if (movie) {
      res.json(movie.Director);
    } else {
      res.status(404).send("Director not found.");
    }
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

/**
 * Register a new user
 */
app.post('/users',
  [
    check('Username', 'Username is required').notEmpty(),
    check('Username', 'Username must be at least 5 characters long').isLength({ min: 5 }),
    check('Username', 'Username must be alphanumeric').isAlphanumeric(),
    check('Password', 'Password is required').notEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { Username, Password, Email, Birthday } = req.body;

    try {
      const existingUser = await Users.findOne({ Username });
      if (existingUser) {
        return res.status(400).send("User already exists.");
      }

      const newUser = new Users({
        Username,
        Password: Users.hashPassword(Password),
        Email,
        Birthday
      });

      await newUser.save();
      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).send("Error: " + err.message);
    }
  }
);

/**
 * Update user info
 */
app.put('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { Username, Password, Email, Birthday } = req.body;
    const user = await Users.findOne({ Username: req.params.username });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    user.Username = Username || user.Username;
    user.Password = Password ? Users.hashPassword(Password) : user.Password;
    user.Email = Email || user.Email;
    user.Birthday = Birthday || user.Birthday;

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

/**
 * Add movie to user's favorites (using movieId)
 */
app.post('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await Users.findOne({ Username: req.params.username });
    const movie = await Movies.findById(req.params.movieId);

    if (!user || !movie) {
      return res.status(404).send("User or Movie not found.");
    }

    if (user.FavoriteMovies.includes(movie._id)) {
      return res.status(400).send("Movie already in favorites.");
    }

    user.FavoriteMovies.push(movie._id);
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

/**
 * Remove movie from user's favorites (using movieId)
 */
app.delete('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await Users.findOne({ Username: req.params.username });
    const movie = await Movies.findById(req.params.movieId);

    if (!user || !movie) {
      return res.status(404).send("User or Movie not found.");
    }

    user.FavoriteMovies = user.FavoriteMovies.filter(fav => !fav.equals(movie._id));
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

/**
 * Deregister user
 */
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await Users.findOneAndDelete({ Username: req.params.username });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    res.status(200).send("User deregistered.");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

/**
 * Start the Express server
 */
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

/**
 * Seed initial movies if the DB is empty (only in non-production)
 */
(async () => {
  if (process.env.NODE_ENV !== 'production') {
    const movieCount = await Movies.countDocuments();
    if (movieCount === 0) {
      await Movies.insertMany([
        {
          Title: "The Fountain",
          Description: "...",
          Genre: { Name: "Drama", Description: "A drama is a genre of narrative fiction..." },
          Director: { Name: "Darren Aronofsky", Bio: "Darren Aronofsky is an American filmmaker..." },
          Actors: ["Hugh Jackman", "Rachel Weisz"],
          ImagePath: "...",
          Featured: false
        },
        {
          Title: "The Brutalist",
          Description: "...",
          Genre: { Name: "Drama", Description: "A drama is a genre of narrative fiction..." },
          Director: { Name: "Brady Corbet", Bio: "Brady Corbet is a director and actor..." },
          Actors: ["Joel Edgerton", "Marion Cotillard"],
          ImagePath: "...",
          Featured: false
        },
        {
          Title: "A Real Pain",
          Description: "...",
          Genre: { Name: "Drama", Description: "A drama is a genre of narrative fiction..." },
          Director: { Name: "Jesse Eisenberg", Bio: "Jesse Eisenberg is a movie actor..." },
          Actors: ["Jesse Eisenberg", "Kieran Culkin"],
          ImagePath: "...",
          Featured: false
        }
      ]);
      console.log("Database seeded with initial movies.");
    }
  }
})();

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
