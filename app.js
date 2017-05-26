const fs = require('fs')
const request = require('request')
const _ = require('lodash')
const moment = require('moment')
const read = require('read')
const chalk = require('chalk')
const argv = require('yargs')
  .usage('Usage: git-issues-downloader [options] URL')
  .help('help')
  .alias('help', 'h')
  .version()
  .alias('version', 'v')
  .default('filename', 'all_issues.csv')
  .describe('filename', 'Name of output file')
  .describe('username', 'Your username on github')
  .describe('password', 'Your password on github')
  .alias('filename', 'f')
  .argv

const outputFileName = argv.filename

//callback function for getting input from prompt

getAuth = function (auth, silent, callback) {
  read({prompt: `${auth}: `, silent: silent}, function (er, password) {
    callback(password)
  })
}

// callback function for getting requested options

exports.getRequestedOptions = function (username, password, callback) {
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

exports.main = function (data, url, requestedOptions) {
  this.requestBody(url, requestedOptions, (error, response, body) => {
    const linkObject = this.responseToObject(response.headers)

    // take body, parse it and add it to data

    data = _.concat(data, body)

    if (linkObject.nextPage) {
      console.log(chalk.green(`Successfully requested ${linkObject.nextPage.number - 1}. page of ${linkObject.lastPage.number}`))

      this.main(data, linkObject.nextPage.url, requestedOptions)
    } else {
      console.log(chalk.green('Successfully requested last page'))

      const csvData = this.convertJSonToCsv(data)

      this.writeData(csvData, outputFileName)
    }
  })
}

// get page url and page number from link

exports.getUrlAndNumber = function (link) {
  return {
    url: link.slice(link.indexOf('<') + 1, link.indexOf('>')),
    number: link.slice(link.indexOf('page', link.indexOf('state')) + 5, link.indexOf('>'))
  }
}

// create and return links info (page url and page number for all 4 links in response.headers.link) from whole response

exports.responseToObject = function (response) {
  const rawLink = response.link

  if (rawLink && rawLink.includes('next')) {
    const links = rawLink.split(',')

    return {
      nextPage: (links[0]) ? this.getUrlAndNumber(links[0]) : false,
      lastPage: (links[1]) ? this.getUrlAndNumber(links[1]) : false,
      firstPage: (links[2]) ? this.getUrlAndNumber(links[2]) : false,
      prevPage: (links[3]) ? this.getUrlAndNumber(links[3]) : false
    }
  }
  return false
}

// use url and request api

exports.requestBody = function (url, requestedOptions, callback) {
  console.log('Requesting API...')
  request(url, requestedOptions, function (err, response, body) {
    const JSObject = JSON.parse(body)

    if (!JSObject.length) {
      // switch for various error messages

      switch (JSObject.message) {
        case 'Not Found':
          console.log(chalk.red('\nWe didn\'t find any repository on this URL, please check it'))
          break
        case 'Bad credentials':
          console.log(chalk.red('\nYour username or password is invalid, please check it'))
          break
        default:
          console.log(chalk.red('\nRepository have 0 issues. Nothing to download'))
      }
    } else {
      callback(err, response, JSObject)
    }
  })
}

// take JSON data, convert them into CSV format and return them

exports.convertJSonToCsv = function (jsData) {

  console.log('\nConverting issues...')

  const csvData = jsData.map(object => {
    const date = moment(object.created_at).format('L')
    const labels = object.labels
    const stringLabels = labels.map(label => label.name).toString()
    return `"${object.number}"; "${object.title.replace(/"/g, '\'')}"; "${object.html_url}"; "${stringLabels}"; "${object.state}"; "${date}"\n`
  }).join('')

  console.log(chalk.green(`\mSuccessfully converted ${jsData.length} issues!`))

  return csvData
}

// create a new file and write converted data on him

exports.writeData = function (data, outputFileName) {
  console.log('\nWriting data to csv file')
  fs.writeFile(outputFileName, data, (err) => {
    if (err) throw err

    console.log(chalk.yellow(`\nIssues was downloaded, converted and saved to ${outputFileName}`))
  })
}

//execute main function with requested options and condition for URL input

exports.execute = function (argvRepository) {
  if (argvRepository) {
    const issuesPerPage = 100
    const repoUserName = argvRepository.slice(19, argvRepository.indexOf('/', 19))
    const repoUrl = (argvRepository.slice(20 + repoUserName.length, argvRepository.lastIndexOf('/'))) ? argvRepository.slice(20 + repoUserName.length, argvRepository.lastIndexOf('/')) : argvRepository.slice(20 + repoUserName.length)

    const startUrl = `https://api.github.com/repos/${repoUserName}/${repoUrl}/issues?per_page=${issuesPerPage}&state=all&page=1`

    this.getRequestedOptions(argv.username, argv.password, (requestedOptions) => {
      this.main([], startUrl, requestedOptions)
    })

  }
  else {
    console.log('Usage: git-issues-downloader [options] URL')
  }

}

const argvRepository = argv._[argv._.length - 1]

this.execute(argvRepository)

