const express = require('express');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs
const app = express();

app.use(morgan('common')); // Logs all requests using the 'common' format
app.use(express.static('public')); // Serve static files from "public"
app.use(express.json()); // Parse incoming JSON

// In-memory storage (for demo purposes)
let users = [];

// Default route (home page)
app.get('/', (req, res) => {
    res.send('Welcome to my Movie API! Browse my favorite movies at /movies');
});

// Movies route
app.get('/movies', (req, res) => {
    const topMovies = [
        { title: 'No Country for Old Men', year: 2007, genre: 'Contemporary Western' },
        { title: 'Apocalypse Now', year: 1979, genre: 'War/Drama' },
        { title: 'Amores perros', year: 2000, genre: 'Drama' },
        { title: 'Clockers', year: 1995, genre: 'Crime' },
        { title: 'The Big Lebowski', year: 1998, genre: 'Comedy' },
        { title: 'Trainspotting', year: 1996, genre: 'Dark Comedy/Drama' },
        { title: 'Inception', year: 2010, genre: 'Sci-Fi' },
        { title: 'Parasite', year: 2019, genre: 'Dark Comedy' },
        { title: 'Mirror', year: 1975, genre: 'Biography' },
        { title: 'Fracture', year: 2007, genre: 'Legal Thriller' }
    ];
    res.json(topMovies);
});

// USERS API ROUTES

// Register a new user
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuidv4();
        newUser.favorites = [];
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('User needs a name');
    }
});

// Update user info by username
app.put('/users/:username', (req, res) => {
    const { username } = req.params;
    const updatedInfo = req.body;

    const user = users.find(u => u.name === username);
    if (!user) {
        return res.status(404).send('User not found');
    }

    Object.assign(user, updatedInfo);
    res.json(user);
});

// Add a movie to user's favorites
app.post('/users/:username/movies/:movieId', (req, res) => {
    const { username, movieId } = req.params;
    const user = users.find(u => u.name === username);

    if (!user) {
        return res.status(404).send('User not found');
    }

    if (!user.favorites.includes(movieId)) {
        user.favorites.push(movieId);
    }

    res.status(200).send(`Movie ${movieId} added to ${username}'s favorites`);
});

// Remove a movie from user's favorites
app.delete('/users/:username/movies/:movieId', (req, res) => {
    const { username, movieId } = req.params;
    const user = users.find(u => u.name === username);

    if (!user) {
        return res.status(404).send('User not found');
    }

    user.favorites = user.favorites.filter(id => id !== movieId);
    res.status(200).send(`Movie ${movieId} removed from ${username}'s favorites`);
});

// Deregister user
app.delete('/users/:username', (req, res) => {
    const { username } = req.params;
    const index = users.findIndex(u => u.name === username);

    if (index === -1) {
        return res.status(404).send('User not found');
    }

    users.splice(index, 1);
    res.status(200).send(`User ${username} deregistered`);
});

// Test error route
app.get('/error', (req, res) => {
    throw new Error('This is a test error');
});

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error occurred:`);
    console.error(`Method: ${req.method}, URL: ${req.originalUrl}`);
    console.error(`Error: ${err.message}`);
    console.error(`Stack: ${err.stack}`);
    res.status(500).send('Something went wrong!');
});

// Port setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
