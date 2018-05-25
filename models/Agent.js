const mongoose = require('mongoose');
var superPagination = require('super-pagination').mongoose;
var sys = require(__dirname + '/../config/System');

var db = mongoose.connect(sys.db_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');

const Schema = mongoose.Schema;

const agentSchema = new Schema({
		name: { type: String,required: true},
		phone: { type: String,required: true,index: { unique: true, sparse: true }}
});

agentSchema.plugin(superPagination, {
    theme : 'bootstrap'
});

module.exports = mongoose.model('Agent', agentSchema);