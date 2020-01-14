# Git Issues Downloader

[![Build Status](https://travis-ci.org/remoteorigin/git-issues-downloader.svg?branch=master)](https://travis-ci.org/remoteorigin/git-issues-downloader)
[![codecov](https://codecov.io/gh/remoteorigin/git-issues-downloader/branch/master/graph/badge.svg)](https://codecov.io/gh/remoteorigin/git-issues-downloader)
[![npm version](https://badge.fury.io/js/git-issues-downloader.svg)](https://badge.fury.io/js/git-issues-downloader)

Command line application allowing you to download all issues in the CSV format from the public or private repository

## Requirements

- [Node.js](https://nodejs.org) `v12.13.0` (tested on versions `6`, `7`, `8` and `latest`)

## Installation

    npm install -g git-issues-downloader

## Usage

    git-issues-downloader <repository URL>

### Examples

Command prompt will ask for username and password credentials for GitHub

    git-issues-downloader https://github.com/remoteorigin/git-issues-downloader

If you do not need to authentication, simply hit enter for username and password.

Example with username and password

    git-issues-downloader -u <username> -p <username> https://github.com/remoteorigin/git-issues-downloader

The two-factor authentication is currently not supported.

## Development

### Project Setup

    git clone git@github.com:remoteorigin/git-issues-downloader.git
    cd git-issues-downloader
    npm install

### Run Project

    npm start

### Tests

All tests are are written in [Mocha](https://mochajs.org/) and stored in the `test` folder.

    npm run test

### Linting

Using [Standard](https://github.com/feross/standard) JavaScript linter & automatic code fixer.

    npm run lint

Automatically fix linting issues

    npm run lint:fix
