var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dataPointSchema = new Schema({
  id: { type: Number},
  value: { type: String, required: true },
  log: { type: String, default: '' },
  createdAt: { type: Date, required: true }
});

mongoose.model('DataPoint', dataPointSchema);

// we defined our user schema
var monitorSchema = new Schema({
  id: { type: String, required: true, index: true, unique: true, dropDups: true },
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  dataPoints: [dataPointSchema],
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, required: true },
  createdBy: { type: String, required: true }
});

mongoose.model('Monitor', monitorSchema);
