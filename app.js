const express = require('express');
const morgan = require('morgan');
const app = express();

// Use Morgan for logging HTTP requests
app.use(morgan('common')); // Logs all requests using the 'common' format

// Serve static files from the "public" directory
app.use(express.static('public'));

// Default route (home page)
app.get('/', (req, res) => {
    res.send('Welcome to my Movie API! Browse my favorite movies at /movies');
});

// Define the route for '/movies'
app.get('/movies', (req, res) => {
    // My top 10 movies data
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

    // Send the topMovies array as JSON
    res.json(topMovies);
});

// **TEST ERROR ROUTE** - Add this route here for testing errors
app.get('/error', (req, res) => {
    throw new Error('This is a test error');
});

// Error-handling middleware for logging application-level errors
app.use((err, req, res, next) => {
    // Log error details including method, URL, and error message
    console.error(`[${new Date().toISOString()}] Error occurred:`);
    console.error(`Method: ${req.method}, URL: ${req.originalUrl}`);
    console.error(`Error: ${err.message}`);
    console.error(`Stack: ${err.stack}`);

    // Send a generic error message to the client
    res.status(500).send('Something went wrong!');
});

// Set the port the app will listen on
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
