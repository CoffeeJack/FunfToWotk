var http = require('http');
var forward = require('./forward');
var async = require('async');
var WoTK_ID = 'coffeejack';
var MongoClient = require('mongodb').MongoClient;

exports.forward = function(req,res){

	var sensor_name = 'MySensor';
	var device = '63316158-7ad9-4b39-9836-8c51e5e3d275';

	var body = { timestamp:'2012-12-12T03:34:28.636Z',
				 value:'55',
				 lng:'-130',
				 lat:'-42'

	};

	var bodyJSON = '['+JSON.stringify(body)+']';

	//console.log(bodyJSON);

	var headers = {
	  'Content-Type': 'application/json',
	  'Content-Length' : bodyJSON.length
	};

	var options = {
	  host: '142.103.25.37',
	  port: 80,
	  path: '/api/sensors/'+WoTK_ID+'.'+sensor_name.toLowerCase()+'_'+device+'/data',
	  auth: '9c4389eae0f94004:af092d74889edf2c',
	  method: 'PUT',
	  headers: headers
	};

	var webservice_data = "";

    var webservice_request = http.request(options, function(webservice_response)
	{
	    webservice_response.on('error', function(e){ 
	    	console.log(e.message); 
	    });
	    webservice_response.on('data', function(chunk){
	     	webservice_data += chunk;
	    });
	    webservice_response.on('end', function(){
	    	res.send(webservice_data);
	    });

	    if(webservice_response.statusCode==404){
	    	console.log("sensor not found!");

	    	add_new_sensor(sensor_name,device);
	    	// setTimeout(function(){
	    	// 	forward.forward();
	    	// },10000);
	    }
	});

	webservice_request.write(bodyJSON);
	webservice_request.end();

};

function add_new_sensor(type,device){

	var body = { private:false,
				 name: type.toLowerCase()+'_'+device,
				 description: type.toUpperCase(),
				 longName: type.toUpperCase(),
				 latitude: 0,
				 longitude:0

	};

	var bodyJSON = JSON.stringify(body);

	var headers = {
	  'Content-Type': 'application/json',
	  'Content-Length' : bodyJSON.length
	};

	var options = {
	  host: '142.103.25.37',
	  port: 80,
	  path: '/api/sensors',
	  auth: '9c4389eae0f94004:af092d74889edf2c',
	  method: 'POST',
	  headers: headers
	};

	var webservice_data = "";

    var webservice_request = http.request(options, function(webservice_response)
	{
	    webservice_response.on('error', function(e){ 
	    	console.log(e.message); 
	    });
	    webservice_response.on('data', function(chunk){
	     	webservice_data += chunk;
	    });
	    webservice_response.on('end', function(){
	    	//res.send(webservice_data);
	    });
	});

	webservice_request.write(bodyJSON);
	webservice_request.end();	
}

