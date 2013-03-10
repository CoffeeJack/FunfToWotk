
/*
 * GET home page.
 */
var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var $ = require('jquery');

exports.index = function(req, res){

 	res.render('index', { title: 'FunF to the WoTKit' });
 	
};

