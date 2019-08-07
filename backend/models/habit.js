var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tickSchema = new Schema({
  id: { type: Number },
  createdAt: { type: String, required: true }
});

mongoose.model('Tick', tickSchema);

// we defined our user schema
var habitSchema = new Schema({
  id: { type: String, required: true, index: true, unique: true, dropDups: true },
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  ticks: [tickSchema],
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, required: true },
  createdBy: { type: String, required: true }
});

mongoose.model('Habit', habitSchema);
