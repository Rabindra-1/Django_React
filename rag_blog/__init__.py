"""
RAG Blog System - A Retrieval Augmented Generation system for blog content creation.

This package combines sentence transformers for document embedding and retrieval
with Mistral AI for generating high-quality blog content.
"""

from .rag_blog_system import RAGBlogSystem
from .document_processor import DocumentProcessor, load_sample_blog_data
from .vector_store import VectorStore, RetrievalSystem
from .mistral_generator import MistralBlogGenerator, MockMistralGenerator

__version__ = "1.0.0"
__author__ = "Your Name"

__all__ = [
    'RAGBlogSystem',
    'DocumentProcessor', 
    'VectorStore',
    'RetrievalSystem',
    'MistralBlogGenerator',
    'MockMistralGenerator',
    'load_sample_blog_data'
]
