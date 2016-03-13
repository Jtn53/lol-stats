var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/championtest');

module.exports = {
	getChampionNameFromId: function(championId, cb) {
	  var collection = db.get("champions");
		collection.findOne( {id: championId}, {}, function(error, championData) {
			var championName = championData.name;
			cb(championName);
		});
	}
};