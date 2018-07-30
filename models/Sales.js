const mongoose = require('mongoose');
var sys = require(__dirname + '/../config/System');
const _ = require('underscore');


var db = mongoose.connect(sys.db_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const saleSchema = new Schema({
	phone: String,
  email: String,
  amount: String,
  orderid: String,
  cart: Array,
  timestamp: Date,
	status: Boolean
});

module.exports = mongoose.model('Sale', saleSchema);
