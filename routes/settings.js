var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var $ = require('jquery');

exports.save = function(req,res){
	
	console.log(req.body.device);

	res.writeHead(200, {"Content-Type": "text/html"});
	res.write("settings saved!");
	res.end();
};

exports.getprobes = function(req,res){

	console.log("get probes!");
	MongoClient.connect("mongodb://localhost:27017/funftowotk", function(err, db) {
  		if(err){
  			console.log(err);
  		}
		else{
			console.log("connected to DB!");
			async.series({
				head : function(callback){
					res.writeHead(200, {"Content-Type": "text/html/json"});
					callback(null);
				},
				mid : function(callback){
					db.collection('settings').find().toArray(function(err,results){
						if(err) console.log("DB error");
						else{
							var bodyJSON = JSON.stringify(results);

							res.write(bodyJSON);
							callback(null);
						}
					});					
				},
				tail : function(callback){
					res.end();
					db.close();
				}
			});
		}
	});
}

//setters

exports.update_probe = function(req,res){

	
	//console.log(req.body);

	//update

	MongoClient.connect("mongodb://localhost:27017/funftowotk", function(err, db) {
  		if(err){
  			console.log(err);
  		}
		else{
			console.log("connected to DB!");
			async.series({
				head : function(callback){
					res.writeHead(200, {"Content-Type": "text/html"});
					callback(null);
				},
				mid : function(callback){

					//console.log(req.body);
					var id = req.body.probe;
					var field = req.body.field.split(" ");
					var value = req.body.value;

					if(value == "true" || value == true){
						console.log("true");
						value = true;
					}						
					else value = false;

					console.log(field);

					db.collection('settings').find({_id:id}).toArray(function(err,results){
						if(err){
							console.log("err");
						}else{
							//console.log("ok...");
							var new_params = results[0];

							if(field.length==1){
								new_params[field[0]] = value;
							}else if(field.length==2){
								new_params[field[0]][field[1]] = value;
							}else if(field.length==3){
								new_params[field[0]][field[1]][field[2]] = value;
							}else{
								new_params[field[0]][field[1]][field[2]][field[3]] = value;
							}
							
							//console.log(new_params);

							db.collection('settings').update(
								{ _id: id },
								new_params ,
								function(err,results){
									if(err){
										console.log("err");
										console.log(err);
										//res.write('<FORM><INPUT Type="button" VALUE="Back" onClick="history.go(-1);return true;"></FORM>');
										callback(null);	
									} 
									else{
										console.log("update ok");
										//console.log(results);
										//res.write('<FORM><INPUT Type="button" VALUE="Back" onClick="history.go(-1);return true;"></FORM>');
										callback(null);	
									}
								});	

						}
					});

					// res.write('<FORM><INPUT Type="button" VALUE="Back" onClick="history.go(-1);return true;"></FORM>');
					// callback(null);	
			
				},
				tail : function(callback){
					res.end();
					//db.close(); //cannot close DB at this point
				}
			});
		}
	});
}

exports.set_defaults = function(req,res){

	console.log("set defaults into DB!");
	MongoClient.connect("mongodb://localhost:27017/funftowotk", function(err, db) {
  		if(err){
  			console.log(err);
  		}
		else{
			console.log("connected to DB!");

			var probe_list = getProbeList();

			probe_list.forEach(function(probe){
				var input = get_default_settings(probe);
				//input = JSON.stringify(input);
				//console.log(input);
				db.collection('settings').insert(input,function(err,results){
					if(err)console.log("error in entering new value");
					else console.log(results[0]._id+" entered");
				});
			});

			res.writeHead(200, {"Content-Type": "text/html"});
			res.end();
			setTimeout(function(){db.close();},5000);
		}
	});
}

