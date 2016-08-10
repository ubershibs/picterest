var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//user Schema
var picSchema = new Schema({
  url: String,
  posters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  title: String,
  likers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

mongoose.model('Pic', picSchema);
