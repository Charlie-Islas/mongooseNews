var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({ 

  headline: {
    type: String,
    required: true
  },

  summary: {
    type: String,
    required: true
  },

  url: {
    type: String,
    required: true
  },

  imageURL: {
    type: String,
    required: true
  },

  slug: {
    type: String
  },

  note: [{
    type: Schema.Types.ObjectId,
    ref: "Note"
  }]

}); 

var Article = mongoose.model("Article", ArticleSchema);
module.exports = Article;