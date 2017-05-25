#!/usr/bin/env node

const fs = require('fs')
const request = require('request')
const _ = require('lodash')
const moment = require('moment')
const read = require('read')
const argv = require('yargs')
  .usage('Usage: $0 --username [username] --password [password] --repository [full URL of repository]')
  .demandOption(['repository'])
  .default('fileName', 'all_issues.csv')
  .help('h')
  .alias('h', 'help')
  .describe('fileName', 'Name of output file')
  .version()
  .alias('version', 'ver')
  .argv
const chalk = require('chalk')

const outputFileName = argv.fileName

const issuesPerPage = 100
const repoUserName = argv.repository.slice(19, argv.repository.indexOf('/', 19))
const repoUrl = (argv.repository.slice(20 + repoUserName.length, argv.repository.lastIndexOf('/'))) ? argv.repository.slice(20 + repoUserName.length, argv.repository.lastIndexOf('/')) : argv.repository.slice(20 + repoUserName.length)

const startUrl = `https://api.github.com/repos/${repoUserName}/${repoUrl}/issues?per_page=${issuesPerPage}&state=all&page=1`

// callback function for getting input from prompt

function getAuth (auth, silent, callback) {
  read({prompt: `${auth}: `, silent: silent}, function (er, password) {
    callback(password)
  })

}

// callback function for getting requested options

function getRequestedOptions (username, password, callback) {

  const requestOptions = {
    headers: {
      'User-Agent': 'request'
    },
    auth: {
      'user': '',
      'pass': ''
    }
  }

  if (username && password) {
    requestOptions.auth.user = username
    requestOptions.auth.pass = password
    callback(requestOptions)
  }
  else {
    if (password) {
      requestOptions.auth.pass = password
      getAuth('username', false, (usernameConsoleInput) => {
        requestOptions.auth.user = usernameConsoleInput

        callback(requestOptions)
      })
    }
    else {
      if (username) {
        requestOptions.auth.user = username
        getAuth('password', true, (passwordConsoleInput) => {
          requestOptions.auth.pass = passwordConsoleInput

          callback(requestOptions)
        })
      }
      else {
        getAuth('username', false, (usernameConsoleInput) => {
          requestOptions.auth.user = usernameConsoleInput
          getAuth('password', true, (passwordConsoleInput) => {
            requestOptions.auth.pass = passwordConsoleInput

            callback(requestOptions)
          })

        })
      }
    }
  }

}

//main function for running program

function main (data, url, requestedOptions) {

  requestBody(url, requestedOptions, (error, response, body) => {

    const linkObject = responseToObject(response)

    //take body, parse it and add it to data

    data = _.concat(data, body)

    if (linkObject.nextPage) {

      console.log(chalk.green(`Successfully requested ${linkObject.nextPage.number - 1}. page of ${linkObject.lastPage.number}`))

      main(data, linkObject.nextPage.url, requestedOptions)
    }
    else {
      console.log(chalk.green('Successfully requested last page'))

      writeData(convertJSonToCsv(error, data), outputFileName)
    }

  })
}

//get page url and page number from link

function getUrlAndNumber (link) {
  return {
    url: link.slice(link.indexOf('<') + 1, link.indexOf('>')),
    number: link.slice(link.indexOf('page', link.indexOf('state')) + 5, link.indexOf('>'))
  }
}

//create and return links info (page url and page number for all 4 links in response.headers.link) from whole response

function responseToObject (response) {

  const rawLink = response.headers.link

  if (rawLink && rawLink.includes('next')) {
    const links = rawLink.split(',')

    let linksInfo = {
      nextPage: (links[0]) ? getUrlAndNumber(links[0]) : false,
      lastPage: (links[1]) ? getUrlAndNumber(links[1]) : false,
      firstPage: (links[2]) ? getUrlAndNumber(links[2]) : false,
      prevPage: (links[3]) ? getUrlAndNumber(links[3]) : false,
    }

    return linksInfo
  }
  return false
}

//use url and request api

function requestBody (url, requestedOptions, callback) {
  console.log('Requesting API...')
  request(url, requestedOptions, function (err, response, body) {

    const JSObject = JSON.parse(body)

    if (!JSObject.length) {

      //switch for various error messages

      switch (JSObject.message) {
        case 'Not Found':
          console.log(chalk.red('We didn\'t find any repository on this URL, please check it'))
          break
        case 'Bad credentials':
          console.log(chalk.red('Your username or password is invalid, please check it'))
          break
        default:
          console.log(chalk.red('Repository have 0 issues. Nothing to download'))
      }
    }
    else {
      callback(err, response, JSObject)
    }

  })
}

//take JSON data, convert them into CSV format and return them

function convertJSonToCsv (err, jsData) {
  if (err) throw err

  console.log('\nConverting issues...')

  const csvData = jsData.map(object => {
    const date = moment(object.created_at).format('L')
    const labels = object.labels
    const stringLabels = labels.map(label => label.name).toString()
    return `"${object.number}"; "${object.title.replace(/"/g, '\'')}"; "${object.html_url}"; "${stringLabels}"; "${object.state}"; "${date}"\n`
  }).join('')

  console.log(chalk.green(`Successfully converted ${jsData.length} issues!`))

  return csvData

}

//create a new file and write converted data on him

function writeData (data, outputFileName) {
  console.log('\nWriting data to csv file')
  fs.writeFile(outputFileName, data, (err) => {
    if (err) throw err

    console.log(chalk.yellow(`\nIssues was downloaded, converted and saved to ${outputFileName}`))
  })
}

//run main function
getRequestedOptions(argv.username, argv.password, (requestedOptions) => {

  main([], startUrl, requestedOptions)

})
