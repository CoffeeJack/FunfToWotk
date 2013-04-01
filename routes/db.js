

var MongoClient = require('mongodb').MongoClient;
var config = require('./config');
var fs = require("fs"); 
var wotk = require('./forward');

var data_array = {};
var timers = {};

exports.db = function(req,res){

	res.writeHead(200, {"Content-Type": "text/html"});
	res.write("DB!");
	res.end();

	MongoClient.connect("mongodb://localhost:"+config.DB_PORT+"/"+config.DB_NAME, function(err, db) {
	  		if(err){
	  			console.log(err);
	  		}
			else console.log("connected!");

			//db.collection('locations', listAllData);			
			var tables = config.LIST_OF_PROBES;

			tables.forEach(function(table_name){
				//console.log(name);

				//data_array[table_name] = new Array();

				parseCsvFile('./'+table_name+'.csv',function(err,rec){

					if(!err){
						//console.log(rec);

						insertData(db,table_name,rec);
					}else{
						console.log(err);
					}
					
				});
			});


	});

};


exports.save_data_to_db = function(){
	
	MongoClient.connect("mongodb://localhost:"+config.DB_PORT+"/"+config.DB_NAME, function(err, db) {
	  		if(err){
	  			console.log(err);
	  		}
			else console.log("connected!");

			//db.collection('locations', listAllData);			
			var tables = config.LIST_OF_PROBES;

			tables.forEach(function(table_name){
				//console.log(name);

				//data_array[table_name] = new Array();

				parseCsvFile('./'+table_name+'.csv',function(err,rec){

					if(!err){
						//console.log(rec);

						insertData(db,table_name,rec);
					}else{
						console.log(err);
					}
					
				});
			});

	});
}

function insertData(db,table,rec){
	//console.log(rec);

	db.collection(table).insert(rec,{safe:true},function(err,records){
		if(err){
			//console.log("Entry already inserted in DB");
		} 
		else{
			//console.log("Record added as "+records[0]._id);

			//stash on array to send			
			if(typeof data_array[table]==='undefined') data_array[table] = new Array();				
			data_array[table].push(records[0]);

			//Set timer
			if(timers[table]){
				clearTimeout(timers[table]);
				//console.log("clear");
			}
			timers[table] = setTimeout(function(){
				wotk.format_data(data_array[table],table);
				//console.log("timed out!");

				//garbage collection
				data_array[table] = new Array();
				timers[table] = null;
				db.close();
			},config.DB_INSERTION_DELAY);

		} 
	});
}
 
var removeData = function(err, collection) {
//collection.remove({name: "Spiderman"});
}
 
var updateData = function(err, collection) {
//collection.update({name: "Kristiono Setyadi"}, {name: "Kristiono Setyadi", sex: "Male"});
}
 
var listAllData = function(err, collection) {
	collection.find().toArray(function(err, results) {
		console.log(results);
	});
}

function parseCsvFile(fileName, callback){

	var stream = fs.createReadStream(fileName,{encoding:'utf-8'})

	stream.on('error',function(err){

		callback('File: '+fileName+' Not Found!',null);

	});

	var iteration = 0, header = [], buffer = ""
	var pattern = /(?:^|,)("(?:[^"]+)*"|[^,]*)/g

	stream.addListener('data', function(data){

		buffer+=data.toString()

		var parts = buffer.split('\r\n')

		parts.forEach(function(d, i){

			if(i == parts.length-1) return;
			if(iteration++ == 0 && i == 0){
				header = d.split(pattern)
			}else{
				callback(null,buildRecord(d))
			}

		})

		buffer = parts[parts.length-1]
	})
	 
	function buildRecord(str){
		var record = {}
		str.split(pattern).forEach(function(value, index){
		if(header[index] != '')

			//ADDED: Feb 19th, 2013
			//Weird character found, changing it back to 'id'
			if(header[index].indexOf("id") === 1) header[index] = '_id';

			if(header[index].indexOf("\r") !== -1){
				header[index] = header[index].replace("\r",'');
				//console.log(header[index]);
			}

			if(value.indexOf("\r") !== -1){
				value = value.replace("\r",'');
			}

			record[header[index].toLowerCase()] = value.replace(/"/g, '')
		})
		return record
	}
}

