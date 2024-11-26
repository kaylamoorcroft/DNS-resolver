# Project Overview
This is a custom DNS resolver built in Node.js for educational purposes. It constructs DNS query packets, sends them to a DNS server, and parses the responses to resolve domain names into IP addresses. A simple web interface is included to make the program user-friendly.

# Features
- Resolves domain names to IP addresses using UDP.
- Custom packet construction and parsing.
- Frontend interface to input domain names and display results.
- Error handling

# Getting Started
1. Prerequisites:  
- Node.js installed.
2. Installation:  
`npm install`
3. Running the App:  
`npm start`

# Usage
- Open the browser and navigate to http://localhost:3000.
- Input a domain name (e.g., www.example.com) and click "Resolve domain"
- The resolved domain name will appear. Or if an error occurs, you will see an error message instead.
- Console logs in the terminal will provide DNS resolution details such as the DNS query and response packets.

# Project Structure
```
project-root/  
├── public/  
│   ├── style.css       # Frontend styles  
│   ├── script.js       # Frontend JavaScript  
├── views/  
│   ├── index.html      # Main HTML file  
├── server.js           # Backend code  
├── package.json        # Dependencies and scripts  
├── package-lock.json   # Locked versions of dependencies  
├── README.md           # Project documentation
```

# How It Works
- Creates a DNS query packet in binary.
- Sends the query to a DNS server (Google DNS at 8.8.8.8) over UDP using a socket.
- Listen for a response and parses it to extract the IP address.
- Displays the IP address or an error on the frontend.

# Technologies Used
- Node.js
- Express
- Dgram (for UDP socket)
- JavaScript (Frontend and Backend)
- HTML/CSS

# Future Improvements
- Turn this into a recursive resolver by querying multiple servers in the DNS server hierarchy
- Add support for other DNS record types such as `AAAA` (IPv4 addresses) or `MX` (mail servers)
