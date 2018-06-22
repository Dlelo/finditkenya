const mongoose = require('mongoose');
var sys = require(__dirname + '/../config/System');

var db = mongoose.connect(sys.db_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');

const Schema = mongoose.Schema;

const analyticsSchema = new Schema({
	ip: { type: String},
	time: Date,
	bizid: { type: Schema.Types.ObjectId, ref: 'Business' },
	category: String
});

module.exports = mongoose.model('Analytics', analyticsSchema);
