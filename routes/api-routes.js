var axios = require("axios");
var cheerio = require("cheerio");
var db = require("../models");

module.exports=function(app){

    app.get("/api/search", function(req, res) {
        // First, we grab the body of the html with axios
        axios.get("https://www.npr.org/sections/news/").then(function(response) {
          // Then, we load that into cheerio and save it to $ for a shorthand selector
          var $ = cheerio.load(response.data);
          var hbsObj={
            data:[]
          };

          $("article").each(function(i, element) {
                       
            var image=$(element).children('.item-image').children('.imagewrap').children('a').children('img').attr('src');
            
            if (image) {

              var imageLength = image.length;
              var imageHighRes = image.substr(0, imageLength - 11) + "800-c100.jpg";
    
              hbsObj.data.push({ 
                headline: $(element).children('.item-info').children('.title').children('a').text(),
                summary: $(element).children('.item-info').children('.teaser').children('a').text(),
                url: $(element).children('.item-info').children('.title').children('a').attr('href'),
                imageURL: imageHighRes,
                slug: $(element).children('.item-info').children('.slug-wrap').children('.slug').children('a').text(),
                comments: null
              }); 
            } 
          });

          res.render("index", hbsObj);
        });
      });
    
  app.get("/api/savedArticles", function (req, res) {

    db.Article.find({}). 
      then(function (dbArticle) {
        res.json(dbArticle);
      }).catch(function (err) {
        res.json(err);
      });

  });

  app.post("/api/add",function(req,res){

    var article=req.body;

    db.Article.findOne({url: article.url}).
    then(function(response){

      if(response===null){
        db.Article.create(article).then(function(response){
          console.log("article was created");
        }).catch(function(err){
          res.json(err);
        });
      }
      //in this way, the article is only created if it has not been created before
      res.send("Article successfully saved");
    }).catch(function(err){
      res.json(err);
    });

  });

  app.post("/api/deleteArticle",function(req,res){
    var article=req.body;

    db.Article.findByIdAndRemove(article["_id"]).then(function(response){
      if(response){
        res.send("Article successfully deleted");
      }
    });

  });

  app.post("/api/deleteComment",function(req,res){
    var note=req.body;

    db.Note.findByIdAndRemove(note["_id"]).then(function(response){
      if(response){
        res.send("Note successfully deleted");
      }
    });

  });

  app.post("/api/createNotes",function(req,res){

    var article=req.body;

    db.Note.create(article.body).then(function(dbNote){
      return db.Article.findOneAndUpdate({
        _id: article.articleID.articleID
      }, {
        $push: {
          note: dbNote._id
        }
      });
    }).then(function(dbArticle) {
      res.json(dbArticle);
    }).catch(function(err) {
      res.json(err);
    });
    });

  app.post("/api/populateNote",function(req,res){

    db.Article.findOne({_id: req.body.articleID}).populate("Note"). 
    then((response) => {

      if (response.note.length == 1) {

        db.Note.findOne({'_id': response.note}).then((comment) => {
          comment = [comment];
          console.log("Sending Back One Comment");
          res.json(comment); 
        });

      } else { 
        db.Note.find({
          '_id': {
            "$in": response.note
          }
        }).then((comments) => {
          res.json(comments); 
        });
      }
    }).catch(function(err) {
      res.json(err);
    });
  });
};

