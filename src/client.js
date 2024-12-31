// This script handles interaction with the user interface, as well as communication
// between the renderer thread (UI) and the worker thread (processing).

// Start with collection management code
let files = [];
let isEditing = false;
let selectedCollections = new Set();

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileList = document.getElementById('fileList');
const collectionName = document.getElementById('collectionName');
const createButton = document.getElementById('createButton');
const editButton = document.getElementById('editButton');
const collectionsBody = document.getElementById('collectionsBody');
const deleteButton = document.getElementById('deleteButton');
const searchInput = document.getElementById('searchInput');
const collectionSelect = document.getElementById('collectionSelect');
const searchResults = document.getElementById('searchResults');

// Drag and drop handlers
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
    });
});

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('active'));
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('active'));
});

dropZone.addEventListener('drop', e => {
    const droppedFiles = [...e.dataTransfer.files];
    files = [...files, ...droppedFiles];
    updateFileList();
});

function updateFileList() {
    fileList.innerHTML = files.map((file, index) => `
        <div class="file-item" data-index="${index}">
            <span>${file.name}</span>
            <span class="remove-file">×</span>
        </div>
    `).join('');

    // Add event listeners after rendering
    document.querySelectorAll('.file-item').forEach(item => {
        const removeButton = item.querySelector('.remove-file');
        removeButton.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            removeFile(index);
        });
    });
}

function removeFile(index) {
    files.splice(index, 1);
    updateFileList();
}

// Collection management
createButton.addEventListener('click', async () => {
    if (!files.length || !collectionName.value.trim()) {
        alert('Please provide both files and a collection name.');
        return;
    }

    try {
        // Prepare files for IPC transfer
        const serializedFiles = await Promise.all(files.map(async file => ({
            name: file.name,
            type: file.type,
            data: Array.from(new Uint8Array(await file.arrayBuffer())),
            size: file.size
        })));

        await window.electronAPI.createCollection({
            name: collectionName.value.trim(),
            files: serializedFiles
        });
        
        files = [];
        collectionName.value = '';
        updateFileList();
        loadCollections();
    } catch (error) {
        console.error('Failed to create collection:', error);
        alert('Failed to create collection');
    }
});

editButton.addEventListener('click', () => {
    isEditing = !isEditing;
    editButton.textContent = isEditing ? 'Cancel' : 'Edit';
    deleteButton.classList.toggle('hidden');
    document.querySelectorAll('.checkbox-column').forEach(el => {
        el.classList.toggle('hidden');
    });
    if (!isEditing) {
        selectedCollections.clear();
        updateDeleteButton();
    }
});

deleteButton.addEventListener('click', async () => {
    if (selectedCollections.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedCollections.size} collection(s)?`)) {
        try {
            await window.electronAPI.deleteCollections(Array.from(selectedCollections));
            selectedCollections.clear();
            updateDeleteButton();
            loadCollections();
        } catch (error) {
            console.error('Failed to delete collections:', error);
            alert('Failed to delete collections');
        }
    }
});

function updateDeleteButton() {
    deleteButton.textContent = `Delete Selected (${selectedCollections.size})`;
    deleteButton.disabled = selectedCollections.size === 0;
}

// Replace the existing input handler with search functionality
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 300); // Debounce search
});

collectionSelect.addEventListener('change', performSearch);

let searchTimeout;

// Add this helper function for semantic highlighting
function highlightText(text, query, similarity) {
    // Higher similarity = more intense highlighting
    const alpha = Math.min(similarity * 0.8 + 0.2, 1); // Scale from 0.2 to 1.0
    const backgroundColor = `rgba(255, 255, 0, ${alpha.toFixed(2)})`;
    const keywordColor = 'rgba(255, 165, 0, 0.6)'; // Bright orange for direct matches
    
    // For very similar matches, wrap the closest matching phrases
    if (similarity > 0.8) {
        // Split into sentences and highlight the most relevant ones
        const sentences = text.split(/([.!?]+\s)/g);
        return sentences.map(sentence => {
            let highlightedSentence = sentence;
            const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 3);
            
            // First highlight exact matches
            queryWords.forEach(word => {
                const regex = new RegExp(`(${word})`, 'gi');
                highlightedSentence = highlightedSentence.replace(regex, 
                    `<span style="background-color: ${keywordColor}">$1</span>`);
            });
            
            // Then apply semantic highlighting if needed
            const shouldHighlight = queryWords.some(word => 
                sentence.toLowerCase().includes(word));
            
            return shouldHighlight 
                ? `<span style="background-color: ${backgroundColor}">${highlightedSentence}</span>`
                : highlightedSentence;
        }).join('');
    }
    
    // For lower similarity matches, highlight the whole text with lower intensity
    return `<span style="background-color: ${backgroundColor}">${text}</span>`;
}

// Update the performSearch function
async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        searchResults.innerHTML = '';
        return;
    }

    try {
        const results = await window.electronAPI.search(
            query,
            collectionSelect.value
        );

        searchResults.innerHTML = results.map(result => `
            <div class="result-item">
                <div class="filename">${result.filename}</div>
                <div class="text">${highlightText(result.chunk_text, query, result.similarity)}</div>
                <div class="meta">
                    Similarity: ${(result.similarity * 100).toFixed(1)}%
                    | Chunk: ${result.chunk_index + 1}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Search failed:', error);
        searchResults.innerHTML = '<div class="error">Search failed</div>';
    }
}

// Update collection loading to populate the select
async function loadCollections() {
    try {
        const collections = await window.electronAPI.getCollections();
        renderCollections(collections);
        
        // Update collection select
        collectionSelect.innerHTML = `
            <option value="">All Collections</option>
            ${collections.map(c => `
                <option value="${c.id}">${c.name}</option>
            `).join('')}
        `;
    } catch (error) {
        console.error('Failed to load collections:', error);
    }
}

function renderCollections(collections) {
    collectionsBody.innerHTML = collections.map(collection => `
        <tr data-id="${collection.id}">
            <td class="checkbox-column hidden">
                <input type="checkbox" 
                    ${selectedCollections.has(collection.id) ? 'checked' : ''}>
            </td>
            <td>${collection.name}</td>
            <td>${new Date(collection.created_at).toLocaleDateString()}</td>
            <td>${collection.file_count || 0}</td>
        </tr>
    `).join('');

    // Add event listeners after rendering
    document.querySelectorAll('#collectionsBody tr').forEach(row => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                const collectionId = row.dataset.id;
                handleCheckbox(collectionId);
            });
        }
    });
}

// Initial load
loadCollections();

// Add this function to handle checkbox changes
async function handleCheckbox(collectionId) {
    if (selectedCollections.has(collectionId)) {
        selectedCollections.delete(collectionId);
    } else {
        selectedCollections.add(collectionId);
    }
    updateDeleteButton();
}
