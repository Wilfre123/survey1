const os = require('os');
const fs = require('fs');
const http = require('http');

// Function to get the IPv4 address
function getIPv4Address() {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    for (const address of networkInterfaces[interfaceName]) {
      if (address.family === 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }
  return 'No IPv4 address found';
}

// Set up server port
const port = 2000;

// Get the IPv4 address
const ipv4Address = getIPv4Address();

// Generate the HTML content with a placeholder for the IPv4 address
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IPv4 Address</title>
</head>
<body>
   
    <p id="ipv4-address">Loading IPv4 address...</p>
    
    <script>
        // JavaScript to dynamically insert the IPv4 address into the element with the id "ipv4-address"
        const ipv4Address = '${ipv4Address}';
        document.getElementById('ipv4-address').textContent = ipv4Address;
    </script>
</body>
</html>
`;

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(htmlContent);
});

// Start the server
server.listen(port, () => {
  console.log(`Node.js server is running on port ${port}`);
  console.log("IPv4 Address HTML file generated: index.html");

  // Write the content to index.html file
  fs.writeFileSync('index.html', htmlContent, 'utf-8');
});
