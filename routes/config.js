/*********** MASTER CONFIGURATION FILE **************/

//GENERAL
exports.ROOT_URL = "142.103.25.37"; //where the WoTKit is being hosted
exports.AUTH_ID = "9c4389eae0f94004";
exports.AUTH_PW = "af092d74889edf2c"; 
exports.WOTK_USER = "coffeejack";
exports.API_URL = "/api/sensors";

//DATABASE
exports.DB_PORT = "27017";
exports.DB_NAME = "funftowotk";

//UPLOAD
exports.FILTER_SIZE = "7000"; //any file uploaded less than this size will be discarded

//DELAYS
exports.DB_INSERTION_DELAY = 10000; //the time in takes between entries being entered into DB and data ready to be sent to WoTKit
exports.CREATE_NEW_SENSOR_DELAY = 10000; //time it takes to register new sensor on WoTKit and resend the data
exports.DATA_GROUP_DELAY = 3000; //time it takes to sense no more incoming data is of the same Probe group, and can be sent off without waiting for others
exports.UPLOAD_DELAY = 10000; //delay it takes to sense no more incoming files are being uploaded

//SIMULTANEOUS OPS
exports.PARALLEL_UPLOADS = 10;

//DATA FORMAT
exports.DATA_NESTED = false; //right now the WoTKit only accepts 1 level of data, do not set to true

//LIST OF AVAILABLE PROBES
exports.LIST_OF_PROBES = new Array(
"LocationProbe",
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



