// This file (model.js) contains all the logic for loading the model and running predictions.
const { processDocument, chunkText } = require('./document-processor');

class TextEmbeddingPipeline {
    static task = 'feature-extraction';
    static model = 'Xenova/all-MiniLM-L6-v2';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            let { pipeline, env } = await import('@xenova/transformers');
            env.allowLocalModels = false;
            this.instance = pipeline(this.task, this.model, {
                quantized: true,
                progress_callback
            });
        }
        return this.instance;
    }
}

// Keep existing run function for direct text embedding
async function run(event, text) {
    try {
        const classifier = await TextEmbeddingPipeline.getInstance();
        const result = await classifier(text);
        
        return {
            data: Array.from(result.data),
            dims: result.dims,
            type: result.type
        };
    } catch (error) {
        console.error('Embedding error:', error);
        throw error;
    }
}

// Add new function for processing documents
async function processAndEmbed(file) {
    try {
        const classifier = await TextEmbeddingPipeline.getInstance();
        const chunks = await processDocument(file);
        
        // Embed each chunk
        const embeddings = await Promise.all(
            chunks.map(async (chunk) => {
                const result = await classifier(chunk);
                return {
                    text: chunk,
                    embedding: Array.from(result.data),
                    dims: result.dims
                };
            })
        );

        return embeddings;
    } catch (error) {
        console.error('Document processing error:', error);
        throw error;
    }
}

module.exports = {
    run,
    processAndEmbed,
    TextEmbeddingPipeline
}
