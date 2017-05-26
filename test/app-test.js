const chai = require('chai')
const expect = chai.expect
const assert = chai.assert

const request = require('request')
const sinon = require('sinon')

const app = require('../app.js')
const dummyData = require('./dummy-data')

const responseToObject = app.responseToObject(dummyData.apiResponse)
const getRequestedOptions = app.getRequestedOptions
const requestBody = app.requestBody
const convertJsonToCsv = app.convertJSonToCsv
const writeData = app.writeData
const main = app.main

describe('downloadGitIssues', function () {
  describe('Get URL and Number', function () {
    const getUrlAndNumberObject = app.getUrlAndNumber(dummyData.nextPageLink)

    it('should return url', function () {
      assert.equal(getUrlAndNumberObject.url, 'https://api.github.com/repositories/90146723/issues?per_page=10&state=all&page=2')
    })

    it('should return page number', function () {
      assert.equal(getUrlAndNumberObject.number, '2')
    })
  })

  describe('Response To Object', function () {
    it('should return url of next page', function () {
      assert.equal(responseToObject.nextPage.url, 'https://api.github.com/repositories/90146723/issues?per_page=10&state=all&page=2')
    })
  })

  describe('getRequestedOptions', function () {
    it('should return object with username and password', function () {
      getRequestedOptions('username', 'password', dummyData.nextPageLink, (done) => {
        expect(done).to.deep.equal(dummyData.requestOptions)
      })
    })
  })

  describe('convertJSONToCsv', function () {
    it('should return converted issues 21', function () {
      const result = convertJsonToCsv(dummyData.JSONdata21)

      expect(result).to.deep.equal(dummyData.issuesResult21)
    })

    it('should return converted issues 20', function () {
      const result = convertJsonToCsv(dummyData.JSONdata20)

      expect(result).to.deep.equal(dummyData.issuesResult20)
    })
  })
  describe('requestedBody = suggested output', function () {
    before(function () {
      sinon
        .stub(request, 'get')
        .yields(null, null, JSON.stringify(dummyData.testIssue))
    })

    after(function () {
      request.get.restore()
    })

    it('should be called with requested options', function () {
      requestBody('', (error, response, body) => {
        expect(body).not.be.empty
      })
    })
  })
  describe('requestedBody = bad url', function () {
    before(function () {
      sinon
        .stub(request, 'get')
        .yields(null, null, JSON.stringify(dummyData.bodyForBadUrl))
    })

    after(function () {
      request.get.restore()
    })

    it('should invoke error message for bad URL', function () {
      requestBody('', (error, response, body) => {
      })
    })
  })
  describe('writeData', function () {
    it('should create file with data', function () {

      })
    })

})
