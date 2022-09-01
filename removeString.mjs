import fs from 'fs';
import readline from 'readline';

const readFileName = './lastTwoDaysRecord.txt';
// const writeFileName = './validOutputAirlinesData-20-08-22.txt';
const writeFileName = 'validLastTwoDaysRecord.txt';
const fileStream = fs.createReadStream(readFileName);
var lineReader = readline.createInterface({
  input: fileStream
});
lineReader.on('line', (line) => {
  const record = line.substring(38).slice(0, -3);
  const recWithNewLineChar = record + '\n';
  fs.appendFileSync(writeFileName, recWithNewLineChar);
  /* process.exit(); */
});
lineReader.on('close', () => {
  console.log(
    '---------------------------------------DATA FORMATING IS COMPLETED--------------------------------------------------'
  );
});
