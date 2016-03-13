# LoL Stats App

MEAN app that takes in a summoner name and returns their match history. You can then view the details of the match.

## Setup

### Installing Dependencies

Run the following when in the project root:

````
$ npm install
````

### Running

Open `http://localhost:3000` in your browser.

Create a file named "api_key.js" in the root directory that contains:

````
var api_key = '<Your personal LoL api key>'

module.exports = api_key;
````

