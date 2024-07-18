import { argv } from "process";
import util from "util";
import { readFileSync } from "fs";
import crypto from "crypto";

// Examples:
// - decodeBencode("5:hello") -> "hello"
// - decodeBencode("10:hello12345") -> "hello12345"
// - decodeBencode("i52e") -> 52
// - decodeBencode("l5:helloi52ee") -> ["hello", 52]

// Function to decode bencoded values
function decodeBencode(bencodedValue) {
  // Function to decode a single bencoded element
  const decodeElement = (bencodedValue, index) => {
    let result, newIndex;

    // Decode string
    if (!isNaN(bencodedValue[index])) {
      const firstColonIndex = bencodedValue.indexOf(':', index);
      
      if (firstColonIndex === -1) throw new Error("Invalid encoded value");

      const length = parseInt(bencodedValue.slice(index, firstColonIndex));
      
      newIndex = firstColonIndex + 1 + length;
      result = bencodedValue.slice(firstColonIndex + 1, newIndex);
    } 
    
    // Decode integer
    else if (bencodedValue[index] === 'i') {
      const endOfInt = bencodedValue.indexOf('e', index);
      
      if (endOfInt === -1) throw new Error("Invalid integer value");

      result = parseInt(bencodedValue.slice(index + 1, endOfInt));
      newIndex = endOfInt + 1;
    } 
    
    // Decode list
    else if (bencodedValue[index] === 'l') {
      let list = [];
      newIndex = index + 1;
      
      while (bencodedValue[newIndex] !== 'e') {
        const [element, nextIndex] = decodeElement(bencodedValue, newIndex);
        list.push(element);
        
        newIndex = nextIndex;
      }
      
      result = list;
      newIndex += 1;
    } 

    else if (bencodedValue[index] === 'd') {
      let dictionary = {};
      newIndex = index + 1;

      while (bencodedValue[newIndex] !== 'e') {
        // decode key which need to be a string
        const [key, valueIndex] = decodeElement(bencodedValue, newIndex);
        if (typeof key !== 'string') throw new Error('Dictionary keys must be strings');
        // decode value
        const [value, keyNextIndex] = decodeElement(bencodedValue, valueIndex);

        dictionary[key] = value;
        newIndex = keyNextIndex;
      }

      result = dictionary;
      newIndex += 1;
    }
    
    else {
      throw new Error("Unsupported bencode value");
    }

    return [result, newIndex];
  }

  const [decodedValue] = decodeElement(bencodedValue, 0);
  return decodedValue;
}

// Function to bencode values
function bencode(value) {
  if (typeof value === 'string') return `${value.length}:${value}`;

  else if (typeof value === 'number') return `i${value}e`;

  else if (Array.isArray(value)) return `l${value.map(bencode).join('')}e`;

  else if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `d${keys.map(key => `${bencode(key)}${bencode(value[key])}`).join('')}e`;
  }

  else {
    throw new Error("Unsupported bencode value type");
  }
}

// Function to read and decode torrent file
function parseTorrentFile(torrentFile) {
  // Read file and extract data
  const fileBuffer = readFileSync(torrentFile);
  const fileContent = fileBuffer.toString('binary');
  const fileData = decodeBencode(fileContent);

  // create sha hash of info
  const info = fileData.info;
  const bencodedInfo = bencode(info);
  const hash = crypto.createHash('sha1').update(bencodedInfo, 'binary').digest('hex');
  
  console.log('Tracker URL:', fileData.announce);
  console.log('Length:', fileData.info.length);
  console.log('Info Hash:', hash);
}

function main() {
  const command = argv[2];


  if (command === "decode") {
    const bencodedValue = process.argv[3];
  
    // In JavaScript, there's no need to manually convert bytes to string for printing
    // because JS doesn't distinguish between bytes and strings in the same way Python does.
    console.log(JSON.stringify(decodeBencode(bencodedValue)));
  } 

  else if (command === "info") {
    const torrentFile = process.argv[3];

    parseTorrentFile(torrentFile);
  }
  
  else {
    throw new Error(`Unknown command ${command}`);
  }
}

main();
