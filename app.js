
/**
 * Module dependencies.
 */

var express = require('express')
  , config = require('./routes/config')
  , routes = require('./routes')
  , upload = require('./routes/upload')
  , db = require('./routes/db')
  , forward = require('./routes/forward')
  , rt = require('./routes/realtime')
  , settings = require('./routes/settings')
  , status = require('./routes/status')
  , http = require('http')
  , path = require('path');

var fs = require("fs"); 
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || config.PORT);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.post('/status', status.check);
app.post('/upload',upload.savefile);
app.get('/db',db.db);
app.get('/forward',forward.forward);
app.post('/rt',rt.realtime_upload);
app.post('/settings',settings.newprobe);
app.get('/settings',settings.getprobes);
app.get('/settings/default',settings.set_defaults);
app.post('/settings/update',settings.update_probe);
app.post('/settings/del',settings.delete_probe);

//garbage cleanup, set to hourly
setInterval(function(){
  cleanUploadFolder('./uploads');
},config.CLEAR_UPLOAD_FOLDER_INTERVAL); 

setInterval(function(){
  cleanRootFolder('.');
},config.CLEAR_ROOT_FOLDER_INTERVAL); 

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


var cleanUploadFolder = function(path) {

  var time = new Date();

  console.log("cleaning upload folder...at "+time);

  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file       
        fs.stat(curPath,function(err,stat){
          var now = new Date();
          var diff = Math.abs(now - stat.mtime);
          var expiry = 1*1*60*60*1000; //every hour

          if(diff > (expiry)) fs.unlinkSync(curPath);
        });
        
      }
    });
    //fs.rmdirSync(path);
    //fs.mkdirSync(path);
  }
};

var cleanRootFolder = function(path) {

  var time = new Date();

  console.log("cleaning main folder...at "+time);

  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.statSync(curPath).isDirectory()) { // recurse
        //deleteFolderRecursive(curPath);
      } else { // delete file  

        //filters .db files only!
        if(curPath.indexOf('.db') !== -1){
          fs.stat(curPath,function(err,stat){
            var now = new Date();
            var diff = Math.abs(now - stat.mtime);
            var expiry = 1*1*60*60*1000; //every hour

            if(diff > (expiry)) 
              fs.unlinkSync(curPath);

          });
        }   
      }
    });
  }
};