# Git Issues Downloader

Command line application allowing you to download all issues in the CSV format from the public or private repository

[![Build Status](https://travis-ci.org/remoteorigin/git-issues-downloader.svg?branch=master)](https://travis-ci.org/remoteorigin/git-issues-downloader)
[![codecov](https://codecov.io/gh/remoteorigin/git-issues-downloader/branch/master/graph/badge.svg)](https://codecov.io/gh/remoteorigin/git-issues-downloader)
[![npm version](https://badge.fury.io/js/git-issues-downloader.svg)](https://badge.fury.io/js/git-issues-downloader)

## Requirements

- [Node.js](https://nodejs.org) `v8.10.0 LTS` (tested on versions `6`, `7`, `8` and `latest`)
- [Yarn](https://yarnpkg.com) `latest`

## Installation

Via `npm`

    npm install -g git-issues-downloader

Via `yarn`

    yarn global add git-issues-downloader

## Ussage

    git-issues-downloader <repository URL>

### Examples

Command prompt will ask for username and password credentials for GitHub

    git-issues-downloader https://github.com/remoteorigin/git-issues-downloader

Example with username and password

    git-issues-downloader -u <username> -p <username> https://github.com/remoteorigin/git-issues-downloader

## Development

### Project Setup

    git clone git@github.com:remoteorigin/git-issues-downloader.git
    cd git-issues-downloader
    yarn install

### Run Project

    yarn start

### Tests

All tests are are written in [Mocha](https://mochajs.org/) and stored in the `test` folder.

    yarn test

### Linting

Using [Standard](https://github.com/feross/standard) JavaScript linter & automatic code fixer.

    yarn lint

Automaticaaly fix linting issues

    yarn lint:fix
