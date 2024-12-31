<!-- LOGO -->
<h1>
<p align="center">
  <img src="assets/logo.png" alt="Logo" width="128">
  <br>Codexify
</h1>
  <p align="center">
    Fast, native semantic search for your local documents.
    <br />
    <a href="#about">About</a>
    ·
    <a href="#features">Features</a>
    ·
    <a href="#installation">Installation</a>
    ·
    <a href="#development">Development</a>
  </p>
</p>

## About

Codexify is a desktop application that brings powerful semantic search to your local documents. While there are many document search tools available, Codexify differentiates itself by being:

- **Fast**: Native performance with optimized vector operations
- **Private**: All processing happens locally on your machine
- **Smart**: Uses modern AI embeddings for semantic understanding
- **Simple**: Clean, intuitive interface for managing document collections

## Features

- 📚 **Document Support**
  - PDF files
  - Word documents (.docx)
  - Text files
  - HTML files
  - EPUB books

- 🔍 **Smart Search**
  - Semantic understanding of queries
  - Results ranked by relevance
  - Cross-collection search
  - Highlighted matches

- 📁 **Collection Management**
  - Create document collections
  - Drag-and-drop file import
  - Batch operations
  - Collection filtering

- 🎨 **Modern UI**
  - Clean, minimal interface
  - Dark/light mode support
  - Responsive design
  - Native platform feel

## Installation

```bash
# Clone the repository
git clone https://github.com/sidmohan0/codexify.git

# Enter the project directory
cd codexify/electron

# Install dependencies
npm install

# Start the application
npm start
```

## Development

Codexify is built with:
- Electron for cross-platform desktop support
- Transformers.js for AI embeddings
- SQLite for document storage
- React + shadcn/ui for the interface

### Project Structure
```
codexify/electron/
├── src/
│   ├── components/     # UI components
│   ├── lib/           # Utility functions
│   ├── model.js       # AI model handling
│   ├── db.js         # Database operations
│   └── index.js      # Main electron process
├── assets/           # Images and static files
└── package.json
```

See [DEV_NOTES.md](DEV_NOTES.md) for detailed development information and roadmap.

## Technical Architecture

```ascii
┌──────────────────────────────────────┐
│            Electron App              │
├──────────────────────────────────────┤
│ ┌────────────┐       ┌────────────┐  │
│ │   React    │  IPC  │   Main     │  │
│ │  Frontend  │<─────>│  Process   │  │
│ │            │       │            │  │
│ └────────────┘       └─────┬──────┘  │
│        ▲                   │         │
│        │                   ▼         │
│ ┌──────┴──────┐    ┌──────────────┐ │
│ │  shadcn/ui  │    │ Transformers  │ │
│ └─────────────┘    │    Pipeline   │ │
│                    └───────┬──────┘ │
│                            │        │
│                    ┌───────▼──────┐ │
│                    │   SQLite DB  │ │
│                    │  (Vector DB) │ │
│                    └─────────────┘ │
└──────────────────────────────────────┘
```

### AI Models & Processing Pipeline

1. **Document Processing**
   - Text Extraction: Native parsers for PDF (pdf-parse), DOCX (mammoth), HTML, EPUB
   - Chunking: Custom text segmentation with overlap for context preservation

2. **Embedding Generation**
   - Model: `Xenova/all-MiniLM-L6-v2` (384-dimensional embeddings)
   - Framework: Transformers.js for local inference
   - Optimization: Quantized model for faster processing

3. **Vector Search**
   - Storage: SQLite with BLOB storage for embeddings
   - Similarity: Cosine similarity with L2 normalization
   - Ranking: Score-based with semantic highlighting

### Data Flow

1. **Document Ingestion**
   ```
   Document → Text Extraction → Chunking → Embedding → SQLite Storage
   ```

2. **Search Process**
   ```
   Query → Embedding → Vector Similarity → Result Ranking → UI Display
   ```

### Performance Characteristics

- Embedding Generation: ~100ms per text chunk
- Vector Search: Sub-second for collections < 10k documents
- Memory Usage: ~200MB baseline, scales with collection size
- Storage: ~1.5KB per text chunk (384-dim float32 vector)

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) for details on the code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
