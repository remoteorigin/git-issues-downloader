const fs = require('fs')
const request = require('request')
const moment = require('moment')
const argv = require('yargs').argv
const chalk = require('chalk')

const outputFileName = 'all_issues.csv'

const username = argv.username
const password = argv.password
const repoUrl = argv.repository.slice(19,argv.repository.lastIndexOf("s")+1)

const errorArgument = "Use proper arguments\n--username\n--password\n--repository"

const startUrl = `https://api.github.com/repos/${repoUrl}?per_page=10&state=all&page=1`

const requestOptions = {
  headers: {
    'User-Agent': 'request'
  },
  auth: {
    'user': username,
    'pass': password
  }
}

function main (data, url) {
  requestBody(url, (error, response, body) => {
    const rawLink = response.headers.link
    //dodelat podminku pro pripad kdz je pouze jedna page
    data += convertJSonToCsv(error, body)
    if (rawLink.includes('next')) {
      const link = rawLink.slice(rawLink.indexOf('<') + 1, rawLink.indexOf('>'))
      main(data, link)
    }
    else {
      writeData(data, outputFileName)
    }

  })
}

function requestBody (url, callback) {
  console.log('Requesting API...')
  request(url, requestOptions, function (error, response, body) {
    if (error) throw errorArgument
    console.log(chalk.green('API successfully requested'))
    callback(error, response, body)
  })
}

function convertJSonToCsv (err, data) {
  if (err) throw err

  console.log('\nConverting issues...')

  jsData = JSON.parse(data)

  const csvData = jsData.map(object => {
    const date = moment(object.created_at).format('L')
    const labels = object.labels
    const stringLabels = labels.map(label => label.name).toString()

    return `"${object.number}"; "${object.title.replace(/"/g, '\'')}"; "${object.html_url}"; "${stringLabels}"; "${object.state}"; "${date}"\n`
  }).join('')

  console.log(chalk.green('Successfully converted 10 issues!'))
  return csvData
}

function writeData (data, outputFileName) {
  fs.writeFile(outputFileName, data, (err) => {
    if (err) throw err
    console.log('Writing data to csv file')
    console.log(chalk.yellow(`\nProcess was successful\nIssues was downloaded, converted and saved to ${outputFileName}`))
  })
}

console.log(startUrl)
main('', startUrl)