exports.format_data = function(data,type){
	
	var timeout_duration = 3000;
	var device_list = new Array();
	var num_of_devices = 10;
	var data_array = new Array(num_of_devices);

	//allow multiple number of devices to come from 1 csv file 
	for (var i = 0; i < num_of_devices; i++) {
	    data_array[i] = new Array();
	}

	var timer = new Array(num_of_devices);

	data.forEach(function(record){

		var body = {};
		var date = new Date(0);
		date.setUTCSeconds(record.timestamp);

		async.waterfall([
			function(callback){
				MongoClient.connect("mongodb://localhost:27017/funftowotk", function(err, db) {
			  		if(err){
			  			console.log(err);
			  		}
					else{

						//console.log(record);

						var probe_id = type+'_'+record.device_id;
						//console.log(probe_id);

						db.collection('settings').find({_id:probe_id}).toArray(function(err,results){
							if(err) {
								console.log("DB Err");
								db.close();
								callback(null,null);
							}
							else{
								params = results[0];
								
								if(params){
									db.close();
									callback(null,null);	
								}else{
									//no matching settings entry, fetch default settings

									db.collection('settings').find({_id:type}).toArray(function(err,results){
										//params = results[0];
										db.close();
										callback(null,results[0]);	
									});
								}
								
							}
						});	
						//db.close();					
					}
				});
			},
			function(params,callback){
				if(params){

				//console.log(params);
				body['timestamp'] = date.toISOString(); //not needed for POST request
				body['value'] = 0;

				for(var index_lv1 in params['settings']){
					if(typeof params['settings'][index_lv1] === 'object'){
						//nested array lv 1

						var lv_2_arr = {};

						for(var index_lv2 in params['settings'][index_lv1]){

							if(typeof params['settings'][index_lv1][index_lv2] === 'object'){

								//nested array lv 2
								var lv_3_arr = {};

								for(var index_lv3 in params['settings'][index_lv1][index_lv2]){

									if(typeof params['settings'][index_lv1][index_lv2][index_lv3] === 'object'){
										//nested array lv 3
										//do nothing

									}else{
										if(params['settings'][index_lv1][index_lv2][index_lv3]){

											if(typeof record[index_lv1.toLowerCase()+'_'+index_lv2.toLowerCase()+'_'+index_lv3.toLowerCase()] === 'object'){
												//to do...aggregation is needed

											}else{
												lv_3_arr[index_lv3] = record[index_lv1.toLowerCase()+'_'+index_lv2.toLowerCase()+'_'+index_lv3.toLowerCase()];
											}
										}
									}
								}

								if(typeof lv_3_arr === 'object'){
									if(Object.keys(lv_3_arr).length>1){
										lv_2_arr[index_lv2] = lv_3_arr;
									}		
								}

							}else{
								if(params['settings'][index_lv1][index_lv2]){

									if(typeof record[index_lv1.toLowerCase()+'_'+index_lv2.toLowerCase()] === 'object'){
										//to do...aggregation is needed

									}else{
										//console.log(index_lv1.toLowerCase()+'_'+index_lv2.toLowerCase());
										//console.log(record[index_lv1.toLowerCase()+'_'+index_lv2.toLowerCase()]);
										lv_2_arr[index_lv2] = record[index_lv1.toLowerCase()+'_'+index_lv2.toLowerCase()];
									}
									
								}
							}
						}

						if(typeof lv_2_arr === 'object'){
							if(Object.keys(lv_2_arr).length>1){
								body[index_lv1] = lv_2_arr;
							}		
						}

					}else{
						//if set to true
						if(params['settings'][index_lv1]){

							if(typeof record[index_lv1.toLowerCase()] === 'object'){
								//to do...aggregation is needed

								//Special Case : Accelerometer
								// if(index_lv1=="X" || index_lv1=="Y" || index_lv1=="Z"){
								// 	body[index_lv1] = get_average(data[index_lv1]);
								// }

							}else{
								//console.log(index_lv1.toLowerCase());
								//console.log(record[index_lv1.toLowerCase()]);
								if(index_lv1!='TIMESTAMP') body[index_lv1] = record[index_lv1.toLowerCase()];
							}
						}
					}
				}

				//special cases for Longitude and Latitude
				if(type=="LocationProbe"){
					body['lng'] = record['location_mlongitude'];
					body['lat'] = record['location_mlatitude'];	
				}

				//console.log(body);

				callback(null,body);				
					
				}else{
					console.log("err");
				}
			},
			function(body, callback){
				//console.log(body);
				var device_index;

				if(device_list.indexOf(record.device_id) == -1){
					//console.log("does not exist");
					device_list.push(record.device_id);
					//console.log(record.device_id+" new device index = "+device_list.indexOf(record.device_id));
				}

				device_index = device_list.indexOf(record.device_id);

				if(timer[device_index]) clearTimeout(timer[device_index]);	
				timer[device_index] = setTimeout(function(){
					//var device = record.device.slice(record.device.length - 12, record.device.length)
					console.log("sending data of device "+record.device_id+" with device index "+device_index);
					send_data(data_array[device_index],type,record.device_id);
					
				},timeout_duration);

				data_array[device_index].push(body);
			}
		]);

	});
}

function send_data(data_array,type,device){
	//console.log(data_array);

	var bodyJSON;
	var sensor_name;
	var date = new Date();

	//if(data_array.length===1) bodyJSON = '['+JSON.stringify(data_array)+']';
	//else bodyJSON = JSON.stringify(data_array);

	bodyJSON = JSON.stringify(data_array);

	//sensor_name = type.toLowerCase() + '_' + device;
	//console.log("sending..."+type+device);
	//console.log(bodyJSON);

	//console.log('/api/sensors/'+WoTK_ID+'.'+type.toLowerCase()+'_'+device+'/data');

	var headers = {
	  'Content-Type': 'application/json',
	  'Content-Length' : bodyJSON.length
	};

	var options = {
	  host: '142.103.25.37',
	  port: 80,
	  path: '/api/sensors/'+WoTK_ID+'.'+type.toLowerCase()+'_'+device+'/data',
	  auth: '9c4389eae0f94004:af092d74889edf2c',
	  method: 'PUT',
	  headers: headers
	};

	var webservice_data = "";

    var webservice_request = http.request(options, function(webservice_response)
	{
	    webservice_response.on('error', function(e){ console.log(e.message); });
	    webservice_response.on('data', function(chunk){ webservice_data += chunk;});
	    //webservice_response.on('end', function(){res.send(webservice_data);});

	    console.log(webservice_response.statusCode)

	    if(webservice_response.statusCode===500){
	    	console.log(bodyJSON);
	    }

	    if(webservice_response.statusCode===404){
	    	//console.log(type+" sensor not found!")
	    	console.log('404 sensor '+type+' not found!, will create new sensor now!');
	    	add_new_sensor(type,device);

	    	setTimeout(function(){
	    		send_data(data_array,type,device);
	    	},10000);

	    }else{
	    	console.log(type+" "+device+" Sent");
	    }
	});

	webservice_request.write(bodyJSON);
	webservice_request.end();
	
}