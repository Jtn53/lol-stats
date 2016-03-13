var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/championtest');

module.exports = {
	getTeamColorByTeamId: function(teamId, cb) {
	  var collection = db.get("teams");
		collection.findOne( {id: teamId}, {}, function(error, teamData) {
			var teamColor = teamData.color;
			cb(teamColor);
		});
	}
};