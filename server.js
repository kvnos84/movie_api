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

// === UPDATED USER ROUTES ===

// Register a new user
app.post('/users', (req, res) => {
  if (!req.body.name) {
    return res.status(400).send("Name is required to register.");
  }

  const newUser = {
    id: uuid.v4(),
    name: req.body.name,
    favoriteMovies: []
  };

  const userExists = users.find(u => u.name.toLowerCase() === newUser.name.toLowerCase());

  if (userExists) {
    return res.status(400).send("User already exists.");
  }

  users.push(newUser);
  res.status(201).json(newUser);
});

// Update user info by username
app.put('/users/:username', (req, res) => {
  const user = users.find(u => u.name.toLowerCase() === req.params.username.toLowerCase());

  if (!user) {
    return res.status(404).send("User not found.");
  }

  user.name = req.body.name || user.name;
  res.status(200).json(user);
});

// Add a movie to user's favorites
app.post('/users/:username/movies/:movieTitle', (req, res) => {
  const user = users.find(u => u.name === req.params.username);
  const movieTitle = req.params.movieTitle;

  if (!user) {
    return res.status(404).send("User not found.");
  }

  const movie = movies.find(m => m.Title === movieTitle);

  if (!movie) {
    return res.status(404).send("Movie not found.");
  }

  if (!user.favoriteMovies.includes(movieTitle)) {
    user.favoriteMovies.push(movieTitle);
  }

  res.status(200).json(user);
});

// Remove a movie from user's favorites
app.delete('/users/:username/movies/:movieTitle', (req, res) => {
  const user = users.find(u => u.name === req.params.username);
  const movieTitle = req.params.movieTitle;

  if (!user) {
    return res.status(404).send("User not found.");
  }

  user.favoriteMovies = user.favoriteMovies.filter(m => m !== movieTitle);

  res.status(200).json(user);
});

// Deregister user
app.delete('/users/:username', (req, res) => {
  const userIndex = users.findIndex(u => u.name === req.params.username);

  if (userIndex === -1) {
    return res.status(404).send("User not found.");
  }

  users.splice(userIndex, 1);
  res.status(200).send("User deregistered.");
});

// Start server
app.listen(8080, () => console.log("Listening on port 8080"));
