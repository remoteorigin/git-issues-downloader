const fs = require('fs')
const request = require('request')
const moment = require('moment')
const prompt = require('prompt')

const inputFileName = 'all_issues.json'
const outputFileName = 'all_issues.csv'

const username = 'lukasvesely98'
const password = 'R0jnfnsapvnj4l'

let pages = 1

// prompt.start()
//
// prompt.get(['username', 'password',], function (err, result) {
//
//   const username = result.username
//   const password = result.password
//
// })

const requestOptions = {
  headers: {
    'User-Agent': 'request'
  },
  auth: {
    'user': username,
    'pass': password
  }
}

// requestAPI('https://api.github.com/repos/pavelbinar/ro_convert-github-issues-to-csv/issues?per_page=10&state=all&page=' + pages)
// pages++;
// requestAPI('https://api.github.com/repos/pavelbinar/ro_convert-github-issues-to-csv/issues?per_page=10&state=all&page=' + pages)

requestResponse('https://api.github.com/repos/pavelbinar/ro_convert-github-issues-to-csv/issues?per_page=10&state=all&page=' + pages)

function requestAPI (url) {
  request(url, requestOptions, function (error, response, body) {
    // console.log('error:', error); // Print the error if one occurred
    // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    // console.log('body:', body); // Print the HTML for the Google homepage.
    console.log(pages)
    convertJSonToCsv(error, body)
  })

}

function requestResponse (url) {
  request(url, requestOptions, function (error, response, body) {
    const link = response.headers.link;
    // Slice(),IndexOf()
  })

}

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

  writeData(csvData, outputFileName)
}

function writeData (data, outputFileName) {
  fs.writeFile(outputFileName, data, (err) => {
    if (err) throw err
    console.log(`\nSUCCESS!\n${inputFileName} converted and saved to ${outputFileName}`)
  })
}
