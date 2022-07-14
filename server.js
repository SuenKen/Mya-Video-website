const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
const fs = require('fs');
const formidable = require('express-formidable');
let express = require('express');
let app = express();
var cookieSession = require('cookie-session')
app.use(formidable());
const mongourl = '';
const dbName = 'mya';
const request = require('request');
let json1 = {};
let videolist = {};
var schedule = require('node-schedule');
const https = require('https');
var key = "";
const SECRETKEY = 'Mya';


app.use(cookieSession({
  name: 'LoginSession',
  keys: [SECRETKEY],
  maxAge: 30 * 60 * 1000
}))
app.set('view engine', 'ejs');

var c = schedule.scheduleJob({minute : 00}, 
function(){
handle_Video();
});

var d = schedule.scheduleJob({minute : 05}, 
function(){
handle_Edit2();
});

var e = schedule.scheduleJob({minute : 07}, 
function(){
handle_EditVideo();
});


const findDocument = (db, criteria, callback) => {
  let cursor = db.collection('mya').find(criteria).sort( { publishedAt: -1 } );
  //console.log(`findDocument: ${JSON.stringify(criteria)}`);
  cursor.toArray((err, docs) => {
    assert.equal(err, null);
    console.log(`findDocument: ${docs.length}`);
    callback(docs);
  });
}

const handle_Find = (res, criteria) => {
  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);

    findDocument(db, criteria, (docs) => {
      client.close();
      console.log("Closed DB connection");
      console.log(docs);
      //res.render('find', { docs: docs });


    });
  });
}

const handle_Insert = (criteria) => {
  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    insertDocument(db, criteria, (doc) => {
      client.close();
      console.log("Closed DB connection");
      console.log(doc);
      //res.render('insert', { doc: doc });
    });
  });
}


const insertDocument = (db, doc, callback) => {
  db.collection('mya').
    insertOne(doc, (err, results) => {
      assert.equal(err, null);
      console.log(`Inserted document(s): ${results.insertedCount}`);
      callback(doc);

    });
}
const handle_FindVideo = (res, criteria,req) => {

  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);

    findDocument(db, criteria, (docs) => {
      client.close();
      console.log("Closed DB connection");
      //console.log(docs);
      res.render('video', { docs: docs });
      
    });
  }); 

}


async function handle_Video (nextpage){
  var jsonObj = {
   "items":[
   ]
};

if(nextpage!= null){
https.get('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails,status&playlistId=UUVDrzfo7NnOvNx8dU-Ebitg&key='+key+'&maxResults=2000&pageToken='+nextpage, (resp) => {
  let data = '';

  // A chunk of data has been received.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
		videolist = JSON.parse(data);
    //console.log(JSON.parse(data));
  });

})
}else{
https.get('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails,status&playlistId=UUVDrzfo7NnOvNx8dU-Ebitg&key='+key+'&maxResults=2000', (resp) => {
  let data = '';

  // A chunk of data has been received.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
		videolist = JSON.parse(data);
    //console.log(JSON.parse(data));
  });

})

}


console.log(nextpage);
var url;
var photo;
var title;
var publishedAt;
var pageToken = "";
    const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
if(typeof videolist != "undefined"){
  if(videolist.error == null){
    if(videolist.nextPageToken != null){
    pageToken = videolist.nextPageToken;}
videolist.items.forEach(function(t,i){
    const doc =
  {
    "url": null,
    "title": null,
    "photo": null,
    "publishedAt":null
  }
    ;
  //console.log(videolist.items[i].snippet.thumbnails.maxres);
  url = videolist.items[i].contentDetails.videoId;
  title = videolist.items[i].snippet.title;
  publishedAt = videolist.items[i].snippet.publishedAt;
  if(videolist.items[i].snippet.thumbnails.maxres == null){
  photo = "https://i.ytimg.com/vi/"+url+ "/hqdefault.jpg";}else{
    photo = "https://i.ytimg.com/vi/"+url+ "/maxresdefault.jpg";
  }
  doc.url = url;
  doc.title = title;
  doc.photo = photo;
  doc.publishedAt = publishedAt;
   let DOCID = {};
    DOCID['url'] = url;
    console.log("123"+DOCID);
    let cursor = db.collection('mya').find(DOCID);
    console.log(`findDocument: ${JSON.stringify(DOCID)}`);
    cursor.toArray((err, docs) => {
      assert.equal(err, null);
      console.log(`findDocument: ${docs.length}`);
      if (docs.length > 0) {
      } else {
      handle_Insert(doc);
      }
    });
    
  
  //jsonObj.push({"id":jsonObj.items.length,"url":url,"title":title,"photo":photo});
})
if(videolist.nextPageToken != null){
    pageToken = videolist.nextPageToken;
    handle_Video(pageToken);
    }
}

}
//console.log(jsonObj);

