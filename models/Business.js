const mongoose = require('mongoose');
var superPagination = require('super-pagination').mongoose;
var sys = require(__dirname + '/../config/System');

var db = mongoose.connect(sys.db_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');

const Schema = mongoose.Schema;

const bizSchema = new Schema({
		name: { type: String,required: true, index: { unique: true, sparse: true }},
		description: String,
		city: String,
		map: {
			lati: String,
			long: String,
			zoom: String
		},
		website: String,
		phone: String,
		email: String,
		keywords: String,
		slug: {
			type: String,
			unique: true
		},
		photo: String,
		catalog: Array,
		category: String,
		subcategory: String,
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
		amountpaid: String,
		packagepaid: String,
		datepaid: Date,
		date: Date,
		approved: Boolean,
		agentphone: String,
		user_id: String
});

bizSchema.plugin(superPagination, {
    theme : 'bootstrap'
});

module.exports = mongoose.model('Business', bizSchema);