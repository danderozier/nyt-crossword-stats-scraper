# NYT Crossword Stats Scraper

Scrape your NYT crossword puzzle times into a CSV.

## Usage

`node index.js --key <jwt key> --start 2018-01-01 --out 2018-12-31 --out output.csv`

**--key**

Required. A working JWT key from your NYT login.

**--start**

Required. The date to start pulling stats, formatted as yyyy-mm-dd.

**--end**

The date to stop pulling stats. Default is today.

**--out**

Specify output file. Default is results.csv.
