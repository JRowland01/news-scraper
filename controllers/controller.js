var request = require("request");
var cheerio = require("cheerio");

var Note = require("../models/Note.js");
var Article = require("../models/Article.js");

module.exports = function(app) {

    app
        .get('/', function(req, res) {
            res.redirect('/articles');
        });

    app.get("/scrape", function(req, res) {
        console.log("/scrape");

        var newArticleCount = 0;
        var submissionDate = new Date();
        request("http://www.huffingtonpost.com", function(error, response, html) {
            //The html body will be saved into the variable called $ within cheerio
            var $ = cheerio.load(html);

            // Retrieves every a tag link within an article heading and iterate through it
            // and perform the following
            var block = $(".a-page__content").filter(function(i, elem) {
                return $(elem).attr("class").split(" ").length == 1;
            })
            block.find(".card__headlines").each(function(i, element) {
                var anchor = $(element).find("h2 > a");
                var title = anchor.text();
                var link = anchor.attr("href");

                var articleDesc = $(element).find(".card__description").text();

                if (title && link && articleDesc) {
                    // Saves an result object that is empty
                    var result = {};
                    newArticleCount++;
                    // Add the title, link and article summary and submission date
                    result.title = title;
                    result.link = link;
                    result.articleSnippet = articleDesc;
                    result.submissionDate = submissionDate;

                    //The Article model will create a new entry
                    Article.create(result, function(err, doc) {
                        
                        if (err) {
                            //Filter out duplicates
                        } else {
                            console.log(doc);
                        }
                    });
                }
               
            });
            console.log(newArticleCount);
            res.redirect("/");
        });
       
    });

    // This will get the scraped articles from the MongoDB.
    app.get("/articles", function(req, res) {


        Article.count({}, function(err, count) {
            if (!err && count === 0) {
                res.render("index", { result: [] });
            } else {
                populateArticles(res,"index");
            }
        });
    });

    function populateArticles(res, renderedPage) {
        var latest = "";
        Article
            .findOne({})
            .sort('-submissionDate') // give me the max
            .exec(function(err, doc) {

                if (err) {
                    console.log(err);

                } else {
                    latest = doc.submissionDate;
                    console.log(doc.submissionDate);
                    var query = { "submissionDate": latest };

                    if (renderedPage == "savedarticles"){
                      query.saved = true;
                    }
                    Article
                        .find(query, function(error, doc) {
                            // Log any errors
                            if (error) {
                                console.log(error // Or send the doc to the browser as a json object
                                );
                            } else {
                                console.log(doc[0].submissionDate);
                                res.render(renderedPage, { result: doc });
                            }
                            //Will sort the articles by most recent (1 = ascending order)
                        })
                        .sort({ '_id': 1 });
                }
                
            });


    }

    // Get an article by it's ObjectId
    app.get("/articles/:id", function(req, res) {
        // With the id passed through the id parameter, prepare a query that finds the
        // matching one in our db
        Article.findOne({ "_id": req.params.id })
            // Populate comments for each article
            .populate("note")
            // Executes the query
            .exec(function(error, doc) {
             
                if (error) {
                    console.log(error 
                    );
            // Otherwise, send the doc to the browser as a json object
                } else {
                    res.render("comments", { result: doc });
                }
            });
    });

    // Create a new comment
    app.post("/articles/:id", function(req, res) {
        // Create a new Note/Comment and pass the req.body to the entry
        Note.create(req.body, function(error, doc) {
            // Log any errors
            if (error) {
                console.log(error // Otherwise
                );
            } else {
                // Uses the article id to find and update its comment
                Article.findOneAndUpdate({
                        "_id": req.params.id
                    }, {
                        $push: {
                            "note": doc._id
                        }
                    }, {
                        safe: true,
                        upsert: true
                    })
                    // Execute the above query
                    .exec(function(err, doc) {
                        // Log any errors
                        if (err) {
                            console.log(err);
                        } else {
                            // Or send the document to the browser
                            res.redirect('back');
                        }
                    });
            }
        });
    });

    //Deletes article post and corresponding comment
    app.delete("/articles/:id/:commentid", function(req, res) {
        Note
            .findByIdAndRemove(req.params.commentid, function(error, doc) {
                // Log any errors
                if (error) {
                    console.log(error // Otherwise
                    );
                } else {
                    console.log(doc);
                    Article.findOneAndUpdate({
                            "_id": req.params.id
                        }, {
                            $pull: {
                                "comment": doc._id
                            }
                        })
                        // Execute the above query
                        .exec(function(err, doc) {
                            // Log any errors
                            if (err) {
                                console.log(err);
                            }
                        });
                }
            });
    });

    // Save an article
    app.get("/save/:id", function(req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the
        // matching one in our db...

        Article.findOneAndUpdate({
                    "_id": req.params.id
                }, {
                    "saved": true
                }
            )

            // Execute the above query
            .exec(function(err, doc) {
                // Log any errors
                if (err) {
                    console.log(err);
                } else {
                    // Or send the document to the browser
                    res.redirect("/articles");
                }
            });

    });

    //Allows the saved article to be unsaved
    app.get("/unsave/:id", function(req, res) {

        Article.findOneAndUpdate({
                    "_id": req.params.id
                }, {
                    "saved": false
                }

            )
            // Execute the above query
            .exec(function(err, doc) {
                // Log any errors
                if (err) {
                    console.log(err);
                } else {
                    // redirect user to the savedarticles page.
                    res.redirect("/savedarticles");
                }
            });

    });

  //Saves the selected articles
  app.get("/savedarticles", function(req, res) {
 
       Article.count({"saved": true}, function(err, count) {
            if (!err && count === 0) {
                res.render("savedarticles", { result: [] });
            } else {
                 populateArticles(res,"savedarticles");
            }
        });
  });


};
