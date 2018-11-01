const mongoose = require('mongoose');
var sys = require(__dirname + '/../config/System');

var db = mongoose.connect(sys.db_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');

const Schema = mongoose.Schema;

const advertiseSchema = new Schema({
		photo: { type: String,required: true},
		price: { type: String },
		email: String,
		phone: String,
		paid: Boolean,
		date: Date,
		approved: Boolean,
		type: String
});

module.exports = mongoose.model('Advertise', advertiseSchema);
