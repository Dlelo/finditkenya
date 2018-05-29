const mongoose = require('mongoose');
var superPagination = require('super-pagination').mongoose;
var sys = require(__dirname + '/../config/System');

var db = mongoose.connect(sys.db_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    user_id:  { type: Schema.Types.ObjectId, ref: 'User' },
		bizid:  { type: Schema.Types.ObjectId, ref: 'Business' },
		star: String,
		message: String,
		created_at: Date
});

reviewSchema.plugin(superPagination, {
    theme : 'bootstrap'
});

module.exports = mongoose.model('Review', reviewSchema);
