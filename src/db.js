const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./config');
const { promisify } = require('util');

class VectorDB {
    static instance = null;
    
    static async getInstance() {
        if (!this.instance) {
            this.instance = new VectorDB(config.database.path);
            await this.instance.init();
        }
        return this.instance;
    }

    constructor(dbPath) {
        try {
            this.db = new sqlite3.Database(dbPath);
            // Promisify database methods
            this.run = promisify(this.db.run.bind(this.db));
            this.all = promisify(this.db.all.bind(this.db));
            this.get = promisify(this.db.get.bind(this.db));
        } catch (error) {
            console.error('Failed to initialize SQLite:', error);
            throw new Error('Database initialization failed');
        }
    }

    async init() {
        try {
            // Enable WAL mode for better concurrent access
            await this.run('PRAGMA journal_mode = WAL');
            
            // Create tables if they don't exist
            await this.run(`
                CREATE TABLE IF NOT EXISTS collections (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await this.run(`
                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY,
                    collection_id TEXT REFERENCES collections(id),
                    filename TEXT NOT NULL,
                    chunk_text TEXT NOT NULL,
                    chunk_index INTEGER NOT NULL,
                    embedding BLOB NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await this.run(`
                CREATE INDEX IF NOT EXISTS idx_collection_id 
                ON documents(collection_id)
            `);
        } catch (error) {
            console.error('Failed to initialize database schema:', error);
            throw error;
        }
    }

    async createCollection(name) {
        const id = Date.now().toString();
        await this.run(
            'INSERT INTO collections (id, name) VALUES (?, ?)',
            [id, name]
        );
        return id;
    }

    async addDocuments(collectionId, documents) {
        const stmt = this.db.prepare(`
            INSERT INTO documents (id, collection_id, filename, chunk_text, chunk_index, embedding)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');
                
                documents.forEach(doc => {
                    const buffer = Buffer.from(new Float32Array(doc.embedding).buffer);
                    stmt.run(
                        `${doc.filename}-${doc.chunkIndex}`,
                        collectionId,
                        doc.filename,
                        doc.text,
                        doc.chunkIndex,
                        buffer
                    );
                });

                this.db.run('COMMIT', err => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    async search(collectionId, queryEmbedding, limit = 5) {
        const query = collectionId 
            ? `
                SELECT 
                    d.chunk_text,
                    d.filename,
                    d.chunk_index,
                    d.embedding
                FROM documents d
                WHERE d.collection_id = ?
            `
            : `
                SELECT 
                    d.chunk_text,
                    d.filename,
                    d.chunk_index,
                    d.embedding
                FROM documents d
            `;

        const params = collectionId ? [collectionId] : [];
        const results = await this.all(query, params);

        // Calculate cosine similarity in JS
        const queryVector = new Float32Array(queryEmbedding);
        const scoredResults = results.map(result => {
            const embedding = new Float32Array(result.embedding.buffer);
            const similarity = this.cosineSimilarity(queryVector, embedding);
            return { ...result, similarity };
        });

        // Sort by similarity and return top results
        return scoredResults
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }

    cosineSimilarity(v1, v2) {
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;
        
        for (let i = 0; i < v1.length; i++) {
            dotProduct += v1[i] * v2[i];
            norm1 += v1[i] * v1[i];
            norm2 += v2[i] * v2[i];
        }
        
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    async getCollections() {
        return this.all(`
            SELECT 
                c.*,
                COUNT(d.id) as file_count,
                GROUP_CONCAT(DISTINCT d.filename) as filenames
            FROM collections c
            LEFT JOIN documents d ON c.id = d.collection_id
            GROUP BY c.id, c.name, c.created_at
            ORDER BY c.created_at DESC
        `);
    }

    async deleteCollection(id) {
        await this.run('BEGIN TRANSACTION');
        try {
            await this.run('DELETE FROM documents WHERE collection_id = ?', [id]);
            await this.run('DELETE FROM collections WHERE id = ?', [id]);
            await this.run('COMMIT');
        } catch (error) {
            await this.run('ROLLBACK');
            throw error;
        }
    }

    async close() {
        return new Promise((resolve, reject) => {
            this.db.close(err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

module.exports = VectorDB; 