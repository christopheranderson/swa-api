import { Db, MongoClient, ObjectId, Collection as MongoCollection } from "mongodb";
import { Collection, Database, FindDocumentsOptions } from "./database";
import constants from "./constants";
import { AuthenticatedUser } from "./auth";

export class MongoDb {
    private static initializeTask: Promise<Db>;
    private static skipDatabase = false;
    private static client: MongoClient;

    private static getConnectionString() {
        return process.env[constants.mongoConnectionStringSettingName];
    }

    private static async initializeClient(): Promise<Db> {
        console.log("Initializing database...");

        const connectionString = this.getConnectionString();
        if (!connectionString) {
            throw "MongoDB connection string is missing.";
        }

        this.client = new MongoClient(connectionString, { useUnifiedTopology: true });
        await this.client.connect();
        const databaseName = process.env[constants.mongoDatabaseNameSettingName] ?? constants.mongoDefaultDatabaseName;
        const database = this.client.db(databaseName);

        console.log("Database initialized");

        return database;
    }

    public static async getClient(user?: AuthenticatedUser): Promise<Database | undefined> {
        if (this.skipDatabase) return;

        if (!this.getConnectionString()) {
            this.skipDatabase = true;
            console.warn("No connection string found. Skipping database.");
            return;
        }

        if (!this.initializeTask) {
            this.initializeTask = this.initializeClient();
        }
        return new SimpleMongoDatabase(await this.initializeTask, user);
    }
}

class SimpleMongoDatabase implements Database {
    constructor(public mongoDb: Db, private user?: AuthenticatedUser) {
    }

    collection(name: string): Collection {
        return new SimpleMongoCollection(this.mongoDb.collection(name), this.user);
    }
}

class SimpleMongoCollection implements Collection {
    constructor(private mongoCollection: MongoCollection, private user?: AuthenticatedUser) {
    }

    async insertDocument(doc: { [field: string]: unknown; }): Promise<string> {
        if (doc._id) {
            doc._id = new ObjectId(doc._id as string);
        }
        this.addAuditInfo(doc);
        const result = await this.mongoCollection.insertOne(doc);
        return result.insertedId.toString();
    }

    async replaceDocument(doc: { [field: string]: unknown; }, additionalQuery?: { [field: string]: unknown; }): Promise<void> {
        if (!doc._id) {
            throw new Error("Replacement document must contain _id.");
        }
        const _id = new ObjectId(doc._id as string);
        this.addAuditInfo(doc);
        const updateDoc = Object.assign({}, doc);
        delete updateDoc._id;
        const query = { _id };
        if (additionalQuery) {
            Object.assign(query, additionalQuery);
        }
        const result = await this.mongoCollection.replaceOne(query, updateDoc);
        if (result.modifiedCount !== 1) {
            throw("Expected 1 modified but got " + result.modifiedCount);
        }
    }

    async deleteDocument(_id: string, additionalQuery?: { [field: string]: unknown; }): Promise<void> {
        const query = { _id: new ObjectId(_id) };
        if (additionalQuery) {
            Object.assign(query, additionalQuery);
        }
        await this.mongoCollection.deleteOne(query);
    }

    async getDocument(_id: string, additionalQuery?: { [field: string]: unknown; }): Promise<{ [field: string]: unknown; } | null> {
        const query = { _id: new ObjectId(_id) };
        if (additionalQuery) {
            Object.assign(query, additionalQuery);
        }
        return await this.mongoCollection.findOne(query);
    }

    async findDocuments(query?: { [field: string]: unknown; }, options?: FindDocumentsOptions): Promise<{ [field: string]: unknown; }[]> {
        const mongoQuery = query ?? {};
        const cursor = await this.mongoCollection.find(mongoQuery, options);
        return cursor.toArray();
    }

    private addAuditInfo(doc: { [field: string]: unknown; }) {
        doc._userId = this.user?.userId;
        doc._userDetails = this.user?.userDetails;
        doc._updated = new Date().getTime();
    }
}