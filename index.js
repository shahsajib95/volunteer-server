const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const app = express();
app.use(bodyParser.json());
app.use(cors());
bodyParser.urlencoded({ extended: false })

const admin = require("firebase-admin");

const serviceAccount = require("./volunteer-network-2020-26087-firebase-adminsdk-jthjc-4523479821.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://volunteer-network-2020-26087.firebaseio.com"
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lirp7.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const activity = client.db("activitydb").collection("allactivity");
    //   perform actions on the collection object
    app.get('/allactivity', async (req, res) => {
        activity.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    // app.post('/addevent', async  (req, res, next)=>{
    //     // activity.insertOne(req.body)
    // })

    app.get('/task', async (req, res) => {
        const filter = req.query.filter;
        console.log(filter);
        activity.find({ pic: { $regex: filter } })
            .toArray((err, documents) => {
                res.status(200).send(documents)
            })
    })
});

client.connect(err => {
    const activity = client.db("activitydb").collection("newactivity");
    //   perform actions on the collection object
    app.post('/newactivity', async (req, res) => {
        activity.insertOne(req.body)
        res.redirect('my-activity')
    })
    app.get('/activitylist', async (req, res) => {
        activity.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })
    app.get('/myactivitylist', async (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1]
            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    let tokenEmail = decodedToken.email;
                    if (tokenEmail === req.query.email) {
                        activity.find({ email: req.query.email })
                            .toArray((err, documents) => {
                                res.send(documents)
                            })
                    }
                    else{
                        res.status(401).send('Un Authorized Access')
                    }
                }).catch(function (error) {
                    // Handle error
                });
        }
        else{
            res.status(401).send('Un Authorized Access')
        }


    })

    app.delete('/deleteactivity/:id', async (req, res) => {
        activity.deleteOne({ _id: ObjectId(req.params.id) })
          .then(result=>{
              res.send(result.deletedCount > 0)
          })
    })

});


app.get('/', (req, res) => {
    res.send('port openned')
})

app.listen(process.env.PORT || 5423)