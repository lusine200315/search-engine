const express = require('express');
const app = express();
const body_parser = require('body-parser');
app.use(body_parser.json());

require('dotenv').config();

const DEFAULTPORTNUMEBR = 3000;
const PORT = process.env.PORT || DEFAULTPORTNUMEBR;

const { MongoClient } = require('mongodb');
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
client.connect();

function mySplit(str) {
    if(typeof str != "string") {
        return [];
    }
    let arr = str.split(" ");
    return arr;
}
app.get('/search', async (req, res) => {
    const db = client.db("engine");
    const collection = db.collection("pages");

    const term = req.query.q;
    const pages = await collection.find({terms: term}).toArray();
    return res.send(pages);
})
app.post('/crawl', async (req, res) => {
    const {title, content} = req.body;
    if(!(title && content)) {
        return res.status(400).send("invalid credentials");
    }
    const terms = mySplit(content);
    const db = client.db("engine");
    const collection = db.collection("pages");
    const insertedObj = await collection.insertOne({title, terms});
})
app.listen(PORT, () => {
    console.log(`Server is running in ${PORT}`);
});