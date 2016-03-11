var express = require('express');
var router = express.Router();
var request = require('request');

var api_url = 'https://na.api.pvp.net/api/lol/na';
var api_key = 'cd2ecdbe-43d2-4ead-98ee-071630568046';
var api_summoner_url = '/v1.4/summoner/by-name/';
var api_matchlist_url = '/v2.2/matchlist/by-summoner/';
var api_match_url = '/v2.2/match/';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET to search summoner service */
router.get('/searchsummoner*', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var summonerName = req.query.summonername;
	var getSummonerIdResponse;
	var getMatchesResponse;
	var summonerId;
	var matches;
	
	// Call LoL API to get the summoner's ID 
	request({
		url: api_url + api_summoner_url + summonerName,
		method: 'GET',
		qs: {'api_key': api_key }
	}, function (error, response, body){
		if (!error && response.statusCode == 200) 
		{ 
			getSummonerIdResponse = JSON.parse(body);
			summonerId = getSummonerIdResponse[summonerName].id;
			
			// Call LoL API to get the summoner's match history
			request({
				url: api_url + api_matchlist_url + summonerId,
				method: 'GET',
				qs: {'api_key': api_key }
			}, function (error, response, body){
				if (!error && response.statusCode == 200) 
				{ 
					getMatchesResponse = JSON.parse(body);
					matches = getMatchesResponse['matches'];
					
					matches.forEach(function(match){
						match.timestamp = new Date(match.timestamp);
					});
					
					res.render('index', { 
						summoner_name : summonerName,
						matches : matches
					});
					
				}
				else 
				{ 
					console.log(error);
					res.render('index', { error_message : "Could not find match history" });
				}
			});
		}
		else 
		{ 
			console.log(error);
			res.render('index', { error_message : "Could not find summoner" });
		}
	});
});

/* GET match */
router.get('/getmatch*', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var matchId = req.query.matchId;
	var getMatchResponse;
	
	// Call LoL API to get match details
	request({
		url: api_url + api_match_url + matchId,
		method: 'GET',
		qs: {'api_key': api_key }
	}, function (error, response, body){
		if (!error && response.statusCode == 200) 
		{ 
			getMatchResponse = JSON.parse(body);
			
			//TODO: Want to show the following:
			// Show all players by team, show which team won
			// By player, show champion, level, KDA, CS, items, 
			
			var participantIdentities = getMatchResponse['participantIdentities'];
			var participants = getMatchResponse['participants'];
			
			var teamIds = getMatchResponse['teams'];
			
			// Find the summoner names from participantIdentities and insert them into participants
			for (var i = 0; i < participants.length; i++) {
				for (var j = 0; j < participantIdentities.length; j++){
					if (participants[i].participantId == participantIdentities[j].participantId){
						// once we find a match, insert the participant's summoner name into the main participants array
						participants[i].summonerName = participantIdentities[j].player.summonerName;
					}
				}
			}
			
			// need to match participants with their teams
			var redTeamPlayers = new Array();
			participants.forEach(function(participant){
				if(participant.teamId == "200")
				{
					redTeamPlayers.push(participant);
				}
			});
			
			var blueTeamPlayers = new Array();
			participants.forEach(function(participant){
				if(participant.teamId == "100")
				{
					blueTeamPlayers.push(participant);
				}
			});
			
			res.render('index', { 
				match_found : true,
				match_id : matchId,
				red_team : redTeamPlayers,
				blue_team : blueTeamPlayers
			});
		}
		else 
		{ 
			console.log(error);
			res.render('index', { error_message : "Could not find match details" });
		}
	});
});

module.exports = router;
