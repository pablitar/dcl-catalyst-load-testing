const { argv } = require("process");

const fileName = argv[2];

if (!fileName) {
  console.log(
    "Usage: node extractSamples.js <pathToFile> [fromDate] [toDate]. Extracts valid samples from log file.\n",
    "[fromDate] and [toDate] are optional. They must be Month + Day + Time only ISO 8601 so they can be compared with the logs date"
  );
}

const fs = require("fs");

if (!fs.existsSync(fileName)) {
  console.log("Cannot find file", fileName);
}

const fromDate = new Date(argv[3]);
const toDate = new Date(argv[4]);

function isDateInRequestedPeriod(line) {
  function dateOf(line) {
    const dateRegex = /\w+\s\d+\s\d+:\d+:\d+/;
    const match = dateRegex.exec(line);
    const dateString = match ? match[0] : undefined;

    // if (!dateString) console.log("Extracting date from", line, dateString);

    return new Date(dateString);
  }

  function isValidDate(date) {
    return !isNaN(date.getTime());
  }

  const date = dateOf(line);

  return (
    !isValidDate(date) ||
    ((!isValidDate(fromDate) || date >= fromDate) &&
      (!isValidDate(toDate) || date <= toDate))
  );
}

const data = fs.readFileSync(fileName, "utf-8");

const requestRegex = /GET\s([^\s]+)/;

const validLines = data
  .split("\n")
  .filter(
    (it) =>
      !!it &&
      isDateInRequestedPeriod(it) &&
      it.includes("nginx") &&
      it.includes("GET") &&
      !it.includes("_metrics")
  )
  .map((line) => line.match(requestRegex)[0]);

console.log(JSON.stringify(validLines, undefined, 2));
