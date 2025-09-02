#!/usr/bin/env python3
"""
Demo script for the RAG Blog System.

This script demonstrates how to use the RAG system for blog content generation,
including both mock mode (no API key required) and real Mistral AI integration.
"""

import os
import sys
from dotenv import load_dotenv
from rag_blog import RAGBlogSystem, load_sample_blog_data

# Load environment variables
load_dotenv()

def demo_basic_usage():
    """Demonstrate basic RAG blog system usage."""
    print("=== RAG Blog System Demo ===\n")
    
    # Initialize the system (will use mock if no API key)
    mistral_key = os.getenv('MISTRAL_API_KEY')
    rag_system = RAGBlogSystem(
        mistral_api_key=mistral_key,
        use_mock=not bool(mistral_key)  # Use mock if no API key
    )
    
    # Check system status
    status = rag_system.get_system_status()
    print(f"System Status: {status}")
    print(f"Using Mock Generator: {status['using_mock_generator']}\n")
    
    # Setup knowledge base with sample data
    print("Setting up knowledge base...")
    rag_system.setup_knowledge_base()
    print("Knowledge base ready!\n")
    
    return rag_system

def demo_blog_generation(rag_system):
    """Demonstrate blog post generation."""
    print("=== Blog Post Generation Demo ===\n")
    
    # Generate a blog post
    topic = "Advanced Python Techniques for Web Development"
    print(f"Generating blog post about: {topic}")
    
    result = rag_system.write_blog_post(
        topic=topic,
        style="technical",
        length="medium",
        target_audience="developers"
    )
    
    print(f"\nGenerated Blog Post:")
    print("=" * 50)
    print(result['content'])
    print("=" * 50)
    print(f"\nMetadata:")
    print(f"- Style: {result['style']}")
    print(f"- Target Audience: {result['target_audience']}")
    print(f"- Context Documents Used: {len(result['retrieved_docs'])}")
    print(f"- Using Mock: {result['using_mock']}")

def demo_search_functionality(rag_system):
    """Demonstrate knowledge base search."""
    print("\n=== Knowledge Base Search Demo ===\n")
    
    queries = [
        "machine learning algorithms",
        "web security best practices", 
        "Python virtual environments"
    ]
    
    for query in queries:
        print(f"Searching for: '{query}'")
        results = rag_system.search_knowledge_base(query, k=2)
        
        for i, result in enumerate(results, 1):
            print(f"  {i}. {result['title']} (Score: {result['similarity_score']:.3f})")
            print(f"     {result['chunk'][:100]}...")
        print()

def demo_outline_generation(rag_system):
    """Demonstrate blog outline generation."""
    print("=== Blog Outline Generation Demo ===\n")
    
    topic = "Building Scalable Web Applications"
    print(f"Creating outline for: {topic}")
    
    outline_result = rag_system.create_blog_outline(topic)
    
    print("\nGenerated Outline:")
    print("-" * 30)
    print(outline_result['outline'])
    print("-" * 30)

def demo_content_enhancement(rag_system):
    """Demonstrate content enhancement functionality."""
    print("\n=== Content Enhancement Demo ===\n")
    
    section_title = "Database Optimization"
    existing_content = """
    Database optimization is important for application performance.
    You should create indexes on frequently queried columns.
    """
    
    print(f"Enhancing section: {section_title}")
    print(f"Original content: {existing_content}")
    
    enhanced = rag_system.enhance_existing_content(
        section_title=section_title,
        existing_content=existing_content
    )
    
    print(f"\nEnhanced content:")
    print("-" * 30)
    print(enhanced)
    print("-" * 30)

def main():
    """Main demo function."""
    try:
        # Initialize system
        rag_system = demo_basic_usage()
        
        # Run demos
        demo_blog_generation(rag_system)
        demo_search_functionality(rag_system)
        demo_outline_generation(rag_system)
        demo_content_enhancement(rag_system)
        
        print("\n=== Demo Complete ===")
        print("\nTo use with real Mistral AI:")
        print("1. Get a Mistral API key from https://console.mistral.ai/")
        print("2. Set the MISTRAL_API_KEY environment variable")
        print("3. Run the demo again")
        
    except Exception as e:
        print(f"Error running demo: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
