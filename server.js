var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/message_board_db1');

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, './views'));

app.use(express.static(path.join(__dirname, './static')));
app.use(bodyParser.urlencoded({extended: false}));

var PostSchema = new Schema({
	name: String,
	post: String,
	_comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
});

var CommentSchema = new Schema({
	name: String,
	comment: String,
	_post: {type: Schema.Types.ObjectId, ref: 'Post'}
});

var Post = mongoose.model('Post', PostSchema);
var Comment = mongoose.model('Comment', CommentSchema);

app.get('/', function(req, res){
	Post.find({}).populate('_comments').exec(function(err, posts){
		console.log(posts);
		res.render('index', {posts: posts})
	})
	// Post.find({}, function(err, posts){
	// 	if(err){
	// 		console.log(err);
	// 		console.log('Summin broke');
	// 	}else{
	// 		res.render('index', {posts: posts});
	// 	}
	// })
});

app.post('/comments/:id', function(req, res){
	console.log(req.body);
	console.log(req.params);
	var comment_data = {name: req.body.name, comment: req.body.comment, post: req.params.id};
	var new_comment = new Comment(comment_data);
	Post.findOne({_id: req.params.id}, function(err, post){
		post._comments.push(new_comment);
		post.save(function(err, results){
			new_comment.save(function(err, comment_results){
				res.redirect('/');
			})
		})
	})
});

app.post('/posts', function(req, res){
	var new_post = new Post(req.body);
	console.log(new_post);
	new_post.save(function(err, results){
		if(err){
			console.log(err);
			console.log('something broke');
		}
		else{
			res.redirect('/');
		}
	})
});

app.listen(8000, function(){
	console.log('message board on port 8000');
})