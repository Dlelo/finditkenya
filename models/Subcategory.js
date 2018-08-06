const mongoose = require('mongoose');
var sys = require(__dirname + '/../config/System');

var db = mongoose.connect(sys.db_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');

const Schema = mongoose.Schema;

const subcatSchema = new Schema({
		name: { type: String,required: true, index: { unique: true, sparse: true }},
		cat_id: { type: Schema.Types.ObjectId, ref: 'Category' },
});

module.exports = mongoose.model('Subcategory', subcatSchema);
