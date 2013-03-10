

var MongoClient = require('mongodb').MongoClient;
var fs = require("fs"); 
var tables = new Array('LocationProbe',
						'AccelerometerSensorProbe',
						'ActivityProbe',
						'CallLogProbe',
						'SMSProbe'); 
var wotk = require('./forward');

var location_data = new Array();
var accelerometer_data = new Array();
var activity_data = new Array();
var call_data = new Array();
var sms_data = new Array();

var loc_timer;
var accel_timer;
var activity_timer;
var call_timer;
var sms_timer;

exports.db = function(req,res){

	res.writeHead(200, {"Content-Type": "text/html"});
	res.write("DB!");
	res.end();

	MongoClient.connect("mongodb://localhost:27017/funftowotk", function(err, db) {
	  		if(err){
	  			console.log(err);
	  		}
			else console.log("connected!");

			//db.collection('locations', listAllData);			

			tables.forEach(function(table_name){
				//console.log(name);

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
	
	MongoClient.connect("mongodb://localhost:27017/funftowotk", function(err, db) {
	  		if(err){
	  			console.log(err);
	  		}
			else console.log("connected!");

			//db.collection('locations', listAllData);			

			tables.forEach(function(table_name){
				//console.log(name);
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
	var wait_time = 3000;

	db.collection(table).insert(rec,{safe:true},function(err,records){
		if(err){
			//console.log("Entry already inserted in DB");
		} 
		else{
			//console.log("Record added as "+records[0]._id);
			if(table=='LocationProbe'){

				location_data.push(records[0]);
				if(loc_timer) clearTimeout(loc_timer);	
				loc_timer = setTimeout(function(){
					wotk.format_data(location_data,table);
					db.close();
				},wait_time);

			}else if(table=='AccelerometerSensorProbe'){

				accelerometer_data.push(records[0]);
				if(accel_timer) clearTimeout(accel_timer);	
				accel_timer = setTimeout(function(){
					wotk.format_data(accelerometer_data,table);
					db.close();
				},wait_time);

			}else if(table=='ActivityProbe'){

				activity_data.push(records[0]);
				if(activity_timer) clearTimeout(activity_timer);	
				activity_timer = setTimeout(function(){
					wotk.format_data(activity_data,table);
					db.close();
				},wait_time);

			}else if(table=='CallLogProbe'){

				call_data.push(records[0]);
				if(call_timer) clearTimeout(call_timer);	
				call_timer = setTimeout(function(){
					wotk.format_data(call_data,table);
					db.close();
				},wait_time);

			}else if(table=='SMSProbe'){

				sms_data.push(records[0]);
				if(sms_timer) clearTimeout(sms_timer);	
				sms_timer = setTimeout(function(){
					wotk.format_data(sms_data,table);
					db.close();
				},wait_time);

			}
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

		callback('File Not Found!',null);

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

