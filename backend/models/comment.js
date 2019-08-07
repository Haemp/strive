var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// we defined our user schema
var commentSchema = new Schema({
  id: { type: String, required: true, index: true, unique: true, dropDups: true },
  category: {type: String, required: true },
  text: { type: String, default: '' },
  createdAt: { type: Date, required: true },
  createdBy: { type: String, required: true }
});

mongoose.model('Comment', commentSchema);
