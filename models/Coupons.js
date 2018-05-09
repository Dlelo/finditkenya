const mongoose = require('mongoose');
var superPagination = require('super-pagination').mongoose;
var sys = require(__dirname + '/../config/System');

var db = mongoose.connect(sys.db_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');

const Schema = mongoose.Schema;

const couponSchema = new Schema({
	bizid: { type: Schema.Types.ObjectId, ref: 'Business' },
	user_id: { type: Schema.Types.ObjectId, ref: 'User' },
	code: String,
	name: { type: String,required: true},
	phone: { type: String,required: true,index: { unique: true, sparse: true }}
});

couponSchema.plugin(superPagination, {
    theme : 'bootstrap'
});

module.exports = mongoose.model('Coupon', couponSchema);