function getProbeList(){
	var list = new Array("LocationProbe",
		"BluetoothProbe",
		"WifiProbe",
		"CellProbe",
		"ContactProbe",
		"CallLogProbe",
		"SMSProbe",
		"AccelerometerSensorProbe",
		"GravitySensorProbe",
		"LinearAccelerationProbe",
		"GyroscopeSensorProbe",
		"OrientationSensorProbe",
		"RotationVectorSensorProbe",
		"ActivityProbe",
		"LightSensorProbe",
		"ProximitySensorProbe",
		"MagneticFieldSensorProbe",
		"PressureSensorProbe",
		"TemperatureSensorProbe",
		"AndroidInfoProbe",
		"BatteryProbe",
		"HardwareInfoProbe",
		"TimeOffsetProbe",
		"TelephonyProbe",
		"RunningApplicationsProbe",
		"ApplicationsProbe",
		"ScreenProbe",
		"BrowserBookmarksProbe",
		"BrowserSearchesProbe",
		"VideosProbe",
		"AudioFilesProbe",
		"ImagesProbe");

	return list;
}

function explore(input){

	if(typeof input === 'object'){
		$.each(input,function(index,value){
			if(typeof value === 'object'){
				//console.log(Object.keys(value));
				explore(value);
			} 
			else{
				console.log(index + " : "+ value);
			} 
		});
	}
}

function insert(db, input){
	db.collection('settings').insert(input,function(err,result){
		if(err){
			console.log("DB error");
		}
		else{
			console.log(result[0]._id+" inserted!");
		}
	});
}

exports.newprobe = function(req,res){

	console.log("new probe!");
	MongoClient.connect("mongodb://localhost:27017/funftowotk", function(err, db) {
  		if(err){
  			console.log(err);
  		}
		else{
			console.log("connected to DB!");
			//console.log(req.body);	

			if(req.body.id && req.body.type){
				async.series({
					head : function(callback){
						res.writeHead(200, {"Content-Type": "text/html"});
						callback(null);
					},
					mid : function(callback){

						//console.log(req.body.id + req.body.type);

						var input = get_default_settings(req.body.type);

						input['_id'] = req.body.type+'_'+req.body.id;
						input['device'] = req.body.id;

						//console.log(input);

						db.collection('settings').insert(input,function(err,result){
							if(err){
								console.log("DB error");
								callback(null);
							}
							else{
								console.log("inserted!");

								res.write("inserted!");
								callback(null);
							}
						});	

						callback(null);				
					},
					tail : function(callback){
						res.end();
						db.close();
					}
				});	
			}else{
				res.writeHead(500, {"Content-Type": "text/html"});
				res.end();
				db.close();
			}
		}
	});
}

exports.delete_probe = function(req,res){

	MongoClient.connect("mongodb://localhost:27017/funftowotk", function(err, db) {
  		if(err){
  			console.log(err);
  		}
		else{
			console.log("connected to DB!");
			//console.log(req.body);	

			if(req.body.id){
				async.series({
					head : function(callback){
						res.writeHead(200, {"Content-Type": "text/html"});
						callback(null);
					},
					mid : function(callback){

						console.log(req.body.id);

						if(req.body.id.indexOf("_")>0){
							db.collection('settings').remove({_id:req.body.id},function(err,result){
								if(err){
									console.log("DB error");
									callback(null);
								}
								else{
									console.log("removed!!");

									res.write("removed!!");
									callback(null);
								}
							});	
						}else{	
							console.log("cannot delete default");						
							callback(null);
						}

						//callback(null);				
					},
					tail : function(callback){
						res.end();
						db.close();
					}
				});	
			}else{
				res.writeHead(500, {"Content-Type": "text/html"});
				res.end();
				db.close();
			}
		}
	});
}


