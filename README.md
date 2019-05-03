# Git Issues Downloader

[![Build Status](https://travis-ci.org/remoteorigin/git-issues-downloader.svg?branch=master)](https://travis-ci.org/remoteorigin/git-issues-downloader)
[![codecov](https://codecov.io/gh/remoteorigin/git-issues-downloader/branch/master/graph/badge.svg)](https://codecov.io/gh/remoteorigin/git-issues-downloader)
[![npm version](https://badge.fury.io/js/git-issues-downloader.svg)](https://badge.fury.io/js/git-issues-downloader)
[![Greenkeeper badge](https://badges.greenkeeper.io/remoteorigin/git-issues-downloader.svg)](https://greenkeeper.io/)

Command line application allowing you to download all issues in the CSV format from the public or private repository

## Requirements

- [Node.js](https://nodejs.org) `v10.15.0 LTS` (tested on versions `6`, `7`, `8` and `latest`)

## Installation

    npm install -g git-issues-downloader

## Usage

    git-issues-downloader <repository URL>

## Usage via npx

    npx git-issues-downloader <repository URL>

### Examples

Command prompt will ask for username and password credentials for GitHub

    git-issues-downloader https://github.com/remoteorigin/git-issues-downloader

Example with username and password

    git-issues-downloader -u <username> -p <username> https://github.com/remoteorigin/git-issues-downloader

Example with additional parameters/filters 

    git-issues-downloader https://github.com/remoteorigin/git-issues-downloader -a "&state=open&labels=bug,ui,@high"

Additional params to filter the issues returned can be found here: https://developer.github.com/v3/issues/#parameters-1 

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
