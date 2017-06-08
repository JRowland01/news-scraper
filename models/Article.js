var mongoose = require("mongoose");

// Create Schema object constructor
var Schema = mongoose.Schema;

// Create an article schema
var ArticleSchema = new Schema({
  
  title: {
    type: String,
    required: true,
    unique: true
  },
  
  link: {
    type: String,
    required: true,
    unique: true //Unique set to true to prevent duplicates
  },
  articleSnippet: {
    type: String,
    required: true,
    unique: true //Unique set to true to prevent duplicates
  },

  //SubmissionDate is a required field used for finding the latest articles
    submissionDate: {
    type: Date,
    required: true,
    unique: false
  },

  // Saves an array of all the comments as a property of article schema
  // ref - reference to the Note model
  note: [
    {
      type: Schema.Types.ObjectId,
      ref: "Note"
    }
  ],

  //Saved is a required field that allows articles to be saved
  saved: {
    type: Boolean,
    default: false
  }

});

// Create the Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

// Exports the model
module.exports = Article;