function get_default_settings(probe_type){

	var input_query;

	input_query = {	_id : probe_type,
					type : probe_type,
					device : "default",
				};

	if(probe_type=="LocationProbe"){
		input_query['settings'] = {
							  "TIMESTAMP": true,
							  "LOCATION": {
							    "mResults": false, //array
							    "mProvider": false,
							    "mExtras": {
							      "networkLocationType": false,
							      "networkLocationSource": false
							    },
							    "mDistance": false,
							    "mTime": false,
							    "mAltitude": false,
							    "mLongitude": true,
							    "mLon2": false,
							    "mLon1": false,
							    "mLatitude": true,
							    "mLat1": false,
							    "mLat2": false,
							    "mInitialBearing": false,
							    "mHasSpeed": false,
							    "mHasBearing": false,
							    "mHasAltitude": false,
							    "mHasAccuracy": false,
							    "mAccuracy": false,
							    "mSpeed": false,
							    "mBearing": false
							  }
							};
	}else if(probe_type=="BluetoothProbe"){
		input_query['settings'] = {
								  "TIMESTAMP": 1316011505,
								  "DEVICES": //array
								    {
								      "android.bluetooth.device.extra.DEVICE": {
								        "mAddress": false
								      },
								      "android.bluetooth.device.extra.NAME": true,
								      "android.bluetooth.device.extra.RSSI": true,
								      "android.bluetooth.device.extra.CLASS": {
								        "mClass": true
								      }
								    }
								};


	}else if(probe_type=="WifiProbe"){
		input_query['settings'] = {
								  "TIMESTAMP": true,
								  "SCAN_RESULTS": //array
								    {
								      "BSSID": true,
								      "SSID": true,
								      "capabilities": true,
								      "frequency": true,
								      "level": true
								    }
								};

	}else if(probe_type=="CellProbe"){
		input_query['settings'] = {
								  "TIMESTAMP": true,
								  "psc": true,
								  "type": true,
								  "cid": true,
								  "lac": true
								};

	}else if(probe_type=="ContactProbe"){
		input_query['settings'] = {
								  "TIMESTAMP": true,
								  "CONTACT_DATA":  //array
								    {
								      "last_time_contacted": true,
								      "times_contacted": true,
								      "display_name": true,
								      "custom_ringtone": false,
								      "in_visible_group": false,
								      "starred": false,
								      "contact_id": true,
								      "CONTACT_DATA": //array
								        {
								          "data_version": true,
								          "data1": true,
								          "data4": false,
								          "data5": false,
								          "data2": false,
								          "data3": false,
								          "data8": false,
								          "data9": false,
								          "data6": false,
								          "data7": false,
								          "data11": false,
								          "data10": false,
								          "mimetype": true,
								          "_id": true,
								          "is_super_primary": true,
								          "is_primary": true,
								          "raw_contact_id": true
								        }
								      ,
								      "photo_id": true,
								      "lookup": true,
								      "send_to_voicemail": false
								    }
								};
	}else if(probe_type=="CallLogProbe"){
		input_query['settings'] = {
								  "TIMESTAMP": true,
								  "CALLS": //array
								    {
								      "duration": true,
								      "numbertype": true,
								      "_id": false,
								      "numberlabel": false,
								      "name": true,
								      "number": true,
								      "date": true,
								      "type": false
								    }
								};
		
	}else if(probe_type=="SMSProbe"){

		input_query['settings'] = {
								  "TIMESTAMP": true,
								  "MESSAGES": //array
								    {
								      "body": true,
								      "person": true,
								      "protocol": false,
								      "address": true,
								      "status": false,
								      "subject": true,
								      "read": false,
								      "locked": false,
								      "type": false,
								      "date": true,
								      "thread_id": false,
								      "reply_path_present": false
								    }
								};
		
	}else if(probe_type=="AccelerometerSensorProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "SENSOR": {
									    "RESOLUTION": false,
									    "POWER": false,
									    "NAME": false,
									    "VERSION": false,
									    "TYPE": false,
									    "MAXIMUM_RANGE": false,
									    "VENDOR": false
									  },
									  "ACCURACY": false, //array
									  "X": true, //array
									  "Y": true, //array
									  "Z": true, //array
									  "EVENT_TIMESTAMP": false //array
									};
		
	}else if(probe_type=="GravitySensorProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "SENSOR": {
									    "RESOLUTION": false,
									    "POWER": false,
									    "NAME": false,
									    "VERSION": false,
									    "TYPE": false,
									    "MAXIMUM_RANGE": false,
									    "VENDOR": false
									  },
									  "ACCURACY": false, //array
									  "X": true, //array
									  "Y": true, //array
									  "Z": true, //array
									  "EVENT_TIMESTAMP": false //array
									};
		
	}else if(probe_type=="LinearAccelerationProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "SENSOR": {
									    "RESOLUTION": false,
									    "POWER": false,
									    "NAME": false,
									    "VERSION": false,
									    "TYPE": false,
									    "MAXIMUM_RANGE": false,
									    "VENDOR": false
									  },
									  "ACCURACY": false, //array
									  "X": true, //array
									  "Y": true, //array
									  "Z": true, //array
									  "EVENT_TIMESTAMP": false //array
									};
		
	}else if(probe_type=="GyroscopeSensorProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "SENSOR": {
									    "RESOLUTION": false,
									    "POWER": false,
									    "NAME": false,
									    "VERSION": false,
									    "TYPE": false,
									    "MAXIMUM_RANGE": false,
									    "VENDOR": false
									  },
									  "ACCURACY": false, //array
									  "X": true, //array
									  "Y": true, //array
									  "Z": true, //array
									  "EVENT_TIMESTAMP": false //array
									};
		
	}else if(probe_type=="OrientationSensorProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "SENSOR": {
									    "RESOLUTION": false,
									    "POWER": false,
									    "NAME": false,
									    "VERSION": false,
									    "TYPE": false,
									    "MAXIMUM_RANGE": false,
									    "VENDOR": false
									  },
									  "ACCURACY": false, //array
									  "AZIMUTH": true, //array
									  "PITCH": true, //array
									  "ROLL": true, //array
									  "EVENT_TIMESTAMP": false //array
									};
		
	}else if(probe_type=="RotationVectorSensorProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "SENSOR": {
									    "RESOLUTION": false,
									    "POWER": false,
									    "NAME": false,
									    "VERSION": false,
									    "TYPE": false,
									    "MAXIMUM_RANGE": false,
									    "VENDOR": false
									  },
									  "ACCURACY": false, //array,
									  "X_SIN_THETA_OVER_2": true, //array
									  "Y_SIN_THETA_OVER_2": true, //array
									  "Z_SIN_THETA_OVER_2": true, //array,
									  "EVENT_TIMESTAMP": false //array
									};

	}else if(probe_type=="ActivityProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "ACTIVE_INTERVALS": false,
									  "TOTAL_INTERVALS": true
									};

	}else if(probe_type=="LightSensorProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "SENSOR": {
									    "RESOLUTION": false,
									    "POWER": false,
									    "NAME": false,
									    "VERSION": false,
									    "TYPE": false,
									    "MAXIMUM_RANGE": false,
									    "VENDOR": false
									  },
									  "ACCURACY": false, //array,
									  "LUX": true, //array,
									  "EVENT_TIMESTAMP": false //array
									};

	}else if(probe_type=="ProximitySensorProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "SENSOR": {
									    "RESOLUTION": false,
									    "POWER": false,
									    "NAME": false,
									    "VERSION": false,
									    "TYPE": false,
									    "MAXIMUM_RANGE": false,
									    "VENDOR": false
									  },
									  "ACCURACY": false, //array,
									  "DISTANCE": true, //array,
									  "EVENT_TIMESTAMP": false //array
									};

	}else if(probe_type=="MagneticFieldSensorProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "SENSOR": {
									    "RESOLUTION": false,
									    "POWER": false,
									    "NAME": false,
									    "VERSION": false,
									    "TYPE": false,
									    "MAXIMUM_RANGE": false,
									    "VENDOR": false
									  },
									  "ACCURACY": false, //array
									  "X": true, //array
									  "Y": true, //array
									  "Z": true, //array
									  "EVENT_TIMESTAMP": false //array
									};

	}else if(probe_type=="PressureSensorProbe"){

		//input_query['settings'] = 

	}else if(probe_type=="TemperatureSensorProbe"){

		//input_query['settings'] = 

	}else if(probe_type=="AndroidInfoProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "BUILD_NUMBER": true,
									  "FIRMWARE_VERSION": true,
									  "SDK": true
									};

	}else if(probe_type=="BatteryProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "icon-small": false,
									  "present": false,
									  "scale": true,
									  "level": true,
									  "technology": true,
									  "status": false,
									  "voltage": true,
									  "plugged": false,
									  "health": true,
									  "temperature": true
									};

	}else if(probe_type=="HardwareInfoProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "WIFI_MAC": true,
									  "DEVICE_ID": true,
									  "BLUETOOTH_MAC": true,
									  "MODEL": true,
									  "BRAND": true,
									  "ANDROID_ID": true
									};

	}else if(probe_type=="TimeOffsetProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "TIME_OFFSET": true
									};

	}else if(probe_type=="TelephonyProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "NETWORK_OPERATOR": true,
									  "SUBSCRIBER_ID": false,
									  "SIM_OPERATOR": false,
									  "HAS_ICC_CARD": false,
									  "SIM_OPERATOR_NAME": true,
									  "VOICEMAIL_ALPHA_TAG": true,
									  "NETWORK_OPERATOR_NAME": true,
									  "DEVICE_ID": true,
									  "SIM_SERIAL_NUMBER": true,
									  "CALL_STATE": false,
									  "NETWORK_COUNTRY_ISO": true,
									  "VOICEMAIL_NUMBER": true,
									  "NETWORK_TYPE": false,
									  "LINE_1_NUMBER": true,
									  "PHONE_TYPE": false,
									  "SIM_STATE": false,
									  "DEVICE_SOFTWARE_VERSION": true,
									  "SIM_COUNTRY_ISO": true
									};

	}else if(probe_type=="RunningApplicationsProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "RUNNING_TASKS": //array
									    {
									      "baseActivity": {
									        "mClass": true,
									        "mPackage": true,
									      },
									      "topActivity": {
									        "mClass": true,
									        "mPackage": true,
									      },
									      "numRunning": true,
									      "numActivities": true,
									      "id": false
									    }
									};    

	}else if(probe_type=="ApplicationsProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "INSTALLED_APPLICATIONS": //array
									    {
									      "dataDir": true,
									      "taskAffinity": true,
									      "sourceDir": true,
									      "nativeLibraryDir": true,
									      "processName": true,
									      "publicSourceDir": true,
									      "installLocation": true,
									      "flags": false,
									      "enabled": true,
									      "targetSdkVersion": true,
									      "descriptionRes": false,
									      "theme": false,
									      "uid": false,
									      "packageName": true,
									      "logo": false,
									      "labelRes": false,
									      "icon": false
									    }
									};

	}else if(probe_type=="ScreenProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "SCREEN_ON": true
									};

	}else if(probe_type=="BrowserBookmarksProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "BOOKMARKS": //array
									    {
									      "title": true,
									      "bookmark": false,
									      "_id": false,
									      "date": true,
									      "visits": true,
									      "created": false,
									      "url": true
									    }
									};

	}else if(probe_type=="BrowserSearchesProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "SEARCHES": //array
									    {
									      "_id": false,
									      "date": true,
									      "search": true
									    }
									};

	}else if(probe_type=="VideosProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "VIDEOS": //array
									    {
									      "bucket_id": false,
									      "bookmark": false,
									      "date_modified": true,
									      "album": true,
									      "bucket_display_name": true,
									      "title": true,
									      "duration": true,
									      "mini_thumb_magic": false,
									      "_id": false,
									      "mime_type": false,
									      "date_added": true,
									      "_display_name": true,
									      "isprivate": false,
									      "_size": true,
									      "longitude": false,
									      "artist": true,
									      "latitude": false,
									      "datetaken": true
									    }
									};

	}else if(probe_type=="AudioFilesProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "AUDIO_FILES": //array
									    {
									      "date_modified": true,
									      "album": true,
									      "is_alarm": true,
									      "is_ringtone": true,
									      "track": false,
									      "artist_id": false,
									      "is_music": true,
									      "album_id": false,
									      "title": true,
									      "duration": true,
									      "is_notification": true,
									      "_id": false,
									      "mime_type" :true,
									      "date_added": true,
									      "_display_name": true,
									      "_size": true,
									      "year": true,
									      "artist": true
									    }
									};

	}else if(probe_type=="ImagesProbe"){

		input_query['settings'] = {
									  "TIMESTAMP": true,
									  "IMAGES": //array
									        {
									      "bucket_id": false,
									      "orientation": false,
									      "date_modified": true,
									      "bucket_display_name": true,
									      "title": true,
									      "mini_thumb_magic": false,
									      "_id": false,
									      "mime_type": true,
									      "date_added": true,
									      "_display_name": true,
									      "isprivate": false,
									      "description": false,
									      "_size": true,
									      "longitude": false,
									      "latitude": false,
									      "datetaken": true
									    }
									};


	}else{
		
	}

	return input_query;
	//return JSON.stringify(input_query);
}

exports.updateprobe = function(req,res){

}

exports.deleteprobe = function(req,res){

}