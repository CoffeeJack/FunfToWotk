
/*
 * GET home page.
 */

exports.index = function(req, res){
  //res.render('index', { title: 'Express' });
  	res.writeHead(200, {"Content-Type": "text/html"});
	res.write(
	    '<form action="/upload" method="post" enctype="multipart/form-data">'+
	    '<input type="file" name="myfile">'+
	    '<input type="submit" value="Upload">'+
	    '</form>'
	);
	res.end();
};