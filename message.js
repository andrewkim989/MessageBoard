var express = require("express");
var app = express();
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/messageboard");

var ReplySchema = new mongoose.Schema({
    name: {type: String, required: [true, "Please type in your name"]},
    reply: {type: String, required: [true, "Please type in a reply"],
    minlength: [5, "Replies must be at least 5 characters long"]}
}, {timestamps: true});
var CommentSchema = new mongoose.Schema({
    name: {type: String, required: [true, "Please type in your name"]},
    comment: {type: String, required: [true, "Please type in a comment"],
    minlength: [10, "Comments must be at least 10 characters long"]},
    replies: [ReplySchema]
}, {timestamps: true });

mongoose.model("Comment", CommentSchema);
mongoose.model("Reply", ReplySchema);
var Comment = mongoose.model("Comment");
var Reply = mongoose.model("Reply");

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

var path = require("path");
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

var session = require('express-session');
const flash = require("express-flash");
app.use(session({
    secret: 'secretmessage',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));
app.use(flash());

app.get('/', function(req, res) {
    Comment.find({}, function(err, comments) {
        if (err) {
            console.log("Error. Comments not found");
        }
        else {
            res.render("board", {comments: comments.reverse()});
        }
    })
})

app.post("/comment", function(req, res) {
    var comment = new Comment({name: req.body.name, comment: req.body.comment});
    comment.save(function(err) {
        //console.log(req.body);
        if(err) {
            for(var key in err.errors){
                req.flash("comment", err.errors[key].message);
            }
            res.redirect("/");
        }
        else {
            res.redirect("/");
        }
    })
});

app.post("/reply/:id", function(req, res) {
    Comment.findOne({_id: req.params.id}, function(err, comment) {
        if (err) {
            console.log("Cannot find comment");
        }
        else {
            var reply = new Reply({name: req.body.name, reply: req.body.reply});
            
            //console.log(comment);
            //console.log(reply);
            reply.save(function(err) {
                if(err) {
                    for(var key in err.errors){
                        req.flash("reply", err.errors[key].message);
                    }
                    res.redirect("/");
                }
                else {
                    comment.replies.push(reply);
                    comment.save();
                    res.redirect("/");
                }
            })
        }
    });
});

app.listen(2222, function() {
    console.log("listening on port 2222");
});