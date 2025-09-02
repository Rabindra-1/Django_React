"""
Main RAG (Retrieval Augmented Generation) pipeline for blog content generation.
Combines document retrieval with Mistral AI for creating engaging blog posts.
"""

import os
from typing import List, Dict, Any, Optional
import logging
from .vector_store import RetrievalSystem
from .mistral_generator import MistralBlogGenerator, MockMistralGenerator
from .document_processor import load_sample_blog_data

logger = logging.getLogger(__name__)


class RAGBlogSystem:
    """Complete RAG system for blog content generation."""
    
    def __init__(self, 
                 mistral_api_key: Optional[str] = None,
                 sentence_model: str = "all-MiniLM-L6-v2",
                 mistral_model: str = "mistral-tiny",
                 use_mock: bool = False):
        """
        Initialize the RAG blog system.
        
        Args:
            mistral_api_key: Mistral API key
            sentence_model: Sentence transformer model name
            mistral_model: Mistral model name
            use_mock: Whether to use mock generator (for testing)
        """
        self.retrieval_system = RetrievalSystem(sentence_model)
        
        # Initialize generator (real or mock)
        if use_mock or not mistral_api_key:
            self.generator = MockMistralGenerator()
            self.using_mock = True
        else:
            self.generator = MistralBlogGenerator(mistral_api_key, mistral_model)
            self.using_mock = False
        
        self.is_ready = False
    
    def setup_knowledge_base(self, 
                            documents: Optional[List[Dict[str, str]]] = None,
                            index_path: Optional[str] = None):
        """
        Set up the knowledge base for retrieval.
        
        Args:
            documents: List of documents to index (if creating new index)
            index_path: Path to existing index (if loading existing index)
        """
        if index_path and os.path.exists(f"{index_path}.index"):
            # Load existing index
            logger.info(f"Loading existing index from {index_path}")
            self.retrieval_system.load_index(index_path)
        else:
            # Create new index
            if documents is None:
                logger.info("No documents provided, using sample blog data")
                documents = load_sample_blog_data()
            
            logger.info(f"Building new index from {len(documents)} documents")
            self.retrieval_system.build_index(documents)
            
            # Save the index if path provided
            if index_path:
                self.retrieval_system.save_index(index_path)
        
        self.is_ready = True
        logger.info("Knowledge base setup complete")
    
    def write_blog_post(self, 
                       topic: str,
                       style: str = "informative",
                       length: str = "medium", 
                       target_audience: str = "general",
                       num_context_docs: int = 3) -> Dict[str, Any]:
        """
        Generate a complete blog post on the given topic.
        
        Args:
            topic: Blog post topic
            style: Writing style
            length: Desired length
            target_audience: Target audience
            num_context_docs: Number of context documents to retrieve
            
        Returns:
            Dictionary containing the blog post and metadata
        """
        if not self.is_ready:
            raise ValueError("Knowledge base not set up. Call setup_knowledge_base() first.")
        
        logger.info(f"Generating blog post: {topic}")
        
        # Retrieve relevant context
        context = self.retrieval_system.get_context_for_generation(topic, num_context_docs)
        retrieved_docs = self.retrieval_system.retrieve(topic, num_context_docs)
        
        # Generate blog post
        blog_content = self.generator.generate_blog_post(
            topic=topic,
            context=context,
            style=style,
            length=length,
            target_audience=target_audience
        )
        
        return {
            'topic': topic,
            'content': blog_content,
            'style': style,
            'length': length,
            'target_audience': target_audience,
            'retrieved_docs': retrieved_docs,
            'using_mock': self.using_mock,
            'context_summary': f"Used {len(retrieved_docs)} context documents"
        }
    
    def create_blog_outline(self, topic: str, num_context_docs: int = 3) -> Dict[str, Any]:
        """
        Create a blog post outline for the given topic.
        
        Args:
            topic: Blog post topic
            num_context_docs: Number of context documents to retrieve
            
        Returns:
            Dictionary containing outline and metadata
        """
        if not self.is_ready:
            raise ValueError("Knowledge base not set up. Call setup_knowledge_base() first.")
        
        logger.info(f"Creating outline for: {topic}")
        
        # Retrieve relevant context
        context = self.retrieval_system.get_context_for_generation(topic, num_context_docs)
        retrieved_docs = self.retrieval_system.retrieve(topic, num_context_docs)
        
        # Generate outline
        outline = self.generator.generate_blog_outline(topic, context)
        
        return {
            'topic': topic,
            'outline': outline,
            'retrieved_docs': retrieved_docs,
            'using_mock': self.using_mock
        }
    
    def enhance_existing_content(self, 
                                section_title: str, 
                                existing_content: str, 
                                search_query: Optional[str] = None) -> str:
        """
        Enhance existing blog content with additional context.
        
        Args:
            section_title: Title of the section to enhance
            existing_content: Current content
            search_query: Query for retrieving relevant context (defaults to section_title)
            
        Returns:
            Enhanced content
        """
        if not self.is_ready:
            raise ValueError("Knowledge base not set up. Call setup_knowledge_base() first.")
        
        query = search_query or section_title
        context = self.retrieval_system.get_context_for_generation(query, 2)
        
        return self.generator.enhance_blog_section(section_title, existing_content, context)
    
    def search_knowledge_base(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """
        Search the knowledge base for relevant information.
        
        Args:
            query: Search query
            k: Number of results to return
            
        Returns:
            List of relevant documents
        """
        if not self.is_ready:
            raise ValueError("Knowledge base not set up. Call setup_knowledge_base() first.")
        
        return self.retrieval_system.retrieve(query, k)
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get current system status and configuration."""
        return {
            'is_ready': self.is_ready,
            'using_mock_generator': self.using_mock,
            'sentence_model': self.retrieval_system.model_name,
            'num_documents': len(self.retrieval_system.vector_store.documents) if self.is_ready else 0,
            'index_trained': self.retrieval_system.vector_store.is_trained if self.is_ready else False
        }
