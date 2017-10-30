const chai = require('chai')
const expect = chai.expect
const assert = chai.assert

const request = require('request')
const sinon = require('sinon')

const app = require('../app.js')
const dummyData = require('./dummy-data')

const getRequestedOptions = app.getRequestedOptions
const convertJsonToCsv = app.convertJSonToCsv
const main = app.main

describe('downloadGitIssues', function () {
  process.env.NODE_ENV = 'test'
  describe('getUrlAndNumber', function () {
    const getUrlAndNumberObject = app.getUrlAndNumber(dummyData.nextPageLink)

    it('return url', function () {
      assert.equal(getUrlAndNumberObject.url, 'https://api.github.com/repositories/90146723/issues?per_page=10&state=all&page=2')
    })

    it('return page number', function () {
      assert.equal(getUrlAndNumberObject.number, '2')
    })
  })

  describe('responseToObject', function () {
    it('return url of next page', function () {
      assert.equal(app.responseToObject(dummyData.apiResponse).nextPage.url, 'https://api.github.com/repositories/90146723/issues?per_page=10&state=all&page=2')
    })
  })

  describe('getRequestedOptions', function () {
    it('return object with username and password', function () {
      getRequestedOptions('username', 'password', dummyData.nextPageLink, (done) => {
        expect(done).to.deep.equal(dummyData.requestOptions)
      })
    })
  })

  describe('convertJSONToCsv', function () {
    it('return converted issues without label', function () {
      const result = convertJsonToCsv(dummyData.JSONdata21)

      expect(result).to.deep.equal(dummyData.issuesResult21)
    })

    it('return converted issues with label', function () {
      const result = convertJsonToCsv(dummyData.JSONdata20)

      expect(result).to.deep.equal(dummyData.issuesResult20)
    })
  })
  describe('requestedBody (successful request)', function () {
    before(function () {
      sinon
        .stub(request, 'get')
        .yields(null, null, JSON.stringify(dummyData.testIssue))
    })

    after(function () {
      request.get.restore()
    })

    it('called body with requested options', function () {
      app.requestBody('', (error, response, body) => {
        expect(body).not.be.empty
      })
    })
  })
  describe('requestedBody (URL not found)', function () {
    before(function () {
      sinon
        .stub(request, 'get')
        .yields(null, null, JSON.stringify(dummyData.bodyForBadUrl))
    })

    after(function () {
      request.get.restore()
    })

    it('invoke error message for bad URL', function () {
      app.requestBody('', (error, response, body) => {
      })
    })
  })
  describe('requestedBody (Bad Credentials)', function () {
    before(function () {
      sinon
        .stub(request, 'get')
        .yields(null, null, JSON.stringify(dummyData.bodyForBadCredentials))
    })

    after(function () {
      request.get.restore()
    })

    it('invoke error message for Bad Credentials', function () {
      app.requestBody('', (error, response, body) => {
      })
    })
  })
  describe('main', function () {
    before(function () {
      sinon
        .stub(request, 'get')
        .yields(null, dummyData.response2Page, JSON.stringify(dummyData.testIssues))
    })

    after(function () {
      request.get.restore()
    })

    it('successful execute all function', function () {
      const main = sinon.spy()

      main([], dummyData.requestedOptions)

      assert(main.calledOnce)
    })
  })
})
