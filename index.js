const dgram = require('dgram');
const server = '8.8.8.8';  // Google's public DNS server
const port = 53;  

const socket = dgram.createSocket('udp4');

console.log("hello world")

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