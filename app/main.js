import { argv } from "process";
import util from "util";

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
    
    else {
      throw new Error("Unsupported bencode value");
    }

    return [result, newIndex];
  }

  const [decodedValue] = decodeElement(bencodedValue, 0);
  return decodedValue;
}

function main() {
  const command = argv[2];


  if (command === "decode") {
    const bencodedValue = process.argv[3];
  
    // In JavaScript, there's no need to manually convert bytes to string for printing
    // because JS doesn't distinguish between bytes and strings in the same way Python does.
    console.log(JSON.stringify(decodeBencode(bencodedValue)));
  } 
  
  else {
    throw new Error(`Unknown command ${command}`);
  }
}

main();
