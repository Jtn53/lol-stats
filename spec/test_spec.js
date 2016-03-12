var request = require("request");

describe("Search player", function() {
	
	describe("GET / valid player with matches played", function() {
		it("returns status code 200 and list of matches", function(){
			request.get("http://localhost:3000/searchsummoner?summonername=stryderjzw", function(error, response, body){
				expect(response.statusCode).toBe(200);
				expect(body.matches).toBeDefined();
				done();
			});
		});
	});
});