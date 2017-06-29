#!/usr/bin/env node

const fs = require('fs')
const request = require('request')
const _ = require('lodash')
const moment = require('moment')
const read = require('read')
const chalk = require('chalk')
const argv = require('yargs')
  .usage('Usage: git-issues-downloader [options] URL \nType git-issues-downloader --help to see a list of all options. ')
  .help('h')

  .version(function () {
    return `Version: ${require('./package.json').version}`
  })

  .alias('h', 'help')
  .alias('v', 'version')
  .alias('u', 'username')
  .alias('p', 'password')
  .alias('f', 'filename')
  .describe('help', 'Show help')
  .describe('username', 'Your GitHub username')
  .describe('password', 'Your GitHub password')
  .describe('filename', 'Name of the output file')
  .describe('clone', 'Url of repository where you want to clone your issues')
  .default('filename', 'all_issues.csv')
  .argv

const outputFileName = argv.filename

// callback function for getting input from prompt

const getUserInput = function (auth, silent, callback) {
  read({prompt: `${auth}: `, silent: silent}, function (er, password) {
    callback(password)
  })
}

// function for getting username and password

const getAuthorization = function (callback) {
  let username = argv.username
  let password = argv.password

  if (username && password) {
    callback(username, password)
  } else if (username && !password) {
    getUserInput('password', true, (passwordConsoleInput) => {
      password = passwordConsoleInput

      callback(username, password)
    })
  } else if (!username && password) {
    getUserInput('username', true, (usernameConsoleInput) => {
      username = usernameConsoleInput

      callback(username, password)
    })
  } else if (!username && !password) {
    getUserInput('username', false, (usernameConsoleInput) => {
      username = usernameConsoleInput
      getUserInput('password', true, (passwordConsoleInput) => {
        password = passwordConsoleInput

        callback(username, password)
      })
    })
  }
}

// callback function for getting requested options

const getRequestedOptions = exports.getRequestedOptions = function (username, password, url, callback) {
  const requestOptions = {
    headers: {
      'User-Agent': 'lukasvesely98',
      'Content-Type': 'application/json'
    },
    url: '',
    auth: {
      'user': '',
      'pass': ''
    },
    body: JSON.stringify({title: 'Issue'})
  }

  requestOptions.url = url
  callback(requestOptions)
}

// take url a create api url from it

const makeAPIUrl = function (url) {
  const repoUserName = url.slice(19, url.indexOf('/', 19))
  const repoUrl = (url.slice(20 + repoUserName.length, url.lastIndexOf('/'))) ? url.slice(20 + repoUserName.length, url.lastIndexOf('/')) : url.slice(20 + repoUserName.length)

  return `https://api.github.com/repos/${repoUserName}/${repoUrl}`
}


// main function for running program

const main = exports.main = function (data, requestedOptions) {
  console.log('main')
  getAuthorization((username, password) => {
    requestedOptions.auth.username = username
    requestedOptions.auth.password = password
    requestBody(requestedOptions, (error, response, body) => {
      logExceptOnTest('Requesting API...')

      linkObject = responseToObject(response.headers)

      // take body, parse it and add it to data

      data = _.concat(data, body)

      if (linkObject.nextPage) {
        logExceptOnTest(chalk.green(`Successfully requested ${linkObject.nextPage.number - 1}. page of ${linkObject.lastPage.number}`))
        requestedOptions.url = linkObject.nextPage.url
        main(data, requestedOptions)
      } else {
        logExceptOnTest(chalk.green('Successfully requested last page'))

        // else convert data and write them to csv file

        logExceptOnTest('\nConverting issues...')

        getComments(data,requestedOptions,(data)=>{



        //const csvData = convertJSonToCsv(data)
        logExceptOnTest(chalk.green(`\nSuccessfully converted ${data.length} issues!`))

        logExceptOnTest('\nWriting data to csv file')
        fs.writeFile(outputFileName, JSON.stringify(data, null, 4), (err) => {
          if (err) throw err

          logExceptOnTest(chalk.yellow(`\nIssues was downloaded, converted and saved to ${outputFileName}`))
        })
      })
      }
    })
  })
}

// get page url and page number from link

const getUrlAndNumber = exports.getUrlAndNumber = function (link) {
  return {
    url: link.slice(link.indexOf('<') + 1, link.indexOf('>')),
    number: link.slice(link.indexOf('page', link.indexOf('state')) + 5, link.indexOf('>'))
  }
}

// create and return links info (page url and page number for all 4 possible links in response.headers.link) from whole response.hearders

const responseToObject = exports.responseToObject = function (response) {
  const rawLink = response.link

  if (rawLink && rawLink.includes('next')) {
    const links = rawLink.split(',')

    return {
      nextPage: (links[0]) ? getUrlAndNumber(links[0]) : false,
      lastPage: (links[1]) ? getUrlAndNumber(links[1]) : false,
      firstPage: (links[2]) ? getUrlAndNumber(links[2]) : false,
      prevPage: (links[3]) ? getUrlAndNumber(links[3]) : false
    }
  }
  return false
}

const getComments = function (data, requestedOptions, callback) {




  addComments(data,requestedOptions,(data)=>{
    callback(data)
  })

}

          
// request for getting all comments from issue

const requestComments = function (commentsUrl, requestedOptions, callback) {
  requestedOptions.url = commentsUrl
  request.get(requestedOptions, function (err, response, body) {
    callback(err, response, body)
  })
}

const addComments = function (data,requestedOptions,callback) {
  _.forEach(data, function (issue) {

    requestComments(issue.comments_url, requestedOptions, (error, response, body) => {


      JSONBody = JSON.parse(body)

      issue.comments_url=body

      callback(data)

    })


  })

}

//request for getting body with issues and convert it to JSON

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
        default:
          if (!argv.clone) logExceptOnTest(chalk.red('\nRepository have 0 issues. Nothing to download'))
          else (callback(err, response, JSObject))
      }
    } else {
      callback(err, response, JSObject)
    }
  })
}

// take JSON data, convert them into CSV format and return them

const convertJSonToCsv = exports.convertJSonToCsv = function (jsData) {
  return jsData.map(object => {
    const date = moment(object.created_at).format('L')
    const labels = object.labels
    const stringLabels = labels.map(label => label.name).toString()
    return `"${object.number}"; "${object.title.replace(/"/g, '\'')}"; "${object.html_url}"; "${stringLabels}"; "${object.state}"; "${date}"\n`
  }).join('')
}

// execute main function with requested options and condition for URL input

const execute = exports.execute = function (argvRepository) {
  if (argvRepository) {
    const issuesPerPage = 10

    const startUrl = `${makeAPIUrl(argvRepository)}/issues?per_page=${issuesPerPage}&state=all&page=1`

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

this.execute(argvRepository)