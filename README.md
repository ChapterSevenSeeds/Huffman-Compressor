# Huffman-Compressor
### Written by Tyson Jones

Compresses a file using a Huffman binary tree. File format is as follows:

{header}{number trailing zeros at the end of the data}{data}

The header is a bitwise representation of the tree. From top to bottom, left to right, a one signifies that there is a subtree that we need to examine whereas a zero represents a symbol at the end of that branch. Immediately following the zero is the byte that represents the symbol. The end of the header is padded with zeros to fill up the byte to keep the big end of the final byte in the correct location. These extra zeros are ignored once the tree is full.

The next byte represents the amount of trailing zeros at the end of the final byte of the data.

The data is the compressed form of the input data. The most commonly occurring symbols in the input are represented with the least amount of bits whereas the opposite is true for the least commonly occurring symbols. 

## compress.js
Parses the input file, constructs the binary tree, converts the tree into binary form (as described above) as well as converts the input bytes into the compressed versions via recursive walk, concatenates the two together delimited by a byte representing the count trailing zeros in the final byte of the compressed data, converts the concatenated bit string into bytes, and writes the bytes to a file.

## decompress.js
Parses the compressed file, reconstructs the binary tree, and moves along the rest of the file one bit at a time reconstructing the original symbols from the compressed data. The decompression ends once the end of the file is reached or once the current bit index of the final byte is equal to the trailing zero count.
