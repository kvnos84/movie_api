/**
 * @file Defines Mongoose models for Movie and User collections.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * @typedef {Object} Genre
 * @property {String} Name - The name of the genre (e.g., "Drama", "Action")
 * @property {String} Description - Description of the genre
 */

/**
 * @typedef {Object} Director
 * @property {String} Name - The director's full name
 * @property {String} Bio - A brief biography of the director
 */

/**
 * @typedef {Object} Movie
 * @property {String} Title - Title of the movie
 * @property {String} Description - Brief summary of the movie
 * @property {Genre} Genre - Genre of the movie
 * @property {Director} Director - Director of the movie
 * @property {Array<String>} Actors - List of main actors
 * @property {String} ImagePath - URL or path to the movie poster
 * @property {Boolean} Featured - Flag to mark featured movies
 */
const movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean
});

/**
 * @typedef {Object} User
 * @property {String} Username - The user's chosen username
 * @property {String} Password - The user's password (should be hashed in production)
 * @property {String} Email - The user's email address
 * @property {Date} [Birthday] - Optional birthday of the user
 * @property {Array<ObjectId>} FavoriteMovies - List of Movie ObjectIds the user has favorited
 */
const userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

// Add password hashing and validation methods BEFORE model creation
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};

// Create models
const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);

// Export models
module.exports.Movie = Movie;
module.exports.User = User;