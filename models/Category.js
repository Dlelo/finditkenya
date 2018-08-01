const mongoose = require('mongoose');
var sys = require(__dirname + '/../config/System');

var db = mongoose.connect(sys.db_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');

const Schema = mongoose.Schema;

const catSchema = new Schema({
		name: { type: String,required: true, index: { unique: true, sparse: true }},
		icon: String,
		approved: String,
		order: String,
		group: String,
		photo: String,
		subcategories: [{
			name: String
		}],
});

module.exports = mongoose.model('Category', catSchema);