//res.render('video', { docs: jsonObj });

 });
 //handle_FindVideo(res,req.quary);
 
}

const findDocument_edit = (db, criteria, callback) => {
  let cursor = db.collection('edit').find(criteria).sort( { publishedAt: -1 } );
  console.log(`findDocument: ${JSON.stringify(criteria)}`);
  cursor.toArray((err, docs) => {
    assert.equal(err, null);
    console.log(`findDocument: ${docs.length}`);
    callback(docs);
  });
}

const handle_FindEditVideo = (res, criteria,req) => {

  if(true){
  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);

    findDocument_edit(db, criteria, (docs) => {
      client.close();
      console.log("Closed DB connection");
      //console.log(docs);
      res.render('edit', { docs: docs});
      
    });
  });
}
}


const findDocument_all = (db, criteria, callback) => {
  let cursor = db.collection('edit').find(criteria).sort( { publishedAt: -1 } );
  console.log(`findDocument: ${JSON.stringify(criteria)}`);
  cursor.toArray((err, docs) => {
    assert.equal(err, null);
    console.log(`findDocument: ${docs.length}`);
    callback(docs);
  });
}

const findDocument_all2 = (db, criteria, callback) => {
  let cursor = db.collection('mya').find(criteria).sort( { publishedAt: -1 } );
  console.log(`findDocument: ${JSON.stringify(criteria)}`);
  cursor.toArray((err, docs) => {
    assert.equal(err, null);
    console.log(`findDocument: ${docs.length}`);
    callback(docs);
  });
}

const handle_FindAll = (res, criteria,req) => {
  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);

    findDocument_all(db, criteria, (docs) => {
      client.close();
      console.log("Closed DB connection");
      alldoc1 = docs;
      res.render('find', { docs: docs });
    });
  });
}

const handle_FindAll2 = (res, criteria,req) => {
  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);

    findDocument_all2(db, criteria, (docs) => {
      client.close();
      console.log("Closed DB connection");
      alldoc1 = docs;
      res.render('find2', { docs: docs});
    });
  });
}

const handle_Insert_edit = (criteria) => {
  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    db.collection('edit').
    insertOne(criteria, (err, results) => {
      assert.equal(err, null);
      console.log(`Inserted document(s): ${results.insertedCount}`);
    });
  });


}

async function handle_EditVideo  (nextpage)  {
  var jsonObj = {
   "items":[
   ]
};

if(nextpage!= null){
https.get('https://www.googleapis.com/youtube/v3/search?part=snippet&q=https://www.youtube.com/channel/UCVDrzfo7NnOvNx8dU-Ebitg&key='+key+'&type=video&maxResults=2000&pageToken='+nextpage, (resp) => {
  let data = '';

  // A chunk of data has been received.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
		videolist = JSON.parse(data);
    //console.log(JSON.parse(data));
  });

})
}else{
https.get('https://www.googleapis.com/youtube/v3/search?part=snippet&q=https://www.youtube.com/channel/UCVDrzfo7NnOvNx8dU-Ebitg&key='+key+'&type=video&maxResults=2000', (resp) => {
  let data = '';

  // A chunk of data has been received.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
		videolist = JSON.parse(data);
    //console.log(JSON.parse(data));
  });

})
}
console.log(videolist);
var url;
var photo;
var title;
var publishedAt;
var channel;
var channelTitle;
    const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db("mya");
