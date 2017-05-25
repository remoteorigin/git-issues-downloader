const chai = require('chai')
const expect = chai.expect
const assert = chai.assert

const request = require('request')
// const sinon = require('sinon')

const modules = require('./modules.js')
const dummyData = require('./dummyData')

const responseToObject = modules.responseToObject(dummyData.apiResponse)
const getRequestedOptions = modules.getRequestedOptions
const requestBody = modules.requestBody
const convertJsonToCsv = modules.convertJSonToCsv
const writeData = modules.writeData
const main = modules.main

describe('downloadGitIssues', function () {
  describe('Get URL and Number', function () {
    const getUrlAndNumberObject = modules.getUrlAndNumber(dummyData.nextPageLink)

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
      getRequestedOptions('username', 'password', (done) => {
        expect(done).to.deep.equal(dummyData.testRequestOptions)
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
  // describe('User Profile', function(){
  //   before(function(){
  //     sinon
  //       .stub(request, 'get')
  //       .yields(null, null, JSON.stringify({username: "username"},{password:"password"}));
  //   });
  //
  //   after(function(){
  //     request.get.restore();
  //   });
  //
  //   it('can get user profile', function(done){
  //     requestBody('bulkan', function(err, result){
  //       if(err) return done(err);
  //
  //       // simple should.js assertion
  //       result.should.not.be.empty;
  //       done();
  //     });
  //   });
  // });
})
