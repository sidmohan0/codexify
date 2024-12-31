# Collections Component Overview

| Component              | Purpose                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| CollectionViewPage     | Main container component that provides tab-based navigation between different collection views (Overview, Documents, Q&A, etc.) |
| CollectionDocuments    | Displays and manages a list of documents in a collection, rendering each document in a CollectionDocument component             |
| CollectionDocument     | Handles display and operations (scan, summarize, search) for an individual document using OperationSelectionCard                |
| CollectionQA           | Provides Q&A functionality for the collection, allowing users to ask questions and save Q&A interactions                        |
| CollectionNotes        | Manages creation, display, and deletion of notes associated with the collection                                                 |
| CollectionSavedSummary | Displays and manages saved document summaries for the collection                                                                |
| CollectionSavedSearch  | Shows and manages saved semantic searches performed on the collection                                                           |
| CollectionOverview     | Displays collection statistics and metrics in a dashboard-style layout                                                          |

## Supporting Components

| Component                  | Purpose                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| EntitySelectionAccordion   | Configurable accordion for selecting entity types to detect in documents                    |
| SearchOptionsAccordion     | Accordion component for configuring semantic search parameters                              |
| SummarizeTemplateAccordion | Accordion for selecting different summary templates/styles                                  |
| OperationSelectionCard     | Core component that provides PII scanning, summarization, and semantic search functionality |