if(typeof videolist != "undefined"){
  if(videolist.error == null){
    if(videolist.nextPageToken != null){
    pageToken = videolist.nextPageToken;}
videolist.items.forEach(function(t,i){
    const doc =
  {
    "url": null,
    "title": null,
    "photo": null,
    "publishedAt":null,
    "channel":null,
    "channelTitle":null
  }
    ;
  //console.log(videolist.items[i].snippet.thumbnails.maxres);
  url = videolist.items[i].id.videoId;
  title = videolist.items[i].snippet.title;
  publishedAt = videolist.items[i].snippet.publishedAt;
  channel = videolist.items[i].snippet.channelId;
  channelTitle = videolist.items[i].snippet.channelTitle;
  console.log(channel);
  if(videolist.items[i].snippet.thumbnails.maxres == null){
  photo = "https://i.ytimg.com/vi/"+url+ "/hqdefault.jpg";}else{
    photo = "https://i.ytimg.com/vi/"+url+ "/maxresdefault.jpg";
  }
  console.log(url);
  doc.url = url;
  doc.title = title;
  doc.photo = photo;
  doc.publishedAt = publishedAt;
  doc.channel = channel;
  doc.channelTitle = channelTitle;
  //console.log(doc);
   let DOCID = {};
    DOCID['url'] = url;
    //console.log(DOCID);
    let cursor = db.collection('edit').find(DOCID);
    console.log(`findDocument: ${JSON.stringify(DOCID)}`);
    cursor.toArray((err, docs) => {
      assert.equal(err, null);
      console.log(`findDocument: ${docs.length}`);
      if (docs.length > 0) {
      } else {
        if(doc.channel != "UCVDrzfo7NnOvNx8dU-Ebitg" && doc.channel!= "UCGXNK0v0rC1wp4KB8AqnTLQ" && doc.channel!= "UCl0veAEk3bR1_zJ-_hHjxow"){
      handle_Insert_edit(doc);}
      }
    });
    
  
  //jsonObj.push({"id":jsonObj.items.length,"url":url,"title":title,"photo":photo});
})

if(videolist.nextPageToken != null){
    handle_EditVideo(pageToken);
    }
}}
//console.log(jsonObj);
//res.render('video', { docs: jsonObj });
 });
 //handle_Edit2(req, res);
 
 }

 function handle_Edit2  (nextpage) {
  var jsonObj = {
   "items":[
   ]
};


if(nextpage!= null){
https.get('https://www.googleapis.com/youtube/v3/search?part=snippet&q=https://www.youtube.com/c/gummy_forest&key='+key+'&type=video&maxResults=2000&pageToken='+nextpage, (resp) => {
  let data = '';

  // A chunk of data has been received.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
		videolist = JSON.parse(data);
    //console.log(JSON.parse(data));
  });

})
}else{
https.get('https://www.googleapis.com/youtube/v3/search?part=snippet&q=https://www.youtube.com/c/gummy_forest&key='+key+'&type=video&maxResults=2000', (resp) => {
  let data = '';

  // A chunk of data has been received.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
		videolist = JSON.parse(data);
    //console.log(JSON.parse(data));
  });

})
}

console.log(videolist);
var url;
var photo;
var title;
var publishedAt;
var channel;
var channelTitle;
    const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db("mya");
if(typeof videolist != "undefined"){
  if(videolist.error == null){
    if(videolist.nextPageToken != null){
    pageToken = videolist.nextPageToken;}
videolist.items.forEach(function(t,i){
    const doc =
  {
    "url": null,
    "title": null,
    "photo": null,
    "publishedAt":null,
    "channel":null,
    "channelTitle":null
  }
    ;
  //console.log(videolist.items[i].snippet.thumbnails.maxres);
  url = videolist.items[i].id.videoId;
  title = videolist.items[i].snippet.title;
  publishedAt = videolist.items[i].snippet.publishedAt;
  channel = videolist.items[i].snippet.channelId;
  channelTitle = videolist.items[i].snippet.channelTitle;
  console.log(channel);
  if(videolist.items[i].snippet.thumbnails.maxres == null){
  photo = "https://i.ytimg.com/vi/"+url+ "/hqdefault.jpg";}else{
    photo = "https://i.ytimg.com/vi/"+url+ "/maxresdefault.jpg";
  }
  console.log(url);
  doc.url = url;
  doc.title = title;
  doc.photo = photo;
  doc.publishedAt = publishedAt;
  doc.channel = channel;
  doc.channelTitle = channelTitle;
  //console.log(doc);
   let DOCID = {};
    DOCID['url'] = url;
    //console.log(DOCID);
    let cursor = db.collection('edit').find(DOCID);
    console.log(`findDocument: ${JSON.stringify(DOCID)}`);
    cursor.toArray((err, docs) => {
      assert.equal(err, null);
      console.log(`findDocument: ${docs.length}`);
      if (docs.length > 0) {
      } else {
        if(doc.channel != "UCVDrzfo7NnOvNx8dU-Ebitg" && doc.channel!= "UCGXNK0v0rC1wp4KB8AqnTLQ" && doc.channel!= "UCl0veAEk3bR1_zJ-_hHjxow"){
      handle_Insert_edit(doc);}
      }
    });
    
  
  //jsonObj.push({"id":jsonObj.items.length,"url":url,"title":title,"photo":photo});
})
if(videolist.nextPageToken != null){
    handle_Edit2(pageToken);
    }
}}
//console.log(jsonObj);

