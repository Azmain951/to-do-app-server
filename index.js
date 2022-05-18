const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).send('unauthorized access')
    }
    const token = header.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send('forbidden access')
        }
        req.decoded = decoded;
        next();
    })

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vk4mr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const taskCollection = client.db('toDoApp').collection('tasks');

        app.post('/login', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '30d'
            });
            console.log(token)
            res.send({ token });
        });

        app.get('/task', async (req, res) => {
            const query = {};
            const cursor = taskCollection.find(query);
            const tasks = await cursor.toArray();
            res.send(tasks);
        });

        // get all task by email api
        app.get('/task/:email', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.params.email;
            if (email === decodedEmail) {
                const query = { email };
                const cursor = taskCollection.find(query);
                const tasks = await cursor.toArray();
                res.send(tasks);
            }
            else {
                return res.status(403).send('forbidden access')
            }

        });


        // add task api
        app.post('/task', async (req, res) => {
            const newItem = req.body;
            console.log(newItem);
            const result = await taskCollection.insertOne(newItem);
            res.send(result);
        })


        // delete task api
        app.delete('/task/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', async (req, res) => {
    res.send('To Do App Server is Running');
});

app.listen(port, (req, res) => {
    console.log('listening to port: ', port);
});