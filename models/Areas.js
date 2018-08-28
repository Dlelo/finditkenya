const mongoose = require('mongoose');
var sys = require(__dirname + '/../config/System');

var db = mongoose.connect(sys.db_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');

const Schema = mongoose.Schema;

const areasSchema = new Schema({
		name: { unique: true, type: String},
		created_at: Date
});

module.exports = mongoose.model('Area', areasSchema);
