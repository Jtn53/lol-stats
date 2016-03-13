var express = require('express');
var router = express.Router();
var request = require('request');
var champions = require('./champions.js');
var teams = require('./teams.js');
var api_key = require('../api_key.js');

var api_url = 'https://na.api.pvp.net/api/lol/na';
var api_summoner_url = '/v1.4/summoner/by-name/';
var api_matchlist_url = '/v2.2/matchlist/by-summoner/';
var api_match_url = '/v2.2/match/';

module.exports = {
	
	getSummonerIdBySummonerName: function(summonerName, cb){		
		var getSummonerIdResponse;
		var summonerId;
		
		// Change name to lower case and remove spaces
		summonerName = summonerName.toLowerCase();
		summonerName = summonerName.replace(/\s+/g, '');
		
		// Return message if search is blank
		if (!summonerName){
			cb("Please enter a summoner's name");
		}
		
		request({
			url: api_url + api_summoner_url + summonerName,
			method: 'GET',
			qs: {'api_key': api_key }
		}, function processSummonerCallResponse(error, response, body){
			if (!error && response.statusCode == 200) 
			{ 
				getSummonerIdResponse = JSON.parse(body);
				summonerId = getSummonerIdResponse[summonerName].id;
				
				// return the summoner ID
				console.log("Found summoner information for: " + summonerName + " with summoner id: " + summonerId);
				cb(null, summonerId);
			}
			else if (response.statusCode == 404)
			{
				cb("Summoner " + summonerName+ " not found");
			}
			else
			{
				console.log("Error message: " + error);
				cb("Sorry! We are encountering technical difficulties. Please try again later!");
			}
		});
	},
	
	getMatchHistoryBySummonerId: function(summonerId, cb){
		var getMatchesResponse;
		var matches;
		
		request({
			url: api_url + api_matchlist_url + summonerId,
			method: 'GET',
			qs: {'api_key': api_key }
		}, function processMatchHistoryCallResponse (error, response, body){
			if (!error && response.statusCode == 200) 
			{ 
				getMatchesResponse = JSON.parse(body);
				console.log("Found match history");
				
				// Grab all the matches and convert the timestamp to Date and championIds to champion names
				if (getMatchesResponse['totalGames'] != 0)
				{
					matches = getMatchesResponse["matches"];
					
					// Go through all the matches and convert match timestamps to date, and match champion ids with names.
					// The matchesFound counter is needed so that we only return the match history once all matches are processed.
					var matchesFound = 0;
					matches.forEach(function(match){
						
						// convert match timestamp to Date
						match.timestamp = new Date(match.timestamp);
						
						// query db to match champion with championId
						champions.getChampionNameFromId(match.champion, function(championName){
							// replace the match's champion Id with a displayable champion Name
							match.champion = championName;
							
							matchesFound++;
							if (matchesFound == matches.length) {
								// Happy case scenario: return the summoner name and the whole match history
								console.log("Finished processing all matches!");
								cb(null, matches);
							}
						});
					});
				}
				else
				{
					// Match history found, but no games have been played
					cb("No match history found");
				}
			}
			else 
			{ 
				// Match history not found
				cb("No match history found");
			}
		});
	},
	
	getMatchDetailsByMatchId: function(matchId, cb){
		
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
				
				filterMatchDetails(getMatchResponse, function(match){
					cb(match);
				});
			}
			else 
			{ 
				console.log(error);
				res.render('index', { error_message : "Could not find match details" });
			}
		});
	}
};

/**
	filterMatchDetails() takes a match and returns two arrays: redTeamPlayers and blueTeamPlayers.
	Each array is filled with 'participants'.
	Each participant has 
	**/
filterMatchDetails = function(match, cb){
	// Participants has all the info we need except the participant's name (need to join with participantIdentities)
	var participants = match['participants'];
	
	// The only thing we need from participantIdentities is the participant's summonerName
	var participantIdentities = match['participantIdentities'];
	
	// Find the summoner names from participantIdentities and insert them into participants
	for (var i = 0; i < participants.length; i++) {
		for (var j = 0; j < participantIdentities.length; j++){
			if (participants[i].participantId == participantIdentities[j].participantId){
				// once we find a match, insert the participant's summoner name into the main participants array
				participants[i].summonerName = participantIdentities[j].player.summonerName;
				break;
			}
		}
	}
	
	// Replace the team id in match.teams with the team color
	match['teams'].forEach(function(team){
		teams.getTeamColorByTeamId(team.teamId, function(teamColor){
			team.color = teamColor;
		});
	});
	
	// Go through all the participants and add champion names and teamColor
	var participantCount = 0;
	participants.forEach(function(participant){
		champions.getChampionNameFromId(participant.championId, function(championName){
			
			// Add new field "champion" with new champion name
			participant.champion = championName;
			
			teams.getTeamColorByTeamId(participant.teamId, function(teamColor){
				console.log("Found teamColor: " + teamColor);
				participant.teamColor = teamColor;
				console.log("Added teamColor: " + participant.teamColor);
				
				// Callback once we've gone through all the participants
				participantCount++;
				if (participantCount == participants.length)
				{
					match['participants'] = participants;
					console.log("Teams: " + match['teams'].teamId + match['teams'].winner);
					cb(match);
				}
			});
		});
	});
}