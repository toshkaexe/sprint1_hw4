import {BlogDBType, DBType, PostDBType} from "../models/db/db";
import {MongoClient} from "mongodb";

export const db: DBType = {
    blogs: [],
    posts: []
}

const port = 80;

const uri = process.env.MONGO_URI

    || 'mongodb+srv://antonzeltser:admin@cluster0.rmbeaqk.mongodb.net/'
    || 'mongo://localhost:27017'

console.log("url: ", uri);
export const client = new MongoClient(uri);
export const database = client.db('blogs-hws')

export const blogsCollection = database.collection<BlogDBType>('blogs');
export const postsCollection = database.collection<PostDBType>('posts');

export const runDB = async () => {
    try {
        await client.connect()
        console.log('Client connected to Db');
        console.log(`Example app listening on port ${port}`)
    } catch (err) {
        console.log(`${err}`)
        await client.close()
    }
}

