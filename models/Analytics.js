const mongoose = require('mongoose');
var superPagination = require('super-pagination').mongoose;
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

analyticsSchema.plugin(superPagination, {
    theme : 'bootstrap'
});

module.exports = mongoose.model('Analytics', analyticsSchema);
