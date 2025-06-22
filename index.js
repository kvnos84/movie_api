require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// import “auth.js”
let auth = require('./auth')(app);

// ✅ Add Passport authentication
require('./passport');

// Import the models
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ TEST ROUTE
app.get('/', (req, res) => {
  res.send('API is working and connected to MongoDB!');
});

/* // ✅ Return a list of ALL movies (Protected)
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const allMovies = await Movies.find();
    res.json(allMovies);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
}); */

// 🚧 TEMPORARILY removed auth for Achievement 3 React integration
app.get('/movies', async (req, res) => {
  try {
    const allMovies = await Movies.find();
    res.json(allMovies);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});


// ✅ Return data about a single movie by title (Protected)
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

// ✅ Return data about a genre by name/title (Protected)
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

// ✅ Return data about a director by name (Protected)
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

// ✅ Allow new users to register (Public)
app.post('/users', async (req, res) => {
  try {
    const { Username, Password, Email, Birthday } = req.body;

    if (!Username || !Password || !Email) {
      return res.status(400).send("Username, Password, and Email are required.");
    }

    const existingUser = await Users.findOne({ Username });
    if (existingUser) {
      return res.status(400).send("User already exists.");
    }

    const newUser = new Users({
      Username,
      Password, // Ideally hash this in production
      Email,
      Birthday
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

// ✅ Update user info (Protected)
app.put('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { Username, Password, Email, Birthday } = req.body;
    const user = await Users.findOne({ Username: req.params.username });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    user.Username = Username || user.Username;
    user.Password = Password || user.Password;
    user.Email = Email || user.Email;
    user.Birthday = Birthday || user.Birthday;

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

// ✅ Add movie to favorites (Protected)
app.post('/users/:username/movies/:movieTitle', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await Users.findOne({ Username: req.params.username });
    const movie = await Movies.findOne({ Title: req.params.movieTitle });

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

// ✅ Remove movie from favorites (Protected)
app.delete('/users/:username/movies/:movieTitle', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await Users.findOne({ Username: req.params.username });
    const movie = await Movies.findOne({ Title: req.params.movieTitle });

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

// ✅ Deregister user (Protected)
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

// Start the server
app.listen(8080, () => {
  console.log('Server is running on port 8080');
});

// TEMP: Seed DB with initial movies if empty
(async () => {
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
})();