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

  else if (bencodedValue.startsWith('l') && bencodedValue.endsWith('e')) {
    const list = [];
    const endIndex = bencodedValue.length - 1;
    let i = 1;

    while (i < endIndex) {
      if (bencodedValue[i] === 'i') {
        const firstIndexOfe = bencodedValue.indexOf('e', i); // find the first occurrance of the e to complete i.e
        const number = bencodedValue.slice(i + 1, firstIndexOfe);

        if (isNaN(number)) throw new Error('Invalid integer value');
        else list.push(parseInt(number));

        i = firstIndexOfe + 1;
      }

      else if (!isNaN(bencodedValue[i])) {
        let strLength = bencodedValue[i];
        if (!isNaN(bencodedValue[i + 1])) strLength += bencodedValue[i + 1];
        
        const firstColonIndex = bencodedValue.indexOf(":", i);
    
        if (firstColonIndex === -1) {
          throw new Error("Invalid encoded value");
        }

        const str = bencodedValue.substr(firstColonIndex + 1, strLength);

        list.push(str);
        i = parseInt(strLength) + firstColonIndex + 1;
      }

      else if (bencodedValue[i] === 'l') {
        const remainings = bencodedValue.substring(i, bencodedValue.length - 2);
        
        // find the closing e index of the sublist
        const openBrack = 1;
        const closeBrack = -1;
        let brack = 1;
        let endIndex;

        for (let j = 0; j < remainings.length; j++) {
          if (remainings[j] === 'i') brack += openBrack;
          
          else if (remainings[j] === 'e') {
            if (brack > 1) brack += closeBrack;
            
            else if (brack === 1) {
              endIndex = j;
              brack += closeBrack;
            };
          }
          
          else throw new Error('Invalid bencoded value');
        } 

        const sublist = remainings.substring(i, endIndex + 1);
        list.push(decodeBencode(sublist));
        i += endIndex + 1;
      }

      else throw new Error('Invalid bencoded values');
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
