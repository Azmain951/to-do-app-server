const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://dbuser1:hwsZwRymF6WdA0vc@cluster0.vk4mr.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const taskCollection = client.db('toDoApp').collection('tasks');


        app.get('/task', async (req, res) => {
            const query = {};
            const cursor = taskCollection.find(query);
            const tasks = await cursor.toArray();
            res.send(tasks);
        });

        // get all task by email api
        app.get('/task/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const cursor = taskCollection.find(query);
            const tasks = await cursor.toArray();
            res.send(tasks);
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