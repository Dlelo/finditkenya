const mongoose = require('mongoose');
var sys = require(__dirname + '/../config/System');
const _ = require('underscore');


var db = mongoose.connect(sys.db_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const productSchema = new Schema({
	name: { type: String,required: true},
	bizid: { type: Schema.Types.ObjectId, ref: 'Business' },
	description: String,
	photo: String,
  price: String,
  quantity: String,
  reviews: [{
    rate: String,
    msg: String,
    user_id: { type: Schema.Types.ObjectId, ref: 'User' }
  }],
	status: Boolean
});

module.exports = mongoose.model('Product', productSchema);
