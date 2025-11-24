import React, { useState, useEffect } from 'react'
import { FaFileWord, FaDownload, FaExternalLinkAlt, FaSpinner } from 'react-icons/fa'
import './DocxViewer.css'

const DocxViewer = ({ url, title }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('viewer') // 'viewer' or 'google-docs'

  useEffect(() => {
    loadDocxFile()
  }, [url])

  const loadDocxFile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to fetch the file to verify it exists
      const response = await fetch(url, { method: 'HEAD' })
      if (!response.ok) {
        throw new Error('File not found or not accessible')
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Error loading DOCX file:', err)
      setError('Failed to load document')
      setLoading(false)
    }
  }

  const openInGoogleDocs = () => {
    const googleDocsUrl = `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`
    window.open(googleDocsUrl, '_blank', 'noopener,noreferrer')
  }

  const downloadDocx = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = `${title || 'document'}.docx`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openDirectly = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="docx-viewer-loading">
        <FaSpinner className="spinner" />
        <p>Loading document...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="docx-viewer-error">
        <FaFileWord className="error-icon" />
        <h3>Unable to Display Document</h3>
        <p>{error}</p>
        <div className="docx-viewer-actions">
          <button className="btn btn-primary" onClick={openDirectly}>
            <FaExternalLinkAlt />
            Open in New Tab
          </button>
          <button className="btn btn-secondary" onClick={downloadDocx}>
            <FaDownload />
            Download
          </button>
          <button className="btn btn-outline" onClick={openInGoogleDocs}>
            View with Google Docs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="docx-viewer">
      <div className="docx-viewer-header">
        <div className="docx-info">
          <FaFileWord className="docx-icon" />
          <span className="docx-title">{title || 'Document'}</span>
        </div>
        <div className="docx-actions">
          <button 
            className={`btn btn-sm ${viewMode === 'google-docs' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setViewMode('google-docs')
              openInGoogleDocs()
            }}
            title="View with Google Docs"
          >
            <FaExternalLinkAlt />
            Google Docs
          </button>
          <button 
            className="btn btn-sm btn-outline"
            onClick={openDirectly}
            title="Open directly"
          >
            <FaExternalLinkAlt />
            Open
          </button>
          <button 
            className="btn btn-sm btn-secondary"
            onClick={downloadDocx}
            title="Download document"
          >
            <FaDownload />
            Download
          </button>
        </div>
      </div>

      <div className="docx-viewer-content">
        <div className="docx-embed-placeholder">
          <div className="docx-preview-info">
            <FaFileWord className="preview-icon" />
            <h4>DOCX Document</h4>
            <p>This document can be viewed in multiple ways:</p>
            <ul>
              <li>Click "Google Docs" above to view it in Google Docs (recommended)</li>
              <li>Click "Open" to download and open in your default application</li>
              <li>Click "Download" to save the file to your device</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocxViewer