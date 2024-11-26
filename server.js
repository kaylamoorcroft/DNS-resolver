const dgram = require('dgram');
const express = require('express');
const bodyParser = require("body-parser");

const app = express();
const appPort = 3000; 
const dnsPort = 53; // dns requests are sent over port 53
const dnsServer = '8.8.8.8';  // Google's public DNS server 
const socket = dgram.createSocket('udp4'); // UDP socket

// give access to files in public directory
app.use('/public', express.static(`${process.cwd()}/public`));

// for parsing body of post requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// serve home page
app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// handles when frontend makes a request to resolve domain name
app.get('/resolve',function(req,res) {
    getIpAddress(req.query.domain).then(ipAddress => {
        console.log(ipAddress);
        return res.json({domain: req.query.domain, ip: ipAddress});
    }).catch(err => {
        console.log("error caught: ", err);
        return res.status(500).json({ error: `Unable to resolve domain "${req.query.domain}"` });
    });
});

// creates a DNS query packet in the proper structure with a header and question section.
function createQuery(domain) {
    const id = Buffer.from([0xaa, 0xbb]);         // Transaction ID
    const flags = Buffer.from([0x01, 0x00]);      // Flags
    const questionCount = Buffer.from([0x00, 0x01]);    // Questions count
    const answerCount = Buffer.from([0x00, 0x00]);    // Answer count
    const authorityCount = Buffer.from([0x00, 0x00]);    // Authority count
    const additionalCount = Buffer.from([0x00, 0x00]);    // Additional count

    // Encode the domain name
    const domainParts = domain.split('.').map(part => Buffer.from([part.length, ...Buffer.from(part)]));
    const encodedDomain = Buffer.concat([...domainParts, Buffer.from([0x00])]);  // End with 0 byte
    const recordType = Buffer.from([0x00, 0x01]);      // Type A
    const queryClass = Buffer.from([0x00, 0x01]);     // Class IN

    // Concatenate all parts to form the full DNS query packet
    return Buffer.concat([id, flags, questionCount, answerCount, authorityCount, additionalCount, encodedDomain, recordType, queryClass]);
}

// parses response from dns server and returns ip address
function parseResponse(dnsQuery, res) {
    // Parse the header
    const transactionId = res.slice(0, 2).toString('hex');
    const flags = res.slice(2, 4).toString('hex');
    const questionCount = res.readUInt16BE(4); // readUInt16BE reads 2 bits at time to get actual decimal number instead of hex
    const answerCount = res.readUInt16BE(6);
  
    console.log(`Transaction ID: ${transactionId}`);
    console.log(`Flags: ${flags}`);
    console.log(`Questions: ${questionCount}`);
    console.log(`Answers: ${answerCount}`);

    if (answerCount > 0) {
        // skip question section to get to the answer
        // ip address starts 12 bytes into the answer section
        const ip = res.slice(12 + dnsQuery.length); 
        console.log("IP address in hex:",ip);
        // Convert the IP buffer to a readable IP address
        const ipAddress = `${ip[0]}.${ip[1]}.${ip[2]}.${ip[3]}`;
        console.log(`Resolved IP Address: ${ipAddress}`);
        return ipAddress;
    }
    else {
        console.log("No answers found...");
        socket.emit('error', new Error("No answers found in DNS response"));
    }
}

// gets ip address from domain by sending query to server and parsing response
function getIpAddress(domain) {
    return new Promise((resolve, reject) => {
        const query = createQuery(domain);

        // Send the query packet to a DNS server
        socket.send(query, dnsPort, dnsServer, (err) => {
            if (err) {
                console.error('Error sending query:', err);
                reject(err);
            }
            else console.log('Query sent');
        });

        socket.on('message', (response) => {
            console.log('DNS Response:', response);
            const res = parseResponse(query, response);
            resolve(res);
        });

        // Handle potential errors
        socket.on('error', (err) => {
            console.log("there was an error")
            reject(err);
        });
    });
}

// start web app
app.listen(appPort, function() {
    console.log(`Listening on port ${appPort}`);
});