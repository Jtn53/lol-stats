var mongo = require('mongodb');
var monk = require('monk');
var db = monk('123456:123456@ds011429.mlab.com:11429/heroku_hr9pfj7b');

module.exports = {
	getChampionNameFromId: function(championId, cb) {
		var collection = db.get("champions");
		collection.findOne( {id: championId}, {}, function(error, championData) {
			var championName = championData.name;

			cb(championName);
		});
	}
};