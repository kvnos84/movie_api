const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Import the models
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/movieDB');

// ✅ TEST ROUTE
app.get('/', (req, res) => {
  res.send('API is working and connected to MongoDB!');
});

// ✅ Return a list of ALL movies
app.get('/movies', async (req, res) => {
  try {
    const allMovies = await Movies.find();
    res.json(allMovies); // Returns the list of all movies
  } catch (err) {
    res.status(500).send('Error: ' + err.message); // Handles any errors
  }
});

// ✅ Return data about a single movie by title
app.get('/movies/:title', async (req, res) => {
  try {
    const movie = await Movies.findOne({ Title: req.params.title }); // Find movie by title
    if (movie) {
      res.json(movie); // Returns movie data if found
    } else {
      res.status(404).send("Movie not found."); // Error message if movie not found
    }
  } catch (err) {
    res.status(500).send("Error: " + err.message); // Handle error
  }
});

// ✅ Return data about a genre (description) by name/title
app.get('/genres/:name', async (req, res) => {
  try {
    const movie = await Movies.findOne({ "Genre.Name": req.params.name }); // Find movie with the genre name
    if (movie) {
      res.json(movie.Genre); // Returns genre description if found
    } else {
      res.status(404).send("Genre not found."); // Error message if genre not found
    }
  } catch (err) {
    res.status(500).send("Error: " + err.message); // Handles any errors
  }
});

// ✅ Return data about a director (bio, birth year, death year) by name
app.get('/directors/:name', async (req, res) => {
  try {
    const movie = await Movies.findOne({ "Director.Name": req.params.name }); // Find movie by director name
    if (movie) {
      res.json(movie.Director); // Returns the director's bio and info if found
    } else {
      res.status(404).send("Director not found."); // Error message if director not found
    }
  } catch (err) {
    res.status(500).send("Error: " + err.message); // Handles any errors
  }
});

// ✅ Allow new users to register
app.post('/users', async (req, res) => {
  try {
    const { Username, Password, Email, Birthday } = req.body; // Extract data from request body

    if (!Username || !Password || !Email) {
      return res.status(400).send("Username, Password, and Email are required."); // Validations
    }

    const existingUser = await Users.findOne({ Username });
    if (existingUser) {
      return res.status(400).send("User already exists.");
    }

    const newUser = new Users({
      Username,
      Password, // In a real application, don't store plaintext passwords (use hashing)
      Email,
      Birthday
    });

    await newUser.save(); // Save user to the database
    res.status(201).json(newUser); // Return created user
  } catch (err) {
    res.status(500).send("Error: " + err.message); // Handles any errors
  }
});

// ✅ Allow users to update their user info (username, password, email, date of birth)
app.put('/users/:username', async (req, res) => {
  try {
    const { Username, Password, Email, Birthday } = req.body; // Extract data from request body
    const user = await Users.findOne({ Username: req.params.username });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Update the user's details
    user.Username = Username || user.Username;
    user.Password = Password || user.Password;
    user.Email = Email || user.Email;
    user.Birthday = Birthday || user.Birthday;

    await user.save(); // Save updated user
    res.status(200).json(user); // Return updated user
  } catch (err) {
    res.status(500).send("Error: " + err.message); // Handles any errors
  }
});

// ✅ Allow users to add a movie to their list of favorites
app.post('/users/:username/movies/:movieTitle', async (req, res) => {
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
    await user.save(); // Save updated user
    res.status(200).json(user); // Return updated user with favorite movies
  } catch (err) {
    res.status(500).send("Error: " + err.message); // Handles any errors
  }
});

// ✅ Allow users to remove a movie from their list of favorites
app.delete('/users/:username/movies/:movieTitle', async (req, res) => {
  try {
    const user = await Users.findOne({ Username: req.params.username });
    const movie = await Movies.findOne({ Title: req.params.movieTitle });

    if (!user || !movie) {
      return res.status(404).send("User or Movie not found.");
    }

    user.FavoriteMovies = user.FavoriteMovies.filter(fav => !fav.equals(movie._id));
    await user.save(); // Save updated user
    res.status(200).json(user); // Return updated user with favorite movies
  } catch (err) {
    res.status(500).send("Error: " + err.message); // Handles any errors
  }
});

// ✅ Allow existing users to deregister
app.delete('/users/:username', async (req, res) => {
  try {
    const user = await Users.findOneAndDelete({ Username: req.params.username });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    res.status(200).send("User deregistered.");
  } catch (err) {
    res.status(500).send("Error: " + err.message); // Handles any errors
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
