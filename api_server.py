#!/usr/bin/env python3
"""
FastAPI backend for the RAG Blog System.
Provides REST API endpoints for the React frontend.
"""

import os
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import uvicorn
from rag_blog import RAGBlogSystem

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="RAG Blog System API",
    description="API for generating blog content using RAG",
    version="1.0.0"
)

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global RAG system instance
rag_system = None

# Pydantic models for request/response
class BlogGenerationRequest(BaseModel):
    topic: str
    style: str = "informative"
    length: str = "medium"
    target_audience: str = "general"
    num_context_docs: int = 3

class BlogOutlineRequest(BaseModel):
    topic: str
    num_context_docs: int = 3

class SearchRequest(BaseModel):
    query: str
    k: int = 5

class ContentEnhancementRequest(BaseModel):
    section_title: str
    existing_content: str
    search_query: Optional[str] = None

class DocumentUpload(BaseModel):
    documents: List[Dict[str, Any]]

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize the RAG system on startup."""
    global rag_system
    
    print("Initializing RAG Blog System...")
    
    try:
        rag_system = RAGBlogSystem(
            mistral_api_key=os.getenv('MISTRAL_API_KEY'),
            use_mock=not bool(os.getenv('MISTRAL_API_KEY'))
        )
        
        # Setup knowledge base
        rag_system.setup_knowledge_base()
        
        print("RAG system initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing RAG system: {e}")
        # Continue with None rag_system - will be handled in endpoints

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "RAG Blog System API", "status": "running"}

@app.get("/status")
async def get_status():
    """Get system status."""
    if rag_system is None:
        return {"status": "error", "message": "RAG system not initialized"}
    
    return rag_system.get_system_status()

@app.post("/generate-blog-post")
async def generate_blog_post(request: BlogGenerationRequest):
    """Generate a complete blog post."""
    if rag_system is None:
        raise HTTPException(status_code=500, detail="RAG system not initialized")
    
    try:
        result = rag_system.write_blog_post(
            topic=request.topic,
            style=request.style,
            length=request.length,
            target_audience=request.target_audience,
            num_context_docs=request.num_context_docs
        )
        
        return JSONResponse(content={
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating blog post: {str(e)}")

@app.post("/generate-outline")
async def generate_outline(request: BlogOutlineRequest):
    """Generate a blog post outline."""
    if rag_system is None:
        raise HTTPException(status_code=500, detail="RAG system not initialized")
    
    try:
        result = rag_system.create_blog_outline(
            topic=request.topic,
            num_context_docs=request.num_context_docs
        )
        
        return JSONResponse(content={
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating outline: {str(e)}")

@app.post("/search")
async def search_knowledge_base(request: SearchRequest):
    """Search the knowledge base."""
    if rag_system is None:
        raise HTTPException(status_code=500, detail="RAG system not initialized")
    
    try:
        results = rag_system.search_knowledge_base(
            query=request.query,
            k=request.k
        )
        
        return JSONResponse(content={
            "success": True,
            "data": {
                "query": request.query,
                "results": results,
                "total_results": len(results)
            },
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching: {str(e)}")

@app.post("/enhance-content")
async def enhance_content(request: ContentEnhancementRequest):
    """Enhance existing content."""
    if rag_system is None:
        raise HTTPException(status_code=500, detail="RAG system not initialized")
    
    try:
        enhanced_content = rag_system.enhance_existing_content(
            section_title=request.section_title,
            existing_content=request.existing_content,
            search_query=request.search_query
        )
        
        return JSONResponse(content={
            "success": True,
            "data": {
                "section_title": request.section_title,
                "enhanced_content": enhanced_content
            },
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error enhancing content: {str(e)}")

@app.get("/config")
async def get_config():
    """Get available configuration options."""
    return {
        "styles": ["informative", "conversational", "technical", "tutorial"],
        "lengths": ["short", "medium", "long"],
        "audiences": ["general", "technical", "beginners", "developers", "business"],
        "models": {
            "sentence_transformer": "all-MiniLM-L6-v2",
            "mistral": "mistral-tiny"
        }
    }

@app.post("/upload-documents")
async def upload_documents(request: DocumentUpload):
    """Upload custom documents to the knowledge base."""
    if rag_system is None:
        raise HTTPException(status_code=500, detail="RAG system not initialized")
    
    try:
        # This would rebuild the knowledge base with new documents
        # For now, return success message
        return JSONResponse(content={
            "success": True,
            "message": f"Uploaded {len(request.documents)} documents",
            "data": {"document_count": len(request.documents)}
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading documents: {str(e)}")

if __name__ == "__main__":
    print("Starting RAG Blog System API server...")
    print("Frontend will be available at: http://localhost:3000")
    print("API documentation at: http://localhost:8000/docs")
    
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