//res.render('video', { docs: jsonObj });

 });
 //andle_FindEditVideo(res,req.quary);
 
}

 function handle_Edit3  (nextpage) {
  var jsonObj = {
   "items":[
   ]
};


if(nextpage!= null){
https.get('https://www.googleapis.com/youtube/v3/search?part=snippet&q=@米亞MYA【香港VTuber】&key='+key+'&type=video&maxResults=2000&pageToken='+nextpage, (resp) => {
  let data = '';

  // A chunk of data has been received.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
		videolist = JSON.parse(data);
    //console.log(JSON.parse(data));
  });

})
}else{
https.get('https://www.googleapis.com/youtube/v3/search?part=snippet&q=@米亞MYA【香港VTuber】&key='+key+'&type=video&maxResults=2000', (resp) => {
  let data = '';

  // A chunk of data has been received.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
		videolist = JSON.parse(data);
    //console.log(JSON.parse(data));
  });

})
}

console.log(videolist);
var url;
var photo;
var title;
var publishedAt;
var channel;
var channelTitle;
    const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db("mya");
if(typeof videolist != "undefined"){
  if(videolist.error == null){
    if(videolist.nextPageToken != null){
    pageToken = videolist.nextPageToken;}
videolist.items.forEach(function(t,i){
    const doc =
  {
    "url": null,
    "title": null,
    "photo": null,
    "publishedAt":null,
    "channel":null,
    "channelTitle":null
  }
    ;
  //console.log(videolist.items[i].snippet.thumbnails.maxres);
  url = videolist.items[i].id.videoId;
  title = videolist.items[i].snippet.title;
  publishedAt = videolist.items[i].snippet.publishedAt;
  channel = videolist.items[i].snippet.channelId;
  channelTitle = videolist.items[i].snippet.channelTitle;
  console.log(channel);
  if(videolist.items[i].snippet.thumbnails.maxres == null){
  photo = "https://i.ytimg.com/vi/"+url+ "/hqdefault.jpg";}else{
    photo = "https://i.ytimg.com/vi/"+url+ "/maxresdefault.jpg";
  }
  console.log(url);
  doc.url = url;
  doc.title = title;
  doc.photo = photo;
  doc.publishedAt = publishedAt;
  doc.channel = channel;
  doc.channelTitle = channelTitle;
  //console.log(doc);
   let DOCID = {};
    DOCID['url'] = url;
    //console.log(DOCID);
    let cursor = db.collection('edit').find(DOCID);
    console.log(`findDocument: ${JSON.stringify(DOCID)}`);
    cursor.toArray((err, docs) => {
      assert.equal(err, null);
      console.log(`findDocument: ${docs.length}`);
      if (docs.length > 0) {
      } else {
        if(doc.channel != "UCVDrzfo7NnOvNx8dU-Ebitg" && doc.channel!= "UCGXNK0v0rC1wp4KB8AqnTLQ" && doc.channel!= "UCl0veAEk3bR1_zJ-_hHjxow"){
      handle_Insert_edit(doc);}
      }
    });
    
  
  //jsonObj.push({"id":jsonObj.items.length,"url":url,"title":title,"photo":photo});
})
if(videolist.nextPageToken != null){
    handle_Edit3(pageToken);
    }
}}
//console.log(jsonObj);

//res.render('video', { docs: jsonObj });

 });
 //andle_FindEditVideo(res,req.quary);
 
}

const handle_AddVideo = (res, req) => {
  var db1;
    var jsonObj = {
   "items":[
   ]
};
console.log(req.fields);
if(req.fields.vtype == "edit"){
db1 = "edit";
}else if(req.fields.vtype == "video"){
db1 = "mya";
}
https.get('https://www.googleapis.com/youtube/v3/videos?id='+req.fields.vid+'&part=contentDetails,snippet&key='+key, (resp) => {
  let data = '';

  // A chunk of data has been received.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
		videolist = JSON.parse(data);
    console.log(JSON.parse(data));
  });
})
var url;
var photo;
var title;
var publishedAt;
var channel;
var channelTitle;
console.log(videolist);
    const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db("mya");
