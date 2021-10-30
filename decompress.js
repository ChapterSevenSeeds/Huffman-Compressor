const fs = require('fs');

const bytes = fs.readFileSync('compressed.txt');

const tree = {};
let bitIndex = 7;
let byteIndex = 0;

function decrementBitIndex(amount = 1) {
    bitIndex -= amount;

    if (bitIndex < 0) {
        ++byteIndex;
        bitIndex += 8;
    } 
}

function parseTree(subTree) {
    for (const rightOrLeft of [0, 1]) {
        if (bytes[byteIndex] & (1 << bitIndex)) {
            subTree[rightOrLeft] = {};
            decrementBitIndex();
            parseTree(subTree[rightOrLeft]);
        } else {
            const byte1Mask = (1 << bitIndex) - 1;
            const byte2Mask = ~byte1Mask;
            subTree[rightOrLeft] = ((bytes[byteIndex] & byte1Mask) << (8 - bitIndex));
            decrementBitIndex(8);
            subTree[rightOrLeft] |=  ((bytes[byteIndex] & byte2Mask) >> bitIndex);
            decrementBitIndex();
        }
    }
}

parseTree(tree);

// Move to the next byte if needed to begin decompression.
if (bitIndex !== 7) {
     ++byteIndex;
     bitIndex = 7;
}

const trailingZeros = bytes[byteIndex++];
const originalData = [];

while (byteIndex < bytes.length) {
    if (byteIndex === bytes.length - 1 && bitIndex + 1 === trailingZeros) {
        break;
    }

    let currentWalk = tree;
    while (true) {
        const nextBitItem = currentWalk[Number(Boolean(bytes[byteIndex] & (1 << bitIndex)))];
        decrementBitIndex();
        if (typeof(nextBitItem) === 'object') {
            currentWalk = nextBitItem;
        } else {
            originalData.push(nextBitItem);
            break;
        }
    }
}

const decompressed = fs.createWriteStream("decompressed.txt");
decompressed.write(Uint8Array.from(originalData));