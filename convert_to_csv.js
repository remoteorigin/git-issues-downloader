const fs = require('fs')

const moment = require('moment')

const inputFileName = 'all_issues.json'
const outputFileName = 'all_issues.csv'

fs.readFile(inputFileName, 'utf8', (err, data) => {
  if (err) throw err

  jsData = JSON.parse(data)

  const csvData = jsData.map(object => {
    const date = moment(object.created_at).format('L')
    const labels = object.labels
    const stringLabels = labels.map(label => label.name).toString()

    // console.log(object)

    return `"${object.number}"; "${object.title.replace(/"/g, '\'')}"; "${object.html_url}"; "${stringLabels}"; "${object.state}"; "${date}"`
  }).join('\n')

  console.log(csvData)

  fs.writeFile(outputFileName, csvData, (err) => {
    if (err) throw err
    console.log(`\nSUCCESS!\n${inputFileName} converted and saved to ${outputFileName}`)
  })

})
