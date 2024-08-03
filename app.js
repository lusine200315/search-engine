const express = require('express');
const app = express();

const body_parser = require('body-parser');
app.use(body_parser.json());

const fs = require('fs');

const multer = require('multer');
app.use(express.static('public'));

const upload = multer({ dest: 'public/upload/' });

const { MongoClient } = require('mongodb');
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
client.connect();

const DEFAULTPORTNUMEBR = 3000;
const PORT = process.env.PORT || DEFAULTPORTNUMEBR;

require('dotenv').config();

function mySplit(str) {
    if(typeof str != "string") {
        return [];
    }
    let arr = str.split(" ");
    return arr;
};

app.get('/search', async (req, res) => {
    const db = client.db("engine");
    const collection = db.collection("pages");

    const term = req.query.q;
    const pages = await collection.find({terms: term}).toArray();
    return res.send(pages);
});

app.post('/crawl', upload.single('content'), async (req, res) => {
    if(!req.body) {
        return res.status(400).send("invalid credentials");
    }
    const fileContents = fs.readFileSync(req.file.path, 'utf-8');

    const terms = mySplit(fileContents);
    
    const db = client.db("engine");
    const collection = db.collection("pages");

    const insertedObj = await collection.insertOne({title: req.file.path, terms});

    res.status(201).json({data: insertedObj});
});


app.listen(PORT, () => {
    console.log(`Server is running in ${PORT}`);
});