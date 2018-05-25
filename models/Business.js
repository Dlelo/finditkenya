const mongoose = require('mongoose');
var superPagination = require('super-pagination').mongoose;
var mongoosastic=require("mongoosastic");
var dataTables = require('mongoose-datatables');

var sys = require(__dirname + '/../config/System');

var db = mongoose.connect(sys.db_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');

const Schema = mongoose.Schema;

const bizSchema = new Schema({
		name: { type: String,required: true, index: { unique: true, sparse: true }, es_indexed:true, es_boost:4.0},
		description: { type: String, es_indexed:true, es_boost:1.0 },
		city: String,
		map: {
			lati: String,
			long: String,
			zoom: String
		},
		website: String,
		phone: String,
		email: String,
		keywords: { type: String, es_indexed:true,es_boost:4.0 },
		slug: {
			type: String,
			unique: true
		},
		photo: String,
		catalog: Array,
		category: String,
		subcategory: { type: String, es_indexed:true, es_boost:3.0 },
		extras: Array,
		features: Array,
		street: String,
		building: String,
		youtube: String,
		deliverylink: String,
		bookinglink: String,
		facebook: String,
		twitter: String,
		instagram: String,
		linkedin: String,
		gallery: Array,
		reviews: [{
			rate: String,
			msg: String,
			user_id: String
		}],
		startdate: String,
		hoursopen: String,
		hoursclose: String,
		hours: {
			sunday: [ { _id:false, opens: String, closes: String } ],
			monday: [ { _id:false, opens: String, closes: String } ],
			tuesday: [ { _id:false, opens: String, closes: String } ],
			wednesday: [ { _id:false, opens: String, closes: String } ],
			thursday: [ { _id:false, opens: String, closes: String } ],
			friday: [ { _id:false, opens: String, closes: String } ],
			saturday: [ { _id:false, opens: String, closes: String } ]
		},
		starteventdate: Date,
		endeventdate: Date,
		paid: Boolean,
		fakepaid: Boolean,
		amountpaid: String,
		packagepaid: String,
		datepaid: Date,
		date: Date,
		approved: Boolean,
		agentphone: String,
		pending: Boolean,
		coupons: [{ type: Schema.Types.ObjectId, ref: 'Coupon' }],
		user_id: String
});

bizSchema.index({ name: 'text', description: 'text', keywords: 'text' });
bizSchema.plugin(dataTables);
bizSchema.plugin(superPagination, {
    theme : 'bootstrap'
});

bizSchema.plugin(mongoosastic, {
  hosts: [
    'localhost:9200'
  ]
});

const Promise = require("bluebird");
const Business = mongoose.model('Business', bizSchema);
Business.search = Promise.promisify(Business.search, { context: Business });
module.exports = Business;
