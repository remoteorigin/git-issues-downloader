const read = require('read')
const trashData = require('./dummyData')
const fs = require('fs')
const request = require('request')
const _ = require('lodash')
const moment = require('moment')
const chalk = require('chalk')

module.exports = {

  getRequestedOptions: function (username, password, callback) {

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

  },

  main: function (data, url, requestedOptions) {

    this.requestBody(url, requestedOptions, (error, response, body) => {

      const linkObject = this.responseToObject(response)

      data = _.concat(data, body)

      if (linkObject.nextPage) {

        console.log(chalk.green(`Successfully requested ${linkObject.nextPage.number - 1}. page of ${linkObject.lastPage.number}`))

        main(data, linkObject.nextPage.url, requestedOptions)
      }
      else {
        console.log(chalk.green('Successfully requested last page'))

        this.writeData(convertJSonToCsv(error, data), outputFileName)
      }

    })
  },

  getUrlAndNumber: function (link) {
    return {
      url: link.slice(link.indexOf('<') + 1, link.indexOf('>')),
      number: link.slice(link.indexOf('page', link.indexOf('state')) + 5, link.indexOf('>'))
    }
  },

  responseToObject: function (response) {

    const rawLink = response.link

    if (rawLink && rawLink.includes('next')) {
      const links = rawLink.split(',')

      let linksInfo = {
        nextPage: (links[0]) ? this.getUrlAndNumber(links[0]) : false,
        lastPage: (links[1]) ? this.getUrlAndNumber(links[1]) : false,
        firstPage: (links[2]) ? this.getUrlAndNumber(links[2]) : false,
        prevPage: (links[3]) ? this.getUrlAndNumber(links[3]) : false,
      }

      return linksInfo
    }
    return false
  },

  requestBody: function (url, requestedOptions, callback) {
    console.log('Requesting API...')
    request(url, requestedOptions, function (err, response, body) {
          console.log("test")
      const JSObject = JSON.parse(body)


      if (!JSObject.length) {

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
  },

  convertJSonToCsv: function (jsData) {

    //console.log('\nConverting issues...')

    const csvData = jsData.map(object => {
      const date = moment(object.created_at).format('L')
      const labels = object.labels
      const stringLabels = labels.map(label => label.name).toString()
      return `"${object.number}"; "${object.title.replace(/"/g, '\'')}"; "${object.html_url}"; "${stringLabels}"; "${object.state}"; "${date}"\n`
    }).join('')

    //console.log(chalk.green(`Successfully converted ${jsData.length} issues!`))

    return csvData


  },

  writeData: function (data, outputFileName) {
    console.log('\nWriting data to csv file')
    fs.writeFile(outputFileName, data, (err) => {
      if (err) throw err

      console.log(chalk.yellow(`\nIssues was downloaded, converted and saved to ${outputFileName}`))
    })
  }

}