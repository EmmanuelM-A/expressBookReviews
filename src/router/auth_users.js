const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if username is valid (exists in users array)
const isValid = (username) => {
    // Check if any user has the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if a user with the same username is found, otherwise false
    return userswithsamename.length > 0;
}

// Function to check if username and password match the records
const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    return validusers.length > 0;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    console.log(username);

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.session.authorization.username;

    // Check if book exists
    if (books[isbn]) {
        // Add or update the review
        books[isbn].reviews[username] = review;
        return res.status(200).json({ 
            message: "Review successfully added/updated",
            book: books[isbn]
        });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    // Check if book exists
    if (books[isbn]) {
        // Check if user has a review for this book
        if (books[isbn].reviews[username]) {
            delete books[isbn].reviews[username];
            return res.status(200).json({ 
                message: "Review successfully deleted",
                book: books[isbn]
            });
        } else {
            return res.status(404).json({ message: "Review not found for this user" });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;