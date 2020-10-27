const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const app =  express();
app.use(bodyParser.json());
app.use(cors());
bodyParser.urlencoded({ extended: false })

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lirp7.mongodb.net/activitydb?retryWrites=true&w=majority`
const port = 5423;



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const activity = client.db("activitydb").collection("allactivity");
//   perform actions on the collection object
    app.get('/allactivity', (req, res)=>{
        activity.find({}).limit(20)
        .toArray((err, documents)=>{
            res.send(documents)
        })
    })
   app.get('/task', (req, res)=>{
       const filter = req.query.filter;
       console.log(filter);
       activity.find({pic: {$regex: filter}})
       .toArray((err, documents)=>{
           res.status(200).send(documents)
       })
   })
});

client.connect(err => {
    const activity = client.db("activitydb").collection("newactivity");
  //   perform actions on the collection object
      app.post('/newactivity', (req, res)=>{
          activity.insertOne(req.body)
      })
      app.get('/activitylist', (req, res)=>{
          activity.find({})
          .toArray((err, documents)=>{
              res.send(documents)
          })
      })
      app.get('/myactivitylist', (req,res)=>{
        activity.find({email: req.query.email})
        .toArray((err, documents)=>{
            res.send(documents)
        })
      })

      app.delete('/deleteactivity/:id', (req, res)=>{
          activity.deleteOne({_id: ObjectId(req.params.id)})
          .then(result=>{
              console.log(result)
          })
      })
      
  });


app.get('/', (req,res)=>{
    res.send('port openned')
})

app.listen(port)