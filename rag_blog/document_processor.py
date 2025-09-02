"""
Document processing and embedding module for RAG blog system.
Uses Sentence Transformers for creating document embeddings.
"""

import os
import pickle
from typing import List, Dict, Any, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
from tqdm import tqdm
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DocumentProcessor:
    """Handles document processing and embedding generation."""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize the document processor.
        
        Args:
            model_name: Name of the sentence transformer model to use
        """
        self.model_name = model_name
        self.model = None
        self.documents = []
        self.embeddings = None
        
    def load_model(self):
        """Load the sentence transformer model."""
        logger.info(f"Loading sentence transformer model: {self.model_name}")
        self.model = SentenceTransformer(self.model_name)
        
    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """
        Split text into overlapping chunks.
        
        Args:
            text: Input text to chunk
            chunk_size: Size of each chunk in characters
            overlap: Number of characters to overlap between chunks
            
        Returns:
            List of text chunks
        """
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            
            # Try to break at sentence boundary
            if end < len(text):
                last_period = chunk.rfind('.')
                last_newline = chunk.rfind('\n')
                break_point = max(last_period, last_newline)
                
                if break_point > start + chunk_size // 2:
                    chunk = text[start:start + break_point + 1]
                    end = start + break_point + 1
            
            chunks.append(chunk.strip())
            start = max(start + 1, end - overlap)
            
        return [chunk for chunk in chunks if chunk]
    
    def process_documents(self, documents: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        """
        Process a list of documents and create chunks.
        
        Args:
            documents: List of documents with 'title', 'content', and optionally 'metadata'
            
        Returns:
            List of processed document chunks
        """
        processed_docs = []
        
        for doc in tqdm(documents, desc="Processing documents"):
            title = doc.get('title', '')
            content = doc.get('content', '')
            metadata = doc.get('metadata', {})
            
            # Create chunks from content
            chunks = self.chunk_text(content)
            
            for i, chunk in enumerate(chunks):
                processed_doc = {
                    'id': f"{doc.get('id', len(processed_docs))}_{i}",
                    'title': title,
                    'chunk': chunk,
                    'chunk_index': i,
                    'total_chunks': len(chunks),
                    'metadata': metadata
                }
                processed_docs.append(processed_doc)
        
        self.documents = processed_docs
        return processed_docs
    
    def create_embeddings(self, texts: Optional[List[str]] = None) -> np.ndarray:
        """
        Create embeddings for the provided texts or stored documents.
        
        Args:
            texts: Optional list of texts to embed. If None, uses stored documents.
            
        Returns:
            Numpy array of embeddings
        """
        if self.model is None:
            self.load_model()
            
        if texts is None:
            if not self.documents:
                raise ValueError("No documents to embed. Process documents first.")
            texts = [doc['chunk'] for doc in self.documents]
        
        logger.info(f"Creating embeddings for {len(texts)} texts")
        embeddings = self.model.encode(texts, show_progress_bar=True)
        
        if texts is None:  # If we're embedding stored documents
            self.embeddings = embeddings
            
        return embeddings
    
    def save_embeddings(self, file_path: str):
        """Save documents and embeddings to file."""
        data = {
            'documents': self.documents,
            'embeddings': self.embeddings,
            'model_name': self.model_name
        }
        
        with open(file_path, 'wb') as f:
            pickle.dump(data, f)
        
        logger.info(f"Saved embeddings to {file_path}")
    
    def load_embeddings(self, file_path: str):
        """Load documents and embeddings from file."""
        with open(file_path, 'rb') as f:
            data = pickle.load(f)
        
        self.documents = data['documents']
        self.embeddings = data['embeddings']
        self.model_name = data['model_name']
        
        logger.info(f"Loaded embeddings from {file_path}")
        
        # Load the model if it's different from current
        if self.model is None or self.model_name != data['model_name']:
            self.load_model()


def load_sample_blog_data() -> List[Dict[str, str]]:
    """
    Load sample blog data for demonstration.
    In a real scenario, this would load from your actual blog database or files.
    """
    sample_documents = [
        {
            "id": "1",
            "title": "Introduction to Machine Learning",
            "content": """
            Machine learning is a subset of artificial intelligence that focuses on algorithms 
            that can learn and make decisions from data. There are three main types of machine 
            learning: supervised learning, unsupervised learning, and reinforcement learning.
            
            Supervised learning uses labeled data to train models. Common examples include 
            classification and regression tasks. Popular algorithms include linear regression, 
            decision trees, and neural networks.
            
            Unsupervised learning finds patterns in data without labels. Clustering and 
            dimensionality reduction are common applications. K-means clustering and 
            principal component analysis (PCA) are popular techniques.
            
            Reinforcement learning involves agents learning through interaction with an 
            environment, receiving rewards or penalties for their actions.
            """,
            "metadata": {"category": "AI/ML", "author": "Tech Blogger", "date": "2024-01-15"}
        },
        {
            "id": "2", 
            "title": "Web Development Best Practices",
            "content": """
            Modern web development requires following established best practices to create 
            maintainable, scalable, and secure applications. Here are key principles to follow.
            
            Code organization is crucial. Use modular architecture, separate concerns, and 
            follow established design patterns. Version control with Git is essential for 
            collaboration and tracking changes.
            
            Security should be built in from the start. Always validate user input, use HTTPS, 
            implement proper authentication and authorization, and keep dependencies updated.
            
            Performance optimization involves minimizing HTTP requests, optimizing images, 
            using CDNs, and implementing caching strategies. Monitor your application's 
            performance regularly.
            
            Testing is vital for reliability. Implement unit tests, integration tests, and 
            end-to-end tests. Use continuous integration and deployment pipelines.
            """,
            "metadata": {"category": "Web Development", "author": "Dev Expert", "date": "2024-02-10"}
        },
        {
            "id": "3",
            "title": "Python Programming Tips",
            "content": """
            Python is a versatile programming language known for its readability and simplicity. 
            Here are essential tips for Python developers.
            
            Follow PEP 8 style guidelines for consistent code formatting. Use meaningful 
            variable names and write clear, concise comments. Leverage Python's built-in 
            functions and libraries whenever possible.
            
            Virtual environments are crucial for managing dependencies. Use venv or conda 
            to create isolated environments for your projects. This prevents dependency 
            conflicts and ensures reproducibility.
            
            Exception handling should be specific and informative. Use try-except blocks 
            appropriately and provide meaningful error messages. Avoid catching broad 
            exceptions unless necessary.
            
            List comprehensions and generator expressions can make your code more Pythonic 
            and efficient. However, prioritize readability over cleverness.
            """,
            "metadata": {"category": "Programming", "author": "Python Pro", "date": "2024-03-05"}
        },
        {
            "id": "4",
            "title": "Database Design Fundamentals",
            "content": """
            Good database design is fundamental to building scalable applications. Understanding 
            normalization, relationships, and indexing is crucial for optimal performance.
            
            Normalization reduces data redundancy and improves data integrity. The first normal 
            form eliminates repeating groups, second normal form removes partial dependencies, 
            and third normal form eliminates transitive dependencies.
            
            Relationships between tables can be one-to-one, one-to-many, or many-to-many. 
            Foreign keys maintain referential integrity and enforce business rules at the 
            database level.
            
            Indexing dramatically improves query performance but comes with storage overhead 
            and slower write operations. Create indexes on frequently queried columns and 
            foreign keys.
            
            Query optimization involves analyzing execution plans, avoiding N+1 queries, 
            and using appropriate JOIN strategies. Consider denormalization for read-heavy 
            applications.
            """,
            "metadata": {"category": "Database", "author": "DB Architect", "date": "2024-03-20"}
        }
    ]
    
    return sample_documents
