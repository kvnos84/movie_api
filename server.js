const http = require('http'); // Import the built-in HTTP module
const fs = require('fs'); // Import the built-in FS (File System) 
module
const url = require('url'); // Import the built-in URL module

// Create the HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true); // Parse the request 
URL

    // Log the request URL and timestamp to log.txt
    const logMessage = `Request URL: ${req.url}, Time: ${new 
Date().toISOString()}\n`;
    fs.appendFile('log.txt', logMessage, (err) => {
        if (err) throw err;
    });

    // Serve documentation.html if the URL contains "documentation"
    if (parsedUrl.pathname === '/documentation') {
        fs.readFile('documentation.html', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading documentation.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    }
    // Otherwise, serve index.html
    else {
        fs.readFile('index.html', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    }
});

// Make the server listen on port 8080
server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080/');
});
const 
http 
= require('http'); // Import the built-in HTTP module

// Create an HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' }); // Set response 
header
    res.end('Hello, this is your Movie API server!\n'); // Send response 
text
});

// Make the server listen on port 8080
server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080/');
});

