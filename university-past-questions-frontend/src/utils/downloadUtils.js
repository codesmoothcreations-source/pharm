/**
 * Utility functions for instant file downloads and toast notifications
 */

/**
 * Instantly downloads a file from a URL
 * @param {string} url - The file URL to download from
 * @param {string} filename - The name for the downloaded file
 * @param {boolean} openInNewTab - Whether to open in new tab instead of downloading
 * @returns {Promise<void>}
 */
export const instantDownload = async (url, filename = 'download', openInNewTab = false) => {
  return new Promise((resolve, reject) => {
    try {
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      
      // Set target based on parameter
      if (openInNewTab) {
        link.target = '_blank'
        // For opening in new tab, we need to trigger without download
        const openLink = document.createElement('a')
        openLink.href = url
        openLink.target = '_blank'
        openLink.rel = 'noopener noreferrer'
        document.body.appendChild(openLink)
        openLink.click()
        document.body.removeChild(openLink)
      } else {
        // For direct download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      
      resolve()
    } catch (error) {
      console.error('Download failed:', error)
      reject(error)
    }
  })
}

/**
 * Downloads a file with automatic filename detection based on URL
 * @param {string} url - The file URL
 * @param {string} customName - Custom filename (optional)
 * @param {boolean} openInNewTab - Whether to open in new tab (optional)
 * @returns {Promise<void>}
 */
export const smartDownload = async (url, customName = null, openInNewTab = false) => {
  // Extract filename from URL if customName not provided
  let filename = customName
  if (!filename) {
    const urlParts = url.split('/')
    const urlFilename = urlParts[urlParts.length - 1]
    
    // Remove query parameters and extract clean filename
    filename = urlFilename.split('?')[0].split('#')[0]
    
    // If no extension in filename, try to determine from URL patterns
    if (!filename.includes('.')) {
      if (url.includes('pdf') || url.includes('document')) {
        filename += '.pdf'
      } else if (url.includes('image') || url.includes('img')) {
        filename += '.jpg'
      }
    }
  }
  
  return instantDownload(url, filename, openInNewTab)
}

/**
 * Batch download multiple files
 * @param {Array<{url: string, filename?: string}>} files - Array of files to download
 * @param {number} delay - Delay between downloads in ms (default: 500)
 * @returns {Promise<void[]>}
 */
export const batchDownload = async (files, delay = 500) => {
  const downloads = files.map((file, index) => 
    new Promise(resolve => 
      setTimeout(async () => {
        try {
          await smartDownload(file.url, file.filename)
          resolve({ success: true, filename: file.filename || file.url })
        } catch (error) {
          resolve({ success: false, error: error.message, filename: file.filename || file.url })
        }
      }, index * delay)
    )
  )
  
  return Promise.all(downloads)
}

/**
 * Download with progress tracking
 * @param {string} url - File URL
 * @param {string} filename - Filename
 * @param {(progress: number) => void} onProgress - Progress callback
 * @returns {Promise<void>}
 */
export const downloadWithProgress = async (url, filename, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    xhr.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100
        onProgress(progress)
      }
    }
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response])
        const downloadUrl = window.URL.createObjectURL(blob)
        instantDownload(downloadUrl, filename).finally(() => {
          window.URL.revokeObjectURL(downloadUrl)
          resolve()
        })
      } else {
        reject(new Error(`Download failed with status: ${xhr.status}`))
      }
    }
    
    xhr.onerror = () => reject(new Error('Network error during download'))
    xhr.responseType = 'blob'
    xhr.open('GET', url)
    xhr.send()
  })
}

/**
 * Check if a URL is downloadable
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export const isDownloadableUrl = (url) => {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname.toLowerCase()
    
    // Check for common file extensions
    const downloadableExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.rar']
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp']
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']
    const audioExtensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg']
    
    return [...downloadableExtensions, ...imageExtensions, ...videoExtensions, ...audioExtensions]
      .some(ext => pathname.endsWith(ext))
  } catch {
    return false
  }
}

/**
 * Get file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate file before download
 * @param {string} url - File URL
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export const validateFileForDownload = async (url, maxSize = 50 * 1024 * 1024) => {
  try {
    if (!isDownloadableUrl(url)) {
      return { valid: false, error: 'Unsupported file type' }
    }
    
    const response = await fetch(url, { method: 'HEAD' })
    const contentLength = response.headers.get('content-length')
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      return { valid: false, error: `File too large. Maximum size: ${formatFileSize(maxSize)}` }
    }
    
    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Unable to validate file' }
  }
}