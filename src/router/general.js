const express = require('express');
const axios = require('axios'); // For async operations
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// User registration endpoint
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop - Using async/await
public_users.get('/', async function (req, res) {
    try {
        // Simulate async operation - in real scenario this might be a database call
        const getAllBooks = () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(books);
                }, 100);
            });
        };
        
        const allBooks = await getAllBooks();
        res.send(JSON.stringify(allBooks, null, 4));
    } catch (error) {
        return res.status(500).json({message: "Error fetching books", error: error.message});
    }
});

// Get book details based on ISBN - Using Promises
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    
    // Create a Promise to simulate async operation
    const getBookByISBN = (isbn) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const book = books[isbn];
                if (book) {
                    resolve(book);
                } else {
                    reject(new Error("Book not found"));
                }
            }, 100);
        });
    };

    getBookByISBN(isbn)
        .then(book => {
            res.send(JSON.stringify(book, null, 4));
        })
        .catch(error => {
            return res.status(404).json({message: "Book not found"});
        });
});
  
// Get book details based on author - Using Promises
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    
    const getBooksByAuthor = (author) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const booksByAuthor = [];
                for (let key in books) {
                    if (books[key].author.toLowerCase() === author.toLowerCase()) {
                        booksByAuthor.push({
                            isbn: key,
                            title: books[key].title,
                            author: books[key].author,
                            reviews: books[key].reviews
                        });
                    }
                }
                if (booksByAuthor.length > 0) {
                    resolve(booksByAuthor);
                } else {
                    reject(new Error("No books found by this author"));
                }
            }, 100);
        });
    };

    getBooksByAuthor(author)
        .then(bookList => {
            res.send(JSON.stringify(bookList, null, 4));
        })
        .catch(error => {
            return res.status(404).json({message: "No books found by this author"});
        });
});

// Get all books based on title - Using Promises
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    
    const getBooksByTitle = (title) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const booksByTitle = [];
                for (let key in books) {
                    if (books[key].title.toLowerCase().includes(title.toLowerCase())) {
                        booksByTitle.push({
                            isbn: key,
                            title: books[key].title,
                            author: books[key].author,
                            reviews: books[key].reviews
                        });
                    }
                }
                if (booksByTitle.length > 0) {
                    resolve(booksByTitle);
                } else {
                    reject(new Error("No books found with this title"));
                }
            }, 100);
        });
    };

    getBooksByTitle(title)
        .then(bookList => {
            res.send(JSON.stringify(bookList, null, 4));
        })
        .catch(error => {
            return res.status(404).json({message: "No books found with this title"});
        });
});

// Get book review - Using async/await
public_users.get('/review/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    
    try {
        const getBookReviews = (isbn) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const book = books[isbn];
                    if (book) {
                        resolve(book.reviews);
                    } else {
                        reject(new Error("Book not found"));
                    }
                }, 100);
            });
        };
        
        const reviews = await getBookReviews(isbn);
        res.send(JSON.stringify(reviews, null, 4));
    } catch (error) {
        return res.status(404).json({message: "Book not found"});
    }
});

module.exports.general = public_users;