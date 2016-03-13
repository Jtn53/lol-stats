var mongo = require('mongodb');
var monk = require('monk');
var db = monk('123456:123456@ds011429.mlab.com:11429/heroku_hr9pfj7b');

module.exports = {
	getTeamColorByTeamId: function(teamId, cb) {
		var collection = db.get("teams");
		collection.findOne( {id: teamId}, {}, function(error, teamData) {
			var teamColor = teamData.color;
			cb(teamColor);
		});
	}
};