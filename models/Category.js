const mongoose = require('mongoose');
var superPagination = require('super-pagination').mongoose;
var sys = require(__dirname + '/../config/System');

var db = mongoose.connect(sys.db_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');

const Schema = mongoose.Schema;

const catSchema = new Schema({
		name: { type: String,required: true, index: { unique: true, sparse: true }},
		icon: String,
		approved: String,
		order: String,
		photo: String,
		subcategories: [{
			name: String
		}],
});

catSchema.plugin(superPagination, {
    theme : 'bootstrap'
});

module.exports = mongoose.model('Category', catSchema);
