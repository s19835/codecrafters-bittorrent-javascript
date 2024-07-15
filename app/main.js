import { argv } from "process";
import util from "util";

// Examples:
// - decodeBencode("5:hello") -> "hello"
// - decodeBencode("10:hello12345") -> "hello12345"
// - decodeBencode("i52e") -> 52
// - decodeBencode("l5:helloi52ee") -> ["hello", 52]
function decodeBencode(bencodedValue) {
  // Check if the first character is a digit
  if (!isNaN(bencodedValue[0])) {
    const firstColonIndex = bencodedValue.indexOf(":");
    
    if (firstColonIndex === -1) {
      throw new Error("Invalid encoded value");
    }
    
    return bencodedValue.substr(firstColonIndex + 1);
  } 

  // Check if the first and last character is a specification of integer, i,e
  else if (bencodedValue.startsWith('i') && bencodedValue.endsWith('e')) {
    const number = bencodedValue.slice(1, bencodedValue.length - 1);
    
    if (isNaN(number)) {
      throw new Error("Invalid integer value");
    }
    
    return parseInt(number);
  }

  else {
    throw new Error("Unsupported bencode value");
  }
}

function main() {
  const command = argv[2];


  if (command === "decode") {
    const bencodedValue = process.argv[3];
  
    // In JavaScript, there's no need to manually convert bytes to string for printing
    // because JS doesn't distinguish between bytes and strings in the same way Python does.
    console.log(JSON.stringify(decodeBencode(bencodedValue)));
  } else {
    throw new Error(`Unknown command ${command}`);
  }
}

main();
