
var http = require("http");
var config = require("./config");

var async = require("async");
var MongoClient = require('mongodb').MongoClient;
var wotk = require('./forward');
var $ = require('jquery');
var querystring = require('querystring');


var WoTK_ID = 'coffeejack';

exports.realtime_upload = function(req,res){

	res.writeHead(200, {"Content-Type": "text/html"});
	res.write("Real-time Upload Okay!");
	res.end();

	//console.log(req);
	//console.log(req.body);
	//console.log(config.UPLOAD_URL);

	format_data_rt(req.body);

	//console.log("RT!");
};


function format_data_rt(data){

	var date = new Date(0);
	date.setUTCSeconds(data.TIMESTAMP);

	var body = {};
	//var params;
	// 

	async.waterfall([
		function(callback){
			MongoClient.connect("mongodb://localhost:"+config.DB_PORT+"/"+config.DB_NAME, function(err, db) {
		  		if(err){
		  			console.log(err);
		  		}
				else{

					var probe_id = data.PROBE.replace("edu.mit.media.funf.probe.builtin.","")+'_'+data.Device_ID;
					console.log(probe_id);

					db.collection('settings').find({_id:probe_id}).toArray(function(err,results){
						if(err) {
							console.log("DB Err");
							db.close();
							callback(null);
						}
						else{
							params = results[0];
							
							if(params){
								db.close();
								callback(null,null);	
							}else{
								//no matching settings entry, fetch default settings

								db.collection('settings').find({_id:data.PROBE.replace("edu.mit.media.funf.probe.builtin.","")}).toArray(function(err,results){
									//params = results[0];
									db.close();
									callback(null,results[0]);	
								});
							}
							
						}
					});						
				}
			});
		},
		function(params,callback){
			//console.log(params);
			if(params){

				//console.log(data);
				//body['timestamp'] = date.toISOString(); //not needed for POST request
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

											if(typeof data[index_lv1][index_lv2][index_lv3] === 'object'){
												//to do...aggregation is needed

											}else if(typeof data[index_lv1][index_lv2][index_lv3] === 'undefined'){
												//array aggregated data presumed, take the 1st entry

												if(config.DATA_NESTED==true) lv_3_arr[index_lv3] = data[index_lv1][index_lv2][0][index_lv3];
												else body[index_lv3] = data[index_lv1][index_lv2][0][index_lv3];


											}else{
												//console.log(index_lv3);
												if(config.DATA_NESTED==true) lv_3_arr[index_lv3] = data[index_lv1][index_lv2][index_lv3];
												else body[index_lv3] = data[index_lv1][index_lv2][index_lv3];
											}
										}
									}
								}

								if(typeof lv_3_arr === 'object'){
									if(Object.keys(lv_3_arr).length>1){
										lv_2_arr[index_lv2] = lv_3_arr;
										//lv_2_arr[index_lv2] = new Array(lv_3_arr);
									}		
								}

							}else{
								if(params['settings'][index_lv1][index_lv2]){
		
									if(typeof data[index_lv1][index_lv2] === 'object'){
										//to do...aggregation is needed										

									}else if(typeof data[index_lv1][index_lv2] === 'undefined'){
										//array aggregated data presumed, take the 1st entry

										if(config.DATA_NESTED==true) lv_2_arr[index_lv2] = data[index_lv1][0][index_lv2];
										else body[index_lv2] = data[index_lv1][0][index_lv2];

									}else{
										//console.log(index_lv2);
										if(config.DATA_NESTED==true) lv_2_arr[index_lv2] = data[index_lv1][index_lv2];
										else body[index_lv2] = data[index_lv1][index_lv2];
									}
									
								}
							}
						}

						if(typeof lv_2_arr === 'object'){
							if(Object.keys(lv_2_arr).length>1){
								body[index_lv1] = lv_2_arr;
								//body[index_lv1] = new Array(lv_2_arr);
							}		
						}

					}else{
						//if set to true
						if(params['settings'][index_lv1]){

							if(typeof data[index_lv1] === 'object'){
								//to do...aggregation is needed

								//Special Case : Accelerometer
								if(index_lv1=="X" || index_lv1=="Y" || index_lv1=="Z"){
									body[index_lv1] = get_average(data[index_lv1]);
								}

							}else if(typeof data[index_lv1] === 'undefined'){
								//array aggregated data presumed, take the 1st entry

								if(index_lv1!='TIMESTAMP') body[index_lv1] = data[0][index_lv1];

							}else{
								//console.log(index_lv1);
								if(index_lv1!='TIMESTAMP') body[index_lv1] = data[index_lv1];

							}

						}
					}
				}

				//special cases for Longitude and Latitude
				if(data.PROBE=="edu.mit.media.funf.probe.builtin.LocationProbe"){
					body['lng'] = data['LOCATION']['mLongitude'];
					body['lat'] = data['LOCATION']['mLatitude'];	
				}

				//console.log(body);

				callback(null,body);
				
					
			}else{
				console.log("err");
			}	
		},
		function(body, callback){
			var probeType = data.PROBE.replace("edu.mit.media.funf.probe.builtin.","").toLowerCase();
			//console.log(probeType);
			//console.log(body);
			send_data_rt(WoTK_ID,probeType,data.Device_ID,body);
		}
	]);
}

