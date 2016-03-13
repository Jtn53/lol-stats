# LoL Stats App

MEAN app that takes in a summoner name and returns their match history. You can then view the details of the match.

## Setup

### Installing Dependencies

Run the following when in the project root:

````
$ npm install
````

### Running

`http://localhost:3000`

### Missing key.js

A file `key.js` has been purposely ignored, which contains a personal developer 
key. To run yourself, create said file in `server/api`, containing the following
code:

````
var key = <Steam API Key Here>;

module.exports = key;
````
An API key can be found here: http://steamcommunity.com/dev/apikey