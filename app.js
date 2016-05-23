var express = require('express');
var app = express();

var MongoClient = require('mongodb').MongoClient
, assert = require('assert')
, ObjectID = require('mongodb').ObjectID
, db_url = 'mongodb://localhost:27017/videos';

var create_video = function(user_id, url, callback) {
    MongoClient.connect(db_url, function (err, db) {
	var videos = db.collection('videos');
	var likes = [];
	var dislikes = [];
	var id = new ObjectID();
        videos.insert([ {id: id, url: url, likes: likes, dislikes: dislikes, user_id: user_id} ], function(err, result) {
            assert.equal(err, null);
            callback(err, result);
        });
    });
}

var create_user = function(user_id, callback) {
    MongoClient.connect(db_url, function (err, db) {
	var users = db.collection('users');
	var id = new ObjectID();
	var watched_videos = [];
	var liked_videos = [];
	var disliked_videos = [];
        users.insert([ {id: id, user_id: user_id, watched_videos: watched_videos, liked_videos: liked_videos, disliked_videos: disliked_videos} ], function(err, result) {
            assert.equal(err, null);
            callback(err, result);
        });
    });
}

var get_unseen_video = function(user_id, callback) {
    MongoClient.connect(db_url, function(err, db) {
	var users = db.collection('users');
        var videos = db.collection('videos');
	var user = users.findOne({user_id:user_id});
	if (!user.watched_videos) {
            user.watched_videos = [];
	}
	var video = videos.findOne({id: {$nin: user.watched_videos}});
	if (video.id) {
            user.watched_videos.push(video.id);
            users.update(user)
            callback(err, video);
	} else {
            callback(err, "No More Videos")
	}
    });
}

var like = function(user_id, video_url, callback) {
    MongoClient.connect(db_url, function(err, db) {
        var users = db.collection('users');
        var videos = db.collection('videos');
        var user = users.findOne({user_id:user_id});
        var video = videos.findOne({url:video_url});
        if (users.liked_videos){
	    user.liked_videos.push(video.id);
	} else {
	    user.liked_videos = [ video.id ];
	}
	users.update(user);
	if (video.likes) {
	    video.likes.push(user.id);
	} else {
	    video.likes = [ user.id ]
	}
	videos.update(video);
	callback(err, "ok");
    });
}

var dislike = function(user_id, video_url, callback) {
    MongoClient.connect(db_url, function(err, db) {
        var users = db.collection('users');
        var videos = db.collection('videos');
        var user = users.findOne({user_id:user_id});
        var video = videos.findOne({url:video_url});
        if (users.disliked_videos){
	    user.disliked_videos.push(video.id);
	} else {
	    user.disliked_videos = [ video.id ];
	}
	users.update(user);
	if (video.dislikes) {
	    video.dislikes.push(user.id);
	} else {
	    video.dislikes = [ user.id ]
	}
	videos.update(video);
	callback(err, "ok");
    });
}


app.get('/', function (req, res) {
  res.send('Let&apos;s make some videos!');
});

app.post('/videos', function (req, res) {
    create_video(req.user_id, req.url, function(error, result) {
        if (error) {
	    res.status(500).json({error:error});
	} else {
            res.status(200).json({status:"ok"});
	}
    })
});

app.post('/users', function (req, res) {
    create_user(req.user_id, function(error, result) {
        if (error) {
	    res.status(500).json({error:error});
	} else {
            res.status(200).json({status:"ok"});
	}
    });
});

app.get('/videos/unseen', function(req, res) {
    get_unseen_video(req.user_id, function(error, result) {
        if (error) {
	    res.status(500).json({error:error});
	} else {
	    console.log(result);
            res.status(200).json({video:result})
	}
    });
});

app.post('/videos/:id/like', function(req, res) {
    var video_id = req.params.id;
    like(video_id, req.user_id, function(error,result){
        if (error) {
	    res.status(500).json({error:error});
	} else {
            res.status(200).json({status:"ok"});
	}
    });
});

app.post('/videos/:id/dislike', function(req, res) {
    var video_id = req.params.id;
    dislike(video_id, req.user_id, function(error,result){
        if (error) {
	    res.status(500).json({error:error});
	} else {
            res.status(200).json({status:"ok"});
	}
    });
});

app.listen(3030, function () {
  console.log('Listening on port 3030');
});


