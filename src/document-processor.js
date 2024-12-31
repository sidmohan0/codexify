const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { parse } = require('node-html-parser');
const EPub = require('epub2');

class TextSplitter {
    constructor(options = {}) {
        this.maxLength = options.maxLength || 512;
        this.minLength = options.minLength || 200;
        this.overlap = options.overlap || 20;
    }

    cleanText(text) {
        return text
            .replace(/\r\n/g, '\n')
            .replace(/[^\S\n]+/g, ' ')
            .replace(/\n\s*\n+/g, '\n\n')
            .trim();
    }

    split(text) {
        if (!text) return [];
        
        text = this.cleanText(text);
        const paragraphs = text.split(/\n\n+/);
        const chunks = [];
        
        let currentChunk = '';
        let currentChunkLen = 0;

        for (const paragraph of paragraphs) {
            const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];

            for (const sentence of sentences) {
                const cleanSentence = sentence.trim();
                const cleanLen = cleanSentence.length;

                if (
                    currentChunkLen + (currentChunkLen > 0 ? 1 : 0) + cleanLen > this.maxLength &&
                    currentChunkLen >= this.minLength
                ) {
                    chunks.push(currentChunk.trim());
                    const words = currentChunk.split(' ');
                    currentChunk = words.slice(-this.overlap).join(' ');
                    currentChunkLen = currentChunk.length;
                }

                if (currentChunkLen > 0) {
                    currentChunk += ' ';
                    currentChunkLen += 1;
                }
                currentChunk += cleanSentence;
                currentChunkLen += cleanLen;
            }

            if (currentChunkLen >= this.minLength) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
                currentChunkLen = 0;
            }
        }

        if (currentChunkLen > 0) {
            if (currentChunkLen < this.minLength && chunks.length > 0) {
                const lastChunk = chunks.pop();
                if (lastChunk.length + currentChunkLen <= this.maxLength) {
                    const merged = `${lastChunk} ${currentChunk}`.trim();
                    chunks.push(merged);
                } else {
                    chunks.push(lastChunk);
                    chunks.push(currentChunk.trim());
                }
            } else {
                chunks.push(currentChunk.trim());
            }
        }

        return chunks.filter(Boolean);
    }
}

// Configure text splitter with default settings
const splitter = new TextSplitter({
    maxLength: 512,
    minLength: 200,
    overlap: 20
});

async function extractText(file, mimeType) {
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!buffer || buffer.length === 0) {
        return '';
    }

    let text = '';
    switch (mimeType) {
        case 'application/pdf':
            const pdfData = await pdfParse(buffer);
            text = pdfData.text;
            break;

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            const docxResult = await mammoth.extractRawText({ buffer });
            text = docxResult.value;
            break;

        case 'text/html':
            const root = parse(buffer.toString());
            text = root.textContent;
            break;

        case 'application/epub+zip':
            const epub = await EPub.createAsync(buffer);
            const chapters = await Promise.all(
                epub.flow.map(chapter => epub.getChapterAsync(chapter))
            );
            text = chapters.map(chapter => {
                const root = parse(chapter);
                return root.textContent;
            }).join('\n\n');
            break;

        case 'text/plain':
            text = buffer.toString();
            break;

        default:
            throw new Error(`Unsupported file type: ${mimeType}`);
    }

    return text.trim();
}

async function chunkText(text) {
    return splitter.split(text);
}

async function processDocument(file) {
    try {
        const text = await extractText(file, file.type);
        if (!text) {
            return [];
        }
        const chunks = await chunkText(text);
        return chunks;
    } catch (error) {
        console.error(`Error processing document ${file.name}:`, error);
        throw error;
    }
}

module.exports = {
    processDocument,
    chunkText,
    TextSplitter
}; 