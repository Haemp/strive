'use strict';
var request = require('request');

describe('API: User', function() {

	describe('POST /api/users', function(){
		it("Should return a list of all users", function(done) {
			request.post("http://localhost:3000/api/users", function(error, response, body){
				expect(body).toEqual("hello world");
				done();
			});
		});
	})

	describe('GET /api/users', function(){
		it("Should return a list of all users", function(done) {
			request("http://localhost:3000/api/users", function(error, response, body){
				expect(body).toEqual("hello world");
				done();
			});
		});
	})
});
