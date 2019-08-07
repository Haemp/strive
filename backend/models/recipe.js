var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// we defined our user schema
var recipeSchema = new Schema({
  id: { type: String, required: true, index: true, unique: true, dropDups: true },
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  monitors: [{type: String}],
  habits: [{type: String}],
  copiedFrom: {type: String},
  published: {type: Boolean},
  createdAt: { type: Date, required: true },
  createdBy: { type: String, required: true }
});

mongoose.model('Recipe', recipeSchema);
