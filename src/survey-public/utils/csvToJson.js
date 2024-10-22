const { readFileSync, writeFileSync } = require("fs")

const [inputFile, outputFile] = process.argv.slice(2)

const csvData = readFileSync(inputFile, "utf8")

const lines = csvData.split("\r\n")

const headers = lines[0].split(";")

const jsonData = lines.slice(1).map((line) => {
  const values = line.split(";")
  const item = {}
  headers.forEach((header, i) => {
    if (header === "bbox" && values[i]) {
      item[header] = JSON.parse(values[i])
    } else {
      item[header] = values[i].trim()
    }
  })
  return item
})

writeFileSync(outputFile, JSON.stringify(jsonData, null, 2))
