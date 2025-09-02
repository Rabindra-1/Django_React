import React from 'react';
import SimpleRagGenerator from '../components/SimpleRagGenerator';

/**
 * RAG Blog Generator Page
 * Uses our new FastAPI backend with Wikipedia, Reddit, and Medium sources
 */
const RagGeneratorPage = () => {
  return (
    <div className="min-h-screen">
      <SimpleRagGenerator />
    </div>
  );
};

export default RagGeneratorPage;
