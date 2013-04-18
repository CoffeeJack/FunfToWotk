FunF to the WoTKit
==================

Introduction
------------------
This is an integration server written in Node.js.  As the title of the repository suggests, the purpose of this server is to convert FunF data to WoTKit API-compatible format data.  This facilitates the upload of data between the FunF framework and the WoTKit.

Getting Started
------------------
###Install Node.js
1. Node.js can be found at http://nodejs.org/download/. 
If one is using Ubuntu, alternate steps to install Node.js can be found at:
<p>http://blog.gantrithor.com/post/10405024929/install-up-to-date-node-js-and-npm-on-ubuntu
2. Be sure Node Package Manager (NPM) is installed.  
3. Install module Express.  Run command in terminal -- npm install express
4. Install module Async. Run command in terminal – npm install async
5. Install module MongoDB. Run command in terminal – npm install mongodb
6. Install module Mongoose. Run command in terminal – npm install mongoose
7. Install module QueryString. Run command in terminal – npm install querystring

###Install MongoDB

1. Download and install MongoDB http://docs.mongodb.org/manual/installation/
2. Start Mongo DB, if not already started upon installation.  Use command: “sudo service mongodb start” for Ubuntu.  
3. For Windows, go to the “bin” folder which MongoDB is installed, run command “mongod”
4. Check port 27017 (default port) to see if MongoDB is running.  It can be changed if necessary.

###Install Python

1. Install Python 2.7+ at: http://www.python.org/getit/

###Run the Server

1. Use command "node app.js" in terminal to run the server

Configurations
------------------
All configurations can be found in file routes/config.js

Load Sensor Settings
--------------------
Some default settings need to be loaded into the database before data can be sent from a mobile device to the WoTKit.  Otherwise, the server won't know what/how to translate data between FunF and WoTKit.

1. Start the server
2. Start the database
3. Find out what IP the server is running on, and what port.  
4. From a browser, go the URL specified by IP:port (ex: if my server is running on 142.103.25.45, and on port 9000, I would visit http://142.103.25.45:9000).
5. There should be a page that says “FunF to the WoTKit”.
6. Check the dropdown menu under Registered Devices. It should be empty because nothing has been loaded in the database.
7. Visit in browser <HOST_IP>:<HOST_PORT>/settings/default.  This will load the database with some default settings.  (ex: http://142.103.25.45:9000/settings/default)
8. Refresh the FunF to the WoTKit page. Check dropdown menu again.  There now should be 32 or so probes set up.

