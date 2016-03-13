var express = require('express');
var router = express.Router();
var request = require('request');
var logic = require('../models/logic.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET to search summoner service */
router.get('/searchsummoner*', function(req, res) {
	
	// Get the summoner's ID from the provided summoner name
	logic.getSummonerIdBySummonerName(req.query.summonername, function(error, summonerId){
		if (error)
		{
			res.render('index', { error_message : error });
		}
		else
		{
			// Get the summoner's match history using the summoner ID that we just got
			logic.getMatchHistoryBySummonerId(summonerId, function(error, matches) {
				if (error)
				{
					res.render('index', { error_message : error });
				}
				else
				{
					// Happy case scenario: return the summoner name and the match list
					console.log("Finished grabbing match history! Returning to index...");
					res.render('index', { 
						summoner_name : req.query.summonername,
						matches : matches
					});
				}
			});
		}
	});
});

/* GET match */
router.get('/getmatch*', function(req, res) {
	// Get the match details from the provided match ID
	logic.getMatchDetailsByMatchId(req.query.matchId, function(match){
		res.render('index', { 
			match_found : true,
			match_id : req.query.matchId,
			match : match,
		});
	});
});

module.exports = router;
