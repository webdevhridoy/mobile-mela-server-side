const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();
const { query } = require('express');

//middleware
const corsConfig = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xetzjun.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {
        const userCollection = client.db('mobile-mela').collection('users');
        const productsCollection = client.db('mobile-mela').collection('products');
        const categoriesCollection = client.db('mobile-mela').collection('categories');

        // users crud operation
        app.get('/users', async (req, res) => {
            const query = {};
            const cursor = await userCollection.find(query).toArray();
            res.send(cursor);
        });
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        // products crud operation
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = await productsCollection.find(query).toArray();
            res.send(cursor);
        });
        app.get('/home-products', async (req, res) => {
            const query = {};
            const cursor = productsCollection.find(query).sort({ current: -1 });
            const result = await cursor.limit(4).toArray();
            res.send(result);

        });
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.send(product);
        });
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const product = req.body;
            const option = { upsert: true };
            const updatedDoc = {
                $set: {
                    productname: product.productname,
                    description: product.description,
                    originalprice: product.originalprice,
                    saleprice: product.saleprice,
                    img: product.img
                }
            };
            const result = await productsCollection.updateOne(filter, updatedDoc, option);
            res.send(result);
        });
        app.get('/products/:categoryId', async (req, res) => {
            const categoryId = req.params.categoryId;
            const query = { categoryId };
            const product = await productsCollection.find(query).toArray();
            res.send(product);
        });
        app.post('/products', async (req, res) => {
            const categories = req.body;
            const result = await productsCollection.insertOne(categories);
            res.send(result);
        });

        // category crud operation
        app.get('/categories', async (req, res) => {
            const query = {};
            const cursor = await categoriesCollection.find(query).toArray();
            res.send(cursor);
        });
        app.get('/categories/:category', async (req, res) => {
            const category = req.params.category;
            const query = { category };
            const allCategory = await productsCollection.find(query).toArray();
            res.send(allCategory);
        });
        app.post('/categories', async (req, res) => {
            const categories = req.body;
            const result = await categoriesCollection.insertOne(categories);
            res.send(result);
        });
    }
    finally {

    }
}
run().catch(error => console.error(error));


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});