const mongoose = require('mongoose');
var sys = require(__dirname + '/../config/System');

var db = mongoose.connect(sys.db_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');

const Schema = mongoose.Schema;

const agentSchema = new Schema({
		name: { type: String,required: true},
		phone: { type: String,required: true,index: { unique: true, sparse: true }}
});

module.exports = mongoose.model('Agent', agentSchema);
