/*Handler for receiving uploaded DB files*/

var http = require("http");
var url = require("url");
//var multipart = require("multipart");
var sys = require("util");
var fs = require("fs");  
var exec  = require('child_process').exec,
    child;

var file_names = new Array();
var timer;

var db = require('./db');

exports.savefile = function(req,res){
	//console.log(request.headers);

	var date = new Date();

	res.send("POST success!");
	//upload_file(request, response);
	//console.log(req.files);
	console.log("Post request received: "+date);

	//file size less than 7000 is garbage
	if(req.files.uploadedfile.size>7000){

		if(timer) clearTimeout(timer);	
		timer = setTimeout(merge,10000);

		fs.readFile(req.files.uploadedfile.path, function (err, data) {
		  // ...
		  //var newPath = __dirname + "/uploads";
		  var newPath = "./uploads/"+req.files.uploadedfile.name;
		  //decrypt(req.files.uploadedfile.name);
		  fs.writeFile(newPath, data, function (err) {
		    //res.redirect("back");
		    decrypt('python ./data_processing/dbdecrypt.py ./uploads/',req.files.uploadedfile.name);
		  });
		});
	}

	res.end();

}

function decrypt(command,file_name){
	console.log("running...");

	child = exec(command+file_name, 
	  function (error, stdout, stderr) {
	    sys.print('\nstdout: ' + stdout);
	    if(stderr) sys.print('\nstderr: ' + stderr);
	    if (error !== null) console.log('\nexec error: ' + error);

	    file_names.push(file_name);

	});	
	
};

//exports.merge = function(){
function merge(){

	var command = 'python ./data_processing/dbmerge.py ';
	var flag = false;

	if(file_names[0]) flag = true;

	while(file_names[0]){
		var file = file_names.pop();

		command += './uploads/'+file+' ';

		//need to stall until file is uploaded
		//while(!fs.exists('./'+file))console.log('./'+file+' not found!');
	}

	//console.log(command);

	if(flag){
		child = exec(command, 
		  function (error, stdout, stderr) {
		    sys.print('\nstdout: ' + stdout);
		    if(stderr) sys.print('\nstderr: ' + stderr);
		    if (error !== null) console.log('\nexec error: ' + error);

		    db2csv('find . -maxdepth 1 -name "*.db" -exec python ./data_processing/db2csv.py {} . \;');

		    // setTimeout(function(){
		    // 	db2csv('find . -maxdepth 1 -name "*.db" -exec python ./data_processing/db2csv.py {} . \;');
		    // },10000);

		    flag = false;
		});
	}
	
	//if(file_names[0])console.log(file_names);		
};

function db2csv(command){

	child = exec(command, 
	  function (error, stdout, stderr) {
	    sys.print('\nstdout: ' + stdout);
	    if(stderr) {
	    	sys.print('\nstderr: ' + stderr);
	    }
	    if (error !== null) console.log('\nexec error: ' + error);

	    //db.save_data_to_db();
	});
};
