class Node {
    weight = 0;
    symbol;
    left;
    right;

    constructor(weight, symbol, left = null, right = null) {
        this.weight = weight;
        this.symbol = symbol
        this.left = left;
        this.right = right;
    }
}

const fs = require('fs');
const _ = require('lodash');

const byteFrequencies = {};
const bytes = fs.readFileSync('App.js');
const compressed = fs.createWriteStream('compressed.txt');

function createCompressedData(tree, data) {
    const headerChunks = _.chunk(tree, 8).map(x => x.join('')); // Chunk the header into bytes.
    headerChunks[headerChunks.length - 1] = headerChunks[headerChunks.length - 1].padEnd(8, '0'); // Get the final bits in correct spot by padding little end.

    const dataChunks = _.chunk(data, 8).map(x => x.join('')); // Chunk the data into bytes.

    headerChunks.push((8 - dataChunks[dataChunks.length - 1].length).toString(2).padStart(8, '0')); // Add a byte specifying how many trailing zeros are in the final data byte.

    dataChunks[dataChunks.length - 1] = dataChunks[dataChunks.length - 1].padEnd(8, '0'); // Make sure the final byte is in the correct spot by padding the little end with zeros.
    
    return Uint8Array.from([...headerChunks, ...dataChunks].map(x => parseInt(x, 2)));
}

for (const byte of bytes) {
    byteFrequencies[byte] = (byteFrequencies[byte] ?? 0) + 1;
}

const nodes = [];
for (const byte in byteFrequencies) {
    nodes.push(new Node(byteFrequencies[byte], byte));
}


while (nodes.length > 1) {
    nodes.sort((a, b) => b.weight - a.weight);
    const first = nodes[nodes.length - 1];
    const second = nodes[nodes.length - 2];
    
    const newNode = new Node(first.weight + second.weight, null, second, first);
    nodes.splice(nodes.length - 2);
    nodes.push(newNode);
}

const table = {};
let headerBitString = "";
function walk(obj, bitString) {
    if (obj.symbol) {
        table[obj.symbol] = bitString;
        headerBitString += `${Number(obj.symbol).toString(2).padStart(8, '0')}`;
        return null;
    }

    if (obj.left.symbol) {
        headerBitString += '0'
    } else {
        headerBitString += '1';
    }

    walk(obj.left, bitString + "0");
    
    if (obj.right.symbol) {
        headerBitString += '0'
    } else {
        headerBitString += '1';
    }
    walk(obj.right, bitString + "1");
}

walk(nodes[0], "");

let outputBits = "";
for (const byte of bytes) {
    outputBits += table[byte];
}

compressed.write(createCompressedData(headerBitString, outputBits));