function get_average(num){
	var avg = 0;
	var sum = 0;

	for(var i=0;i<num.length;i++){
		sum = sum + num[i];
	}

	avg = sum/num.length;
	//console.log(avg_x);

	return avg;
}

function send_data_rt(user, probeType, device_id, data_array){
	//var bodyJSON;
	var body
	var sensor_name;
	var date = new Date();

	//if(data_array.length===1) bodyJSON = '['+JSON.stringify(data_array)+']';
	//else bodyJSON = JSON.stringify(data_array);

	//bodyJSON = '['+JSON.stringify(data_array)+']';
	body = querystring.stringify(data_array);

	//sensor_name = type.toLowerCase() + '_' + device;

	console.log(body);

	var headers = {
	  'Content-Type': 'application/x-www-form-urlencoded',
	  //'Content-Type': 'application/json',
	  'Content-Length' : body.length
	  //'Content-Length' : bodyJSON.length
	};

	var options = {
	  host: config.ROOT_URL,
	  port: 80,
	  path: '/api/sensors/'+user+'.'+probeType+'_'+device_id+'/data',
	  auth: config.AUTH_ID+':'+config.AUTH_PW, //hardcoded key, change later
	  //method: 'PUT',
	  method: 'POST',
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
	    	console.log(body);
	    }

	    if(webservice_response.statusCode===404){
	    	//console.log(type+" sensor not found!")
	    	console.log('404 sensor '+probeType+' not found!, will create new sensor now!');
	    	add_new_sensor_rt(probeType, device_id);

	    }else{
	    	console.log(probeType+" Sending data...");
	    }
	});

	webservice_request.write(body);
	webservice_request.end();
}

function add_new_sensor_rt(probeType, device_id){

	var body = { private:false,
				 name: probeType+'_'+device_id,
				 description: probeType.toUpperCase(),
				 longName: probeType.toUpperCase(),
				 latitude: 0,
				 longitude:0

	};

	var bodyJSON = JSON.stringify(body);

	var headers = {
	  'Content-Type': 'application/json',
	  'Content-Length' : bodyJSON.length
	};

	var options = {
	  host: config.ROOT_URL,
	  port: 80,
	  path: '/api/sensors',
	  auth: config.AUTH_ID+':'+config.AUTH_PW,
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

	    if(webservice_response.statusCode!=204){
	    	console.log(webservice_response.statusCode);
	    }
	});

	webservice_request.write(bodyJSON);
	webservice_request.end();	
}