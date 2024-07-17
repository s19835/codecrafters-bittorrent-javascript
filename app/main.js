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
  else if (bencodedValue.startsWith('i')) {
    const indexOfe = bencodedValue.indexOf('e');

    const number = indexOfe !== -1 ? bencodedValue.slice(1, indexOfe) : NaN;
    
    if (isNaN(number)) {
      throw new Error("Invalid integer value");
    }
    
    return parseInt(number);
  }

  // Check for the list condition (starts with l)
  else if (bencodedValue.startsWith('l')) {
    const list = [];
    const endIndex = bencodedValue.length - 1;
    let i = 1;

    while (i < endIndex) {
      if (bencodedValue[i] === 'i') {
        const firstIndexOfE = bencodedValue.indexOf('e', i);
        const number = bencodedValue.slice(i + 1, firstIndexOfE);

        if (isNaN(number)) {
          throw new Error('Invalid integer value');
        } 
        
        else {
          list.push(parseInt(number));
        }

        i = firstIndexOfE + 1;
      } 
      
      else if (!isNaN(bencodedValue[i])) {
        let strLength = bencodedValue[i];
        
        if (!isNaN(bencodedValue[i + 1])) {
          strLength += bencodedValue[i + 1];
        }
        
        const firstColonIndex = bencodedValue.indexOf(":", i);

        if (firstColonIndex === -1) {
          throw new Error("Invalid encoded value");
        }

        const str = bencodedValue.substr(firstColonIndex + 1, strLength);

        list.push(str);
        i = parseInt(strLength) + firstColonIndex + 1;
      } 
      
      else if (bencodedValue[i] === 'l') {
        let subListStartIndex = i;
        let bracketCount = 1;
        i++;

        while (i < endIndex && bracketCount > 0) {
          if (bencodedValue[i] === 'l') {
            bracketCount++;
          } 
          
          else if (bencodedValue[i] === 'e') {
            bracketCount--;
          }
          
          i++;
        }

        const sublist = bencodedValue.substring(subListStartIndex, i);
        list.push(decodeBencode(sublist));
      } 
        
      else {
        i++;
      }
    }

    return list;
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
