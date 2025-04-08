const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

app.use(bodyParser.json());

let users = [
  {
    id: 1,
    name: "Kim",
    favoriteMovies: []
  },
  {
    id: 2,
    name: "Joe",
    favoriteMovies: ["The Fountain"]
  },
];

let movies = [
  {
    "Title": "The Fountain",
    "Description": "...",
    "Genre": {
      "Name": "Drama",
      "Description": "A drama is a genre of narrative fiction..."
    },
    "Director": {
      "Name": "Darren Aronofsky",
      "Bio": "Darren Aronofsky is an American filmmaker..."
    },
    "ImageURL": "...",
    "Featured": false
  },
  {
    "Title": "The Brutalist",
    "Description": "...",
    "Genre": {
      "Name": "Drama",
      "Description": "A drama is a genre of narrative fiction..."
    },
    "Director": {
      "Name": "Brady Corbet",
      "Bio": "Brady Corbet is a director and actor..."
    },
    "ImageURL": "...",
    "Featured": false
  },
  {
    "Title": "A Real Pain",
    "Description": "...",
    "Genre": {
      "Name": "Drama",
      "Description": "A drama is a genre of narrative fiction..."
    },
    "Director": {
      "Name": "Jesse Eisenberg",
      "Bio": "Jesse Eisenberg is a movie actor..."
    },
    "ImageURL": "...",
    "Featured": false
  },
];

// === ROUTES ===

// Return all movies
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

// Return single movie by title
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find(movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("This movie has not been made yet... maybe this is a sign for you to make it!");
  }
});

// Return genre by name
app.get('/genres/:name', (req, res) => {
  const genreName = req.params.name;
  const movie = movies.find(movie => movie.Genre.Name.toLowerCase() === genreName.toLowerCase());

  if (movie) {
    res.status(200).json(movie.Genre);
  } else {
    res.status(400).send("Genre not found.");
  }
});

// Return director by name
app.get('/directors/:name', (req, res) => {
  const directorName = req.params.name;
  const movie = movies.find(movie => movie.Director.Name.toLowerCase() === directorName.toLowerCase());

  if (movie) {
    res.status(200).json(movie.Director);
  } else {
    res.status(400).send("Director not found.");
  }
});

// Register a new user
app.post('/users', (req, res) => {
  res.send('POST request to register a new user');
});

// Update user info by username
app.put('/users/:username', (req, res) => {
  res.send(`PUT request to update user info for: ${req.params.username}`);
});

// Add a movie to user's favorites
app.post('/users/:username/movies/:movieID', (req, res) => {
  res.send(`POST request to add movie ${req.params.movieID} to ${req.params.username}'s favorites`);
});

// Remove a movie from user's favorites
app.delete('/users/:username/movies/:movieID', (req, res) => {
  res.send(`DELETE request to remove movie ${req.params.movieID} from ${req.params.username}'s favorites`);
});

// Deregister user
app.delete('/users/:username', (req, res) => {
  res.send(`DELETE request to deregister user: ${req.params.username}`);
});

// Start server
app.listen(8080, () => console.log("Listening on port 8080"));
