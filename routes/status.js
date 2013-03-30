

exports.check = function(req,res){

	res.writeHead(200, {"Content-Type": "text/html"});
	res.write("Server Alive!");
	res.end();

};