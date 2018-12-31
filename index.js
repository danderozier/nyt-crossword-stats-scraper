const args = require('minimist')(process.argv.slice(2))



if (!args['key']) {
  console.error('Parameter `key` is required')
  process.exit(1)
}
else if (!args['start']) {
  console.error('Parameter `start` is required, e.g. `--start 2010-01-01`')
  process.exit(1)
}

const colors = require('colors'),
      moment = require('moment'),
      axios = require('axios'),
      Bottleneck = require("bottleneck/es5"),
      csvWriter = require('csv-writer').createObjectCsvWriter({
        path: args['out'] || 'results.csv',
        header: [
          { id: 'puzzleId', title: 'Puzzle ID' },
          { id: 'puzzleDate', title: 'Puzzle Date' },
          { id: 'secondsSpentSolving', title: 'Seconds Spent Solving' },
          { id: 'firstOpened', title: 'First Opened' },
          { id: 'firstSolved', title: 'First Solved' }
        ]
      })

// Set range
const range = {
  start: moment(args['start']),
  end: (args['end'] ? moment(args['end']) : moment())
}

/**
 *  A handy way to safely access deeply nested values.
 *  Source: https://medium.com/javascript-inside/safely-accessing-deeply-nested-values-in-javascript-99bf72a0855a
**/
const get = (p, o) =>
  p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 100
});

do {
  var dateStart = range.start.format('YYYY-MM-DD');
  var dateEnd = range.start.clone().add(30, 'days').format('YYYY-MM-DD');

  var headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.5',
    'cache-control': 'no-cache',
    'connection': 'keep-alive',
    'dnt': '1',
    'nyt-s': args['key'],
    'origin': 'https://www.nytimes.com',
    'pragma': 'no-cache',
    'referer': 'https://www.nytimes.com/crosswords/archive',
    'te': 'Trailers',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:64.0) Gecko/20100101 Firefox/64.0',
  }

  axios.request({
    url: 'https://nyt-games-prd.appspot.com/svc/crosswords/v3/puzzles.json',
    params: {
      publish_type: 'daily',
      sort_order: 'asc',
      sort_by: 'print_date',
      date_start: dateStart,
      date_end: dateEnd
    },
    headers: headers
  }).then(function (response) {
    for(i = 0; i < response.data.results.length; i++) {

      const puzzle_id = response.data.results[i].puzzle_id
      const puzzle_date = response.data.results[i].print_date

      limiter.schedule(() => axios.request({
        url: 'https://nyt-games-prd.appspot.com/svc/crosswords/v6/game/' + puzzle_id + '.json',
        headers: headers
      }).then(function(response) {

        if(response.data && get(['data', 'firsts', 'opened'], response)) {
          const puz = {
            puzzleId: puzzle_id,
            puzzleDate: puzzle_date,
            secondsSpentSolving: get(['data', 'calcs', 'secondsSpentSolving'], response),
            firstOpened: get(['data', 'firsts', 'opened'], response),
            firstSolved: get(['data', 'firsts', 'solved'], response),
            firstRevealed: get(['data', 'firsts', 'revealed'], response),
            solved: get(['data', 'calcs', 'solved'], response) || false
          }
          csvWriter.writeRecords([puz]).then(() => {
            console.log(colors.green('Record with id ' + puzzle_id + ' (' + puzzle_date + ') written'))
          })
        }
        else {
          console.log(colors.red('Record with id ' + puzzle_id + ' (' + puzzle_date + ') skipped'))
        }

      }).catch(error => {

        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          // console.log(error.response.data);
          console.log('Error', error.response.status);
          // console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log('Error', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        // console.log(error.config);

      }))
    }

  }).catch(error => {
    console.log(error)
  })

} while (range.start.add(30, 'days').isBefore(range.end));
