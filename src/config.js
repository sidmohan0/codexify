const path = require('path');
const { app } = require('electron');

const config = {
    development: {
        database: {
            path: path.join(app.getPath('userData'), 'vectors.db'),
            // Add any other DB config options here
            options: {
                allow_unsigned_extensions: true  // Required for vector extension
            }
        },
        // Add any other config settings here
        embedding: {
            dimensions: 384,  // MiniLM-L6-v2 dimension size
            chunkSize: 512
        }
    },
    production: {
        database: {
            path: path.join(app.getPath('userData'), 'vectors.db'),
            options: {
                allow_unsigned_extensions: true
            }
        },
        embedding: {
            dimensions: 384,
            chunkSize: 512
        }
    }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env]; 