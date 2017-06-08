// Require mongoose
var mongoose = require("mongoose");
// Create a schema object constructor
var Schema = mongoose.Schema;

// Create the Note schema
var NoteSchema = new Schema({
  // name is a string that's required 
  name: {
    type: String,
    required: true
  },
  // body is a string that's required
  body: {
    type: String,
    required: true
  }
});

// Create the Note model with the NoteSchema
var Note = mongoose.model("Note", NoteSchema);

// Exports the Note model
module.exports = Note;
