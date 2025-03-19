const http = require('http'); // Import HTTP module
const fs = require('fs'); // Import File System module

// Create the HTTP server
const server = http.createServer((req, res) => {
    // Log the request URL and timestamp to log.txt
    const logMessage = `Request URL: ${req.url}, Time: ${new Date().toISOString()}\n`;
    fs.appendFile('log.txt', logMessage, (err) => {
        if (err) throw err;
    });

    // Serve documentation.html if the URL is "/documentation"
    if (req.url === '/documentation') {
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
