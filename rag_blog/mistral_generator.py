"""
Mistral AI integration for generating blog content based on retrieved context.
"""

import os
from typing import List, Dict, Any, Optional
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
import logging

logger = logging.getLogger(__name__)


class MistralBlogGenerator:
    """Mistral AI-based blog content generator."""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "mistral-tiny"):
        """
        Initialize the Mistral blog generator.
        
        Args:
            api_key: Mistral API key. If None, will try to get from environment
            model: Mistral model to use for generation
        """
        self.api_key = api_key or os.getenv('MISTRAL_API_KEY')
        self.model = model
        self.client = None
        
        if not self.api_key:
            logger.warning("No Mistral API key provided. Set MISTRAL_API_KEY environment variable.")
        else:
            self.client = MistralClient(api_key=self.api_key)
    
    def generate_blog_post(self, 
                          topic: str, 
                          context: str, 
                          style: str = "informative",
                          length: str = "medium",
                          target_audience: str = "general") -> str:
        """
        Generate a blog post based on topic and retrieved context.
        
        Args:
            topic: Blog post topic/title
            context: Retrieved context from vector database
            style: Writing style (informative, conversational, technical, etc.)
            length: Desired length (short, medium, long)
            target_audience: Target audience (general, technical, beginner, etc.)
            
        Returns:
            Generated blog post content
        """
        if not self.client:
            raise ValueError("Mistral client not initialized. Check your API key.")
        
        # Create the prompt
        prompt = self._create_blog_prompt(topic, context, style, length, target_audience)
        
        try:
            # Generate content using Mistral
            messages = [ChatMessage(role="user", content=prompt)]
            
            response = self.client.chat(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=2000
            )
            
            generated_content = response.choices[0].message.content
            return generated_content
            
        except Exception as e:
            logger.error(f"Error generating blog post: {e}")
            raise
    
    def _create_blog_prompt(self, 
                           topic: str, 
                           context: str, 
                           style: str, 
                           length: str, 
                           target_audience: str) -> str:
        """Create a structured prompt for blog generation."""
        
        length_guidelines = {
            "short": "Write a concise blog post of about 300-500 words.",
            "medium": "Write a comprehensive blog post of about 700-1000 words.",
            "long": "Write a detailed, in-depth blog post of about 1200-1500 words."
        }
        
        style_guidelines = {
            "informative": "Use a clear, educational tone with well-structured information.",
            "conversational": "Use a friendly, engaging tone as if talking to a friend.",
            "technical": "Use precise technical language appropriate for developers.",
            "tutorial": "Provide step-by-step instructions with practical examples."
        }
        
        prompt = f"""You are an expert blog writer. Create a {style} blog post about "{topic}" for a {target_audience} audience.

{length_guidelines.get(length, length_guidelines["medium"])}
{style_guidelines.get(style, style_guidelines["informative"])}

Use the following context information as reference, but don't copy it directly. Instead, synthesize and expand upon the information to create original, engaging content:

CONTEXT:
{context}

REQUIREMENTS:
1. Create an engaging title (if different from the topic)
2. Write a compelling introduction that hooks the reader
3. Organize content with clear headings and subheadings
4. Include practical examples or actionable insights
5. End with a strong conclusion and key takeaways
6. Ensure the content is original and adds value beyond the source material

BLOG POST:"""
        
        return prompt
    
    def generate_blog_outline(self, topic: str, context: str) -> str:
        """
        Generate a blog post outline based on topic and context.
        
        Args:
            topic: Blog post topic
            context: Retrieved context
            
        Returns:
            Generated blog outline
        """
        if not self.client:
            raise ValueError("Mistral client not initialized. Check your API key.")
        
        prompt = f"""Create a detailed outline for a blog post about "{topic}".

Use this context for reference:
{context}

Create a structured outline with:
1. Main title
2. Introduction points
3. 3-5 main sections with subsections
4. Conclusion points
5. Suggested call-to-action

Make the outline engaging and logical, ensuring good flow between sections."""

        try:
            messages = [ChatMessage(role="user", content=prompt)]
            
            response = self.client.chat(
                model=self.model,
                messages=messages,
                temperature=0.5,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating outline: {e}")
            raise
    
    def enhance_blog_section(self, section_title: str, existing_content: str, context: str) -> str:
        """
        Enhance a specific section of a blog post.
        
        Args:
            section_title: Title of the section to enhance
            existing_content: Current content of the section
            context: Relevant context for enhancement
            
        Returns:
            Enhanced section content
        """
        if not self.client:
            raise ValueError("Mistral client not initialized. Check your API key.")
        
        prompt = f"""Enhance the following blog section titled "{section_title}".

CURRENT CONTENT:
{existing_content}

ADDITIONAL CONTEXT:
{context}

Please improve the section by:
1. Adding more depth and detail where appropriate
2. Including relevant examples or case studies
3. Ensuring clarity and readability
4. Maintaining consistency with the existing tone
5. Adding actionable insights if relevant

ENHANCED SECTION:"""

        try:
            messages = [ChatMessage(role="user", content=prompt)]
            
            response = self.client.chat(
                model=self.model,
                messages=messages,
                temperature=0.6,
                max_tokens=1500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error enhancing section: {e}")
            raise


class MockMistralGenerator:
    """Mock generator for testing without API key."""
    
    def __init__(self, **kwargs):
        logger.info("Using mock Mistral generator (no API key required)")
    
    def generate_blog_post(self, topic: str, context: str, **kwargs) -> str:
        """Generate a mock blog post."""
        return f"""# {topic}

## Introduction
This is a sample blog post about {topic}. This content is generated using a mock generator for demonstration purposes.

## Main Content
Based on the retrieved context, here are the key points:

{context[:500]}...

## Conclusion
This demonstrates how the RAG system works. In a real implementation, this would be generated by Mistral AI based on your retrieved context.

---
*Generated using RAG Blog System*"""
    
    def generate_blog_outline(self, topic: str, context: str) -> str:
        """Generate a mock outline."""
        return f"""# Blog Outline: {topic}

## 1. Introduction
- Hook the reader with an interesting fact or question
- Brief overview of the topic

## 2. Main Sections
- Key concepts and definitions
- Practical applications
- Best practices

## 3. Conclusion
- Summary of key points
- Call to action

*This is a mock outline. Real implementation would use Mistral AI.*"""
    
    def enhance_blog_section(self, section_title: str, existing_content: str, context: str) -> str:
        """Generate mock enhanced section."""
        return f"""Enhanced Section: {section_title}

{existing_content}

[Enhanced with additional context and examples - this would be generated by Mistral AI in real implementation]"""
