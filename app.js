#!/usr/bin/env node
const fs = require('fs')
const request = require('request')
const _ = require('lodash')
const moment = require('moment')
const read = require('read')
const chalk = require('chalk')
const argv = require('yargs')
  .usage('Usage: git-issues-downloader [options] URL \nType git-issues-downloader --help to see a list of all options.')
  .help('h')
  .version()
  .alias('h', 'help')
  .alias('v', 'version')
  .alias('u', 'username')
  .alias('p', 'password')
  .alias('f', 'filename')
  .describe('help', 'Show help')
  .describe('username', 'Your GitHub username')
  .describe('password', 'Your GitHub password')
  .describe('filename', 'Name of the output file')
  .default('filename', 'all_issues.csv')
  .argv

const outputFileName = argv.filename

// callback function for getting input from prompt

const getAuth = function (auth, silent, callback) {
  read({ prompt: `${auth}: `, silent: silent }, function (er, password) {
    callback(password)
  })
}

// callback function for getting requested options
const getRequestedOptions = exports.getRequestedOptions = function (username, password, url, callback) {
  const requestOptions = {
    headers: {
      'User-Agent': 'request'
    },
    url: '',
    auth: {
      'user': '',
      'pass': ''
    }
  }

  requestOptions.url = url

  if (username && password) {
    requestOptions.auth.user = username
    requestOptions.auth.pass = password
    callback(requestOptions)
  } else {
    if (password) {
      requestOptions.auth.pass = password
      getAuth('username', false, (usernameConsoleInput) => {
        requestOptions.auth.user = usernameConsoleInput

        callback(requestOptions)
      })
    } else {
      if (username) {
        requestOptions.auth.user = username
        getAuth('password', true, (passwordConsoleInput) => {
          requestOptions.auth.pass = passwordConsoleInput

          callback(requestOptions)
        })
      } else {
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

// main function for running program

const main = exports.main = function (data, requestedOptions) {
  logExceptOnTest('Requesting API...' + requestedOptions.url)
  requestBody(requestedOptions, (error, response, body) => {
    const linkObject = responseToObject(response.headers)

    if (error) {
      chalk.red('There has been an error requesting data from GitHub')
      console.error(error)
    }

    // take body, parse it and add it to data

    data = _.concat(data, body)

    if (linkObject.nextPage) {
      logExceptOnTest(chalk.green(`Successfully requested ${linkObject.nextPage.number - 1}. page of ${linkObject.lastPage.number}`))
      requestedOptions.url = linkObject.nextPage.url
      main(data, requestedOptions)
    } else {
      logExceptOnTest(chalk.green('Successfully requested last page'))

      logExceptOnTest('\nConverting issues...')
      const csvData = convertJSonToCsv(data)
      logExceptOnTest(chalk.green(`\nSuccessfully converted ${data.length} issues!`))

      logExceptOnTest('\nWriting data to csv file')
      fs.writeFile(outputFileName, csvData, (err) => {
        if (err) throw err

        logExceptOnTest(chalk.yellow(`\nIssues was downloaded, converted and saved to ${outputFileName}`))
      })
    }
  })
}

// get page url and page number from link

const getUrlAndNumber = exports.getUrlAndNumber = function (link) {
  var pageRegex = link.match(/&page=([\d]+)/)
  var relRegex = link.match(/rel="([^"]+)"/)
  return {
    url: link.slice(link.indexOf('<') + 1, link.indexOf('>')),
    number: pageRegex && pageRegex[1],
    rel: relRegex && relRegex[1]
  }
}

// create and return links info (page url and page number for all 4 possible links in response.headers.link) from whole response.hearders

const responseToObject = exports.responseToObject = function (response) {
  const rawLink = response.link

  if (rawLink && rawLink.includes('next')) {
    const links = rawLink.split(',')

    return links.reduce((acc, link) => {
      var result = getUrlAndNumber(link)

      if (result.rel === 'next') {
        acc.nextPage = result
      } else if (result.rel === 'last') {
        acc.lastPage = result
      } else if (result.rel === 'first') {
        acc.firstPage = result
      } else if (result.rel === 'prev') {
        acc.prevPage = result
      }

      return acc
    }, {})
  }
  return false
}

// use url and request api

const requestBody = exports.requestBody = function (requestedOptions, callback) {
  request.get(requestedOptions, function (err, response, body) {
    const JSObject = JSON.parse(body)

    if (!JSObject.length) {
      // switch for various error messages

      switch (JSObject.message) {
        case 'Not Found':
          logExceptOnTest(chalk.red('\nWe didn\'t find any repository on this URL, please check it'))
          break
        case 'Bad credentials':
          logExceptOnTest(chalk.red('\nYour username or password is invalid, please check it'))
          break
        case 'Must specify two-factor authentication OTP code.':
          logExceptOnTest(chalk.red('\nYour acoount requires two-factor authentication.\nUnfortunatelly, this is currently not supported.'))
          break
        default:
          logExceptOnTest(chalk.red('\nRepository have 0 issues. Nothing to download'))
      }
    } else {
      callback(err, response, JSObject)
    }
  })
}

// take JSON data, convert them into CSV format and return them

const convertJSonToCsv = exports.convertJSonToCsv = function (jsData) {
  const csv = 'Issue Number; Title; Github URL; Labels; State; Created At; Updated At; Reporter; Assignee; Body\n'

  return csv + jsData.map(object => {
    const createdAt = moment(object.created_at).format('L')
    const updatedAt = moment(object.updated_at).format('L')
    const reporter = (object.user && object.user.login) || ''
    const assignee = (object.assignee && object.assignee.login) || ''

    const labels = object.labels
    const stringLabels = labels.map(label => label.name).toString()
    return `${object.number}; "${object.title.replace(/"/g, '\'')}"; ${object.html_url}; "${stringLabels}"; ${object.state}; ${createdAt}; ${updatedAt}; ${reporter}; ${assignee}; "${object.body.replace(/"/g, '\'')}"\n`
  }).join('')
}

// execute main function with requested options and condition for URL input

const execute = exports.execute = function (argvRepository) {
  if (argvRepository) {
    const issuesPerPage = 100
    const repoUserName = argvRepository.slice(19, argvRepository.indexOf('/', 19))
    const repoUrl = (argvRepository.slice(20 + repoUserName.length, argvRepository.lastIndexOf('/'))) ? argvRepository.slice(20 + repoUserName.length, argvRepository.lastIndexOf('/')) : argvRepository.slice(20 + repoUserName.length)

    const startUrl = `https://api.github.com/repos/${repoUserName}/${repoUrl}/issues?state=all&per_page=${issuesPerPage}&page=1`

    getRequestedOptions(argv.username, argv.password, startUrl, (requestedOptions) => {
      main([], requestedOptions)
    })
  } else {
    console.log('Usage: git-issues-downloader [options] URL')
  }
}

function logExceptOnTest (string) {
  if (process.env.NODE_ENV !== 'test') {
    console.log(string)
  }
}

const argvRepository = argv._[argv._.length - 1]

execute(argvRepository)
