"""
Vector database and retrieval system using FAISS for efficient similarity search.
"""

import os
import pickle
from typing import List, Dict, Any, Tuple, Optional
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)


class VectorStore:
    """FAISS-based vector store for document retrieval."""
    
    def __init__(self, embedding_dim: int = 384):
        """
        Initialize the vector store.
        
        Args:
            embedding_dim: Dimension of the embeddings (384 for all-MiniLM-L6-v2)
        """
        self.embedding_dim = embedding_dim
        self.index = None
        self.documents = []
        self.embeddings = None
        self.is_trained = False
        
    def create_index(self, embeddings: np.ndarray, documents: List[Dict[str, Any]]):
        """
        Create FAISS index from embeddings and documents.
        
        Args:
            embeddings: Numpy array of document embeddings
            documents: List of document metadata
        """
        logger.info(f"Creating FAISS index for {len(embeddings)} documents")
        
        # Create a flat L2 index for simplicity
        self.index = faiss.IndexFlatL2(self.embedding_dim)
        
        # Add embeddings to the index
        embeddings = embeddings.astype('float32')
        self.index.add(embeddings)
        
        self.documents = documents
        self.embeddings = embeddings
        self.is_trained = True
        
        logger.info(f"FAISS index created with {self.index.ntotal} vectors")
    
    def search(self, query_embedding: np.ndarray, k: int = 5) -> List[Dict[str, Any]]:
        """
        Search for similar documents using query embedding.
        
        Args:
            query_embedding: Query embedding vector
            k: Number of top results to return
            
        Returns:
            List of retrieved documents with similarity scores
        """
        if not self.is_trained:
            raise ValueError("Index not trained. Create index first.")
        
        # Ensure query embedding is the right shape and type
        if query_embedding.ndim == 1:
            query_embedding = query_embedding.reshape(1, -1)
        query_embedding = query_embedding.astype('float32')
        
        # Search the index
        distances, indices = self.index.search(query_embedding, k)
        
        results = []
        for i, (distance, idx) in enumerate(zip(distances[0], indices[0])):
            if idx != -1:  # Valid result
                doc = self.documents[idx].copy()
                doc['similarity_score'] = float(1 / (1 + distance))  # Convert distance to similarity
                doc['rank'] = i + 1
                results.append(doc)
        
        return results
    
    def save_index(self, file_path: str):
        """Save the FAISS index and metadata to files."""
        if not self.is_trained:
            raise ValueError("No index to save. Create index first.")
        
        # Save FAISS index
        index_path = f"{file_path}.index"
        faiss.write_index(self.index, index_path)
        
        # Save metadata
        metadata = {
            'documents': self.documents,
            'embeddings': self.embeddings,
            'embedding_dim': self.embedding_dim,
            'is_trained': self.is_trained
        }
        
        with open(f"{file_path}.metadata", 'wb') as f:
            pickle.dump(metadata, f)
        
        logger.info(f"Saved FAISS index to {index_path} and metadata to {file_path}.metadata")
    
    def load_index(self, file_path: str):
        """Load the FAISS index and metadata from files."""
        index_path = f"{file_path}.index"
        metadata_path = f"{file_path}.metadata"
        
        if not os.path.exists(index_path) or not os.path.exists(metadata_path):
            raise FileNotFoundError(f"Index files not found: {index_path} or {metadata_path}")
        
        # Load FAISS index
        self.index = faiss.read_index(index_path)
        
        # Load metadata
        with open(metadata_path, 'rb') as f:
            metadata = pickle.load(f)
        
        self.documents = metadata['documents']
        self.embeddings = metadata['embeddings']
        self.embedding_dim = metadata['embedding_dim']
        self.is_trained = metadata['is_trained']
        
        logger.info(f"Loaded FAISS index from {index_path}")


class RetrievalSystem:
    """High-level retrieval system combining document processing and vector search."""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize the retrieval system.
        
        Args:
            model_name: Name of the sentence transformer model to use
        """
        self.model_name = model_name
        self.sentence_model = None
        self.vector_store = VectorStore()
        
    def load_model(self):
        """Load the sentence transformer model."""
        if self.sentence_model is None:
            logger.info(f"Loading sentence transformer model: {self.model_name}")
            self.sentence_model = SentenceTransformer(self.model_name)
    
    def build_index(self, documents: List[Dict[str, str]]):
        """
        Build the vector index from documents.
        
        Args:
            documents: List of documents to index
        """
        from .document_processor import DocumentProcessor
        
        # Process documents
        processor = DocumentProcessor(self.model_name)
        processed_docs = processor.process_documents(documents)
        
        # Create embeddings
        embeddings = processor.create_embeddings()
        
        # Create vector index
        self.vector_store.create_index(embeddings, processed_docs)
        
        logger.info(f"Built index with {len(processed_docs)} document chunks")
    
    def retrieve(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieve relevant documents for a query.
        
        Args:
            query: Search query
            k: Number of documents to retrieve
            
        Returns:
            List of relevant documents with metadata
        """
        if self.sentence_model is None:
            self.load_model()
        
        # Create query embedding
        query_embedding = self.sentence_model.encode([query])
        
        # Search for similar documents
        results = self.vector_store.search(query_embedding, k)
        
        return results
    
    def save_index(self, file_path: str):
        """Save the index to file."""
        self.vector_store.save_index(file_path)
    
    def load_index(self, file_path: str):
        """Load the index from file."""
        self.vector_store.load_index(file_path)
        self.load_model()  # Ensure model is loaded for queries
    
    def get_context_for_generation(self, query: str, k: int = 3) -> str:
        """
        Get formatted context string for content generation.
        
        Args:
            query: Search query
            k: Number of documents to retrieve for context
            
        Returns:
            Formatted context string
        """
        results = self.retrieve(query, k)
        
        context_parts = []
        for result in results:
            context_part = f"Title: {result['title']}\n"
            context_part += f"Content: {result['chunk']}\n"
            context_part += f"Category: {result['metadata'].get('category', 'Unknown')}\n"
            context_part += "---"
            context_parts.append(context_part)
        
        return "\n\n".join(context_parts)
