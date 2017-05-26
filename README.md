[![Build Status](https://travis-ci.org/remoteorigin/git-issues-downloader.svg?branch=master)](https://travis-ci.org/remoteorigin/git-issues-downloader)
[![codecov](https://codecov.io/gh/remoteorigin/git-issues-downloader/branch/master/graph/badge.svg)](https://codecov.io/gh/remoteorigin/git-issues-downloader)

# Git Issues Downloader

> Command line application allowing you to download all issues in the CSV format from the public or private repository

## Requirements

- [Node.js](https://nodejs.org) (`v6.10.3 LTS`)
- [Yarn](https://yarnpkg.com) (for development)

## Usage

### Install app globally

    npm install -g git-issues-downloader

### Running the app

    git-issues-downloader <repository URL>

## Development

### Project Setup

    git clone git@github.com:remoteorigin/git-issues-downloader.git
    cd git-issues-downloader
    yarn install

### Run Project

    yarn start

### Tests

All tests are are written in [Mocha](https://mochajs.org/) and stored in the `test` folder.

    yarn run test

### Lintining

Using [Standard](https://github.com/feross/standard) JavaScript linter & automatic code fixer.

    yarn run lint