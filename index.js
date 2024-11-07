const dgram = require('dgram');
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const port = 3000; 
const server = '8.8.8.8';  // Google's public DNS server 

const socket = dgram.createSocket('udp4');

// give access to files in public directory
app.use('/public', express.static(`${process.cwd()}/public`));

// for parsing body of post requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// serve home page
app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/ip',function(req,res) {
    res.json({domain: req.body.domain});
});

/**
 * Creates a DNS query packet in the proper structure with a header and question section.
 * @param domain - domain that the DNS is querying 
 * @returns Buffer of the DNS query packet
 */
function createQuery(domain) {
    const id = Buffer.from([0xaa, 0xbb]);         // Transaction ID
    const flags = Buffer.from([0x01, 0x00]);      // Flags
    const questionCount = Buffer.from([0x00, 0x01]);    // Questions count
    const answerCount = Buffer.from([0x00, 0x00]);    // Answer count
    const authorityCount = Buffer.from([0x00, 0x00]);    // Authority count
    const additionalCount = Buffer.from([0x00, 0x00]);    // Additional count

    // Encode the domain name
    const qNameParts = domain.split('.').map(part => Buffer.from([part.length, ...Buffer.from(part)]));
    const qName = Buffer.concat([...qNameParts, Buffer.from([0x00])]);  // End with 0 byte
    const qType = Buffer.from([0x00, 0x01]);      // Type A
    const qClass = Buffer.from([0x00, 0x01]);     // Class IN

    // Concatenate all parts to form the full DNS query packet
    return Buffer.concat([id, flags, questionCount, answerCount, authorityCount, additionalCount, qName, qType, qClass]);
}

const dnsQuery = createQuery("www.google.com");
console.log(dnsQuery);
console.log(dnsQuery.toString());

app.listen(port, function() {
    console.log(`Listening on port ${port}`);
  });