var http = require('http');
var forward = require('./forward');

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
	  path: '/api/sensors/coffeejack.'+sensor_name.toLowerCase()+'_'+device+'/data',
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

exports.query = function(req,res){

	var sensor_name = 'LocationProbe';
	var device = 'ac725b1b26d4';

	var options = {
	  host: '142.103.25.37',
	  port: 80,
	  path: '/api/sensors/coffeejack.'+sensor_name.toLowerCase()+'_'+device+'/data',
	  //path: '/api/sensors/coffeejack.funf_location/data',
	  auth: '9c4389eae0f94004:af092d74889edf2c',
	  method: 'GET'
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

	    // if(webservice_response.statusCode==404){
	    // 	console.log("sensor not found!");

	    // 	add_new_sensor(sensor_name,device);
	    // 	// setTimeout(function(){
	    // 	// 	forward.forward();
	    // 	// },10000);
	    // }
	});

	webservice_request.write('query ok!');
	webservice_request.end();
};

function add_new_sensor(type,device){

	var body = { private:false,
				 name: type.toLowerCase() + '_' + device,
				 description: type + ' ' + device,
				 longName: type + ' ' + device,
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
	//console.log("data to forward");
	//console.log(data);
	//console.log("data forward done!");
	var data_array = new Array();
	var timer;

	if(type=='LocationProbe'){

		data.forEach(function(record){
			//console.log(record.timestamp);
			var date = new Date(0);
			date.setUTCSeconds(record.timestamp);

			var body = { timestamp : date.toISOString(),
						 value : record.device,
						 lng : record.location_mlongitude,
						 lat : record.location_mlatitude
			};

			if(timer) clearTimeout(timer);	
			timer = setTimeout(function(){
				var device = record.device.slice(record.device.length - 12, record.device.length)

				send_data(data_array,type,device);
			},3000);
			data_array.push(body);
		});

	}else if(type=='AccelerometerSensorProbe'){

		data.forEach(function(record){
			//console.log(record.timestamp);
			var date = new Date(0);
			date.setUTCSeconds(record.timestamp);

			var body = { timestamp : date.toISOString(),
						 value : record.device,
						 // accuracy : record.accuracy,
						 // event_timestamp : record.event_timestamp,
						 // sensor_maximum_range : record.sensor_maximum_range,
						 // sensor_name : record.sensor_name,
						 // sensor_power : record.sensor_power,
						 // sensor_resolution : record.sensor_resolution,
						 // sensor_type : record.sensor_type,
						 // sensor_vender : record.sensor_vender,
						 // sensor_version: record.sensor_version,
						 x: record.x,
						 y: record.y,
						 z: record.z
			};

			if(timer) clearTimeout(timer);	
			timer = setTimeout(function(){
				var device = record.device.slice(record.device.length - 12, record.device.length)

				send_data(data_array,type,device);
			},3000);
			data_array.push(body);
		});

	}else if(type=='ActivityProbe'){

		data.forEach(function(record){
			//console.log(record.timestamp);
			var date = new Date(0);
			date.setUTCSeconds(record.timestamp);

			var body = { timestamp : date.toISOString(),
						 value : record.device,
						 high_activity_int : record.high_activity_intervals,
						 low_activity_int : record.low_activity_intervals,
						 total_intervals : record.total_intervals
			};

			if(timer) clearTimeout(timer);	
			timer = setTimeout(function(){
				var device = record.device.slice(record.device.length - 12, record.device.length)

				send_data(data_array,type,device);
			},3000);
			data_array.push(body);
		});

	}else if(type=='CallLogProbe'){

		data.forEach(function(record){
			//console.log(record.timestamp);
			var date = new Date(0);
			date.setUTCSeconds(record.timestamp);

			var body = { timestamp : date.toISOString(),
						 value : record.device
			};

			if(timer) clearTimeout(timer);	
			timer = setTimeout(function(){
				var device = record.device.slice(record.device.length - 12, record.device.length)

				send_data(data_array,type,device);
			},3000);
			data_array.push(body);
		});
		
	}else if(type=='SMSProbe'){

		data.forEach(function(record){
			//console.log(record.timestamp);
			var date = new Date(0);
			date.setUTCSeconds(record.timestamp);

			var body = { timestamp : date.toISOString(),
						 value : record.device
			};

			if(timer) clearTimeout(timer);	
			timer = setTimeout(function(){
				var device = record.device.slice(record.device.length - 12, record.device.length)

				send_data(data_array,type,device);
			},3000);
			data_array.push(body);
		});
		
	}

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

	//console.log(bodyJSON);

	var headers = {
	  'Content-Type': 'application/json',
	  'Content-Length' : bodyJSON.length
	};

	var options = {
	  host: '142.103.25.37',
	  port: 80,
	  path: '/api/sensors/coffeejack.'+type.toLowerCase() + '_' + device+'/data',
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
	    	console.log(type+" Sending data...");
	    }
	});

	webservice_request.write(bodyJSON);
	webservice_request.end();
	
}