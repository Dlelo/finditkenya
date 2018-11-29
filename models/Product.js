const mongoose = require('mongoose');
var sys = require(__dirname + '/../config/System');
const _ = require('underscore');


var db = mongoose.connect(sys.db_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const productSchema = new Schema({
	name: { type: String,required: true},
	slug: {
		type: String,
		unique: true
	},
	bizid: { type: Schema.Types.ObjectId, ref: 'Business' },
	description: String,
	photo: String,
	gallery: Array,
  price: String,
	oldprice: String,
  quantity: String,
	category: { type: Schema.Types.ObjectId, ref: 'Category' },
	subcategory: String,
	minicategory: String,
	topdeals: Boolean,
	featured: Boolean,
	vat: Boolean,
  reviews: [{
    rate: String,
    msg: String,
    user_id: { type: Schema.Types.ObjectId, ref: 'User' }
  }],
	status: Boolean
});

productSchema.index(
	{ name: 'text',category: 'text',subcategory: 'text', minicategory: 'text', description: 'text' },
	{weights: {name: 12, category: 12, subcategory: 6, minicategory: 4, description: 1}}
);

module.exports = mongoose.model('Product', productSchema);
