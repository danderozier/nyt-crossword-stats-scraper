# NYT Crossword Stats Scraper

Scrape your NYT crossword puzzle times into a CSV.

## Usage

`node index.js --key <jwt key> --start 2018-01-01 --end 2018-12-31 --out results.csv`

**--key**

Required. A working JSON Web Token (JWT) from your NYT login (see below)

**--start**

Required. The date to start pulling stats, formatted as yyyy-mm-dd.

**--end**

The date to stop pulling stats. Default is today.

**--out**

Specify output file. Default is results.csv.

## Finding your JWT

Your JWT can be found by inspecting your network requests while logged in to the web version of the New York Times Crossword website. Specific instructions differ by browser, but generally the steps are:

1. Visit nytimes.com/crossword with your browser's developer tools open to the Network tab.
2. Log in to your account, or refresh the page.
3. In the Network tab, filter the list of requests by json, and look for a request like `progress.json`, `mini-stats.json`, or `hub.json`.
4. Inspect the request parameters and look for the `nyt-s` param. This is your JWT key.
