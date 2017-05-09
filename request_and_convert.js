const fs = require('fs')
const request = require('request')
const moment = require('moment')

const inputFileName = 'all_issues.json'
const outputFileName = 'all_issues.csv'

let json

const username = 'lukasvesely98'
const password = 'R0jnfnsapvnj4l'

const options = {
  url: 'https://api.github.com/repos/pavelbinar/ro_convert-github-issues-to-csv/issues?per_page=100&state=all&page=1',
  headers: {
    'User-Agent': 'request'
  },
  auth: {
    'user': username,
    'pass': password
  }
}

request(options, function (error, response, body) {
  // console.log('error:', error); // Print the error if one occurred
  // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  // console.log('body:', body); // Print the HTML for the Google homepage.

  convertJSonToCsv(error, body)
})



function convertJSonToCsv (err, data) {
  if (err) throw err

  jsData = JSON.parse(data)

  const csvData = jsData.map(object => {
    const date = moment(object.created_at).format('L')
    const labels = object.labels
    const stringLabels = labels.map(label => label.name).toString()

    // console.log(object)

    return `"${object.number}"; "${object.title.replace(/"/g, '\'')}"; "${object.html_url}"; "${stringLabels}"; "${object.state}"; "${date}"`
  }).join('\n')

  console.log(csvData)

  writeData(csvData)
}

function writeData (data) {
  fs.writeFile(outputFileName, data, (err) => {
    if (err) throw err
    console.log(`\nSUCCESS!\n${inputFileName} converted and saved to ${outputFileName}`)
  })
}
