const mongoose = require('mongoose');
var superPagination = require('super-pagination').mongoose;
var sys = require(__dirname + '/../config/System');


var db = mongoose.connect(sys.db_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');
const arrayUniquePlugin = require('mongoose-unique-array');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const couponSchema = new Schema({
	userid: { type: Schema.Types.ObjectId, ref: 'User' },
	name: { type: String,required: true},
	bizid: { type: Schema.Types.ObjectId, ref: 'Business' },
	description: String,
	type: String,
	users: [
		{
			user_id: { type: Schema.Types.ObjectId, ref: 'User', unique: true},
			code: String,
			status: Boolean
		}
	],
	status: Boolean
});

couponSchema.plugin(superPagination, {
    theme : 'bootstrap'
});
couponSchema.plugin(arrayUniquePlugin);

module.exports = mongoose.model('Coupon', couponSchema);