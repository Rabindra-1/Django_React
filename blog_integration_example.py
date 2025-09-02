#!/usr/bin/env python3
"""
Advanced example showing how to integrate the RAG system with your existing blog.

This script demonstrates:
1. Loading existing blog posts from files/database
2. Creating a custom knowledge base
3. Generating new blog posts based on your existing content
4. Saving generated content
"""

import os
import json
from datetime import datetime
from typing import List, Dict, Any
from dotenv import load_dotenv
from rag_blog import RAGBlogSystem

load_dotenv()

class BlogIntegration:
    """Integration class for RAG system with existing blog."""
    
    def __init__(self, blog_data_dir: str = "blog_data"):
        """
        Initialize blog integration.
        
        Args:
            blog_data_dir: Directory to store blog data and generated content
        """
        self.blog_data_dir = blog_data_dir
        self.ensure_directories()
        
        # Initialize RAG system
        self.rag_system = RAGBlogSystem(
            mistral_api_key=os.getenv('MISTRAL_API_KEY'),
            use_mock=not bool(os.getenv('MISTRAL_API_KEY'))
        )
    
    def ensure_directories(self):
        """Create necessary directories."""
        directories = [
            self.blog_data_dir,
            os.path.join(self.blog_data_dir, "generated_posts"),
            os.path.join(self.blog_data_dir, "indexes")
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
    
    def load_existing_blog_posts(self, source_dir: str = None) -> List[Dict[str, str]]:
        """
        Load existing blog posts from files or database.
        This is a placeholder - adapt to your actual blog structure.
        """
        # For demo purposes, we'll use sample data
        # In real usage, you would load from your Django models or markdown files
        
        sample_posts = [
            {
                "id": "react_hooks",
                "title": "React Hooks Deep Dive",
                "content": """
                React Hooks revolutionized how we write React components by allowing us to use state 
                and lifecycle features in functional components. useState and useEffect are the most 
                commonly used hooks.
                
                useState allows you to add state to functional components. It returns an array with 
                the current state value and a function to update it. The state update function can 
                accept either a new value or a function that receives the previous state.
                
                useEffect lets you perform side effects in functional components. It serves the same 
                purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined. 
                You can control when effects run by providing a dependency array.
                
                Custom hooks allow you to extract component logic into reusable functions. They're 
                just JavaScript functions that call other hooks and can return any value.
                """,
                "metadata": {"category": "React", "author": "Frontend Dev", "date": "2024-04-01"}
            },
            {
                "id": "django_optimization",
                "title": "Django Performance Optimization",
                "content": """
                Django applications can suffer from performance issues as they scale. Common 
                optimization techniques include database query optimization, caching, and 
                proper use of Django's ORM.
                
                Database optimization starts with understanding your queries. Use Django's 
                select_related() and prefetch_related() to reduce database hits. The Django 
                Debug Toolbar is invaluable for identifying N+1 query problems.
                
                Caching can dramatically improve performance. Django supports multiple cache 
                backends including Redis and Memcached. Use template caching, view caching, 
                and low-level caching strategically.
                
                Static files should be served efficiently in production. Use a CDN for static 
                assets and configure proper cache headers. Consider using a reverse proxy 
                like Nginx.
                """,
                "metadata": {"category": "Django", "author": "Backend Expert", "date": "2024-04-10"}
            }
        ]
        
        return sample_posts
    
    def setup_custom_knowledge_base(self):
        """Setup knowledge base with your existing blog content."""
        print("Loading existing blog posts...")
        existing_posts = self.load_existing_blog_posts()
        
        # Combine with sample data for richer context
        from rag_blog import load_sample_blog_data
        all_documents = existing_posts + load_sample_blog_data()
        
        print(f"Setting up knowledge base with {len(all_documents)} documents...")
        
        index_path = os.path.join(self.blog_data_dir, "indexes", "blog_index")
        self.rag_system.setup_knowledge_base(
            documents=all_documents,
            index_path=index_path
        )
        
        print("Custom knowledge base ready!")
    
    def generate_content_ideas(self, seed_topics: List[str]) -> List[Dict[str, Any]]:
        """Generate content ideas based on existing knowledge."""
        ideas = []
        
        for topic in seed_topics:
            print(f"Generating ideas for: {topic}")
            
            # Search for related content
            related_docs = self.rag_system.search_knowledge_base(topic, k=3)
            
            # Generate outline
            outline_result = self.rag_system.create_blog_outline(topic)
            
            idea = {
                'topic': topic,
                'outline': outline_result['outline'],
                'related_content': [doc['title'] for doc in related_docs],
                'relevance_scores': [doc['similarity_score'] for doc in related_docs]
            }
            
n            ideas.append(idea)
        
        return ideas
    
    def write_and_save_blog_post(self, 
                                topic: str, 
                                style: str = "informative",
                                save_to_file: bool = True) -> Dict[str, Any]:
        """Generate and optionally save a blog post."""
        print(f"Writing blog post: {topic}")
        
        # Generate the blog post
        result = self.rag_system.write_blog_post(
            topic=topic,
            style=style,
            target_audience="tech enthusiasts"
        )
        
        if save_to_file:
            # Save to file
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{topic.lower().replace(' ', '_')}_{timestamp}.md"
            filepath = os.path.join(self.blog_data_dir, "generated_posts", filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(f"# {topic}\n\n")
                f.write(f"*Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n")
                f.write(f"*Style: {style}, Mock: {result['using_mock']}*\n\n")
                f.write(result['content'])
            
            print(f"Blog post saved to: {filepath}")
        
        return result

def main():
    """Main example function."""
    print("=== Advanced Blog Integration Example ===\n")
    
    # Initialize blog integration
    blog_integration = BlogIntegration()
    
    # Setup custom knowledge base
    blog_integration.setup_custom_knowledge_base()
    
    # Generate content ideas
    seed_topics = [
        "Full Stack Development with React and Django",
        "Modern Authentication in Web Applications", 
        "Microservices Architecture Best Practices"
    ]
    
    print("\n=== Content Ideas Generation ===")
    ideas = blog_integration.generate_content_ideas(seed_topics)
    
    for idea in ideas:
        print(f"\nTopic: {idea['topic']}")
        print(f"Related content: {', '.join(idea['related_content'])}")
        print(f"Outline preview: {idea['outline'][:200]}...")
    
    # Generate and save a complete blog post
    print("\n=== Generating Complete Blog Post ===")
    blog_result = blog_integration.write_and_save_blog_post(
        topic="Modern React and Django Integration Patterns",
        style="technical"
    )
    
    print(f"\nBlog post generated successfully!")
    print(f"Content length: {len(blog_result['content'])} characters")
    print(f"Retrieved {len(blog_result['retrieved_docs'])} context documents")
    
    # Show context documents used
    print(f"\nContext documents used:")
    for i, doc in enumerate(blog_result['retrieved_docs'], 1):
        print(f"  {i}. {doc['title']} (Score: {doc['similarity_score']:.3f})")

if __name__ == "__main__":
    main()