if(typeof videolist != "undefined"){
  if(videolist.error == null){
videolist.items.forEach(function(t,i){
  const doc =
  {
    "url": null,
    "title": null,
    "photo": null,
    "publishedAt":null,
    "channel":null,
    "channelTitle":null,
  };

    
  //console.log(videolist.items[i].snippet.thumbnails.maxres);
  url = videolist.items[i].id;
  title = videolist.items[i].snippet.title;
  publishedAt = videolist.items[i].snippet.publishedAt;
  channel = videolist.items[i].snippet.channelId;
  channelTitle = videolist.items[i].snippet.channelTitle;
  console.log(channel);
    if(req.fields.vtype == "edit"){
  photo = "https://i.ytimg.com/vi/"+url+ "/hqdefault.jpg";}else if(req.fields.vtype == "video"){
    photo = "https://i.ytimg.com/vi/"+url+ "/maxresdefault.jpg";
  }
  console.log(url);
  doc.url = url;
  doc.title = title;
  doc.photo = photo;
  doc.publishedAt = publishedAt;
  doc.channel = channel;
  doc.channelTitle = channelTitle;
  //console.log(doc);
   let DOCID = {};
    DOCID['url'] = url;
    //console.log(DOCID);
    let cursor = db.collection(db1).find(DOCID);
    console.log(`findDocument: ${JSON.stringify(DOCID)}`);
    cursor.toArray((err, docs) => {
      assert.equal(err, null);
      console.log(`findDocument: ${docs.length}`);
      if (docs.length > 0) {
        res.render('fail' );
      } else {
        if(doc.channel != "UCVDrzfo7NnOvNx8dU-Ebitg" && doc.channel!= "UCGXNK0v0rC1wp4KB8AqnTLQ" && doc.channel!= "UCl0veAEk3bR1_zJ-_hHjxow"){
          if(req.fields.vtype == "edit"){
      handle_Insert_edit(doc);
      res.render('sucess');
      }
      }
      if(doc.channel == "UCVDrzfo7NnOvNx8dU-Ebitg"){
      if(req.fields.vtype == "video"){
         handle_Insert(doc);
         res.render('sucess');
      }}
      
      }});
    
  
  //jsonObj.push({"id":jsonObj.items.length,"url":url,"title":title,"photo":photo});
})
}}
 });
}

const handle_Del2 = (res, criteria,req) => {
  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);

    /* use Document ID for query */
    let DOCID = {};
    DOCID['_id'] = ObjectID(criteria._id)
     db.collection('edit').deleteMany(DOCID,(err,results) => {
      assert.equal(err,null)
       client.close();
         res.render('sucess' );
            })
  });
}

const handle_Del = (res, criteria,req) => {
  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);

    /* use Document ID for query */
    let DOCID = {};
    DOCID['_id'] = ObjectID(criteria._id)
     db.collection('mya').deleteMany(DOCID,(err,results) => {
      assert.equal(err,null)
       client.close();
         res.render('sucess' );
            })
  });
}

const getDescription = (uid) => {

  var description ;
   request('https://www.googleapis.com/youtube/v3/videos?id='+uid+'&part=snippet&key=', { json: true }, (err, res, body) => {
    if (err) { return console.log(err); }
    //console.log(body.items[0].snippet.description);
    j1 = body;
  });
//console.log(j1.items[0].snippet.description);
description = j1.items[0].snippet.description;
return description;
}

app.get('/', (req, res) => {
res.render('home');
})

app.get('/info', (req, res) => {
res.render('intro');

})

app.get('/insert', (req, res) => {
res.render('insert');
})

app.get('/video', (req, res) => {
  handle_FindVideo(res,req.quary,req);
}) 

app.get('/find', (req, res) => {
  handle_FindAll(res,req.quary,req);
}) 

app.get('/find2', (req, res) => {
  handle_FindAll2(res,req.quary,req);
}) 
app.post('/add', (req, res) => {
  handle_AddVideo(res,req);
})
app.get('/del', (req, res) => {
  handle_Del(res, req.query,req);
})

app.get('/del2', (req, res) => {
  handle_Del2(res, req.query,req);
})
app.get('/edit', (req, res) => {
  handle_FindEditVideo(res,req.quary,req);
//handle_EditVideo();
 //console.log(getDescription("13tlbyO5g0c"));
})

app.get('/*', (req, res) => {
  //res.status(404).send(`${req.path} - Unknown request!`);
  res.status(404).render('ErrorRequest', { message: `${req.path} -  Is Unknown request!`, req: req} );
})


app.listen(app.listen(process.env.PORT || 8099));
