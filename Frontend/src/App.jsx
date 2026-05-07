import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'https://filestoragebackend.onrender.com/api'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedPreview, setSelectedPreview] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploads, setUploads] = useState([])
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const formatBytes = (bytes) => {
    if (bytes == null) return '—'
    if (!bytes) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const index = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / 1024 ** index).toFixed(1)} ${sizes[index]}`
  }

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/files`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Unable to fetch files')
      }

      const list = result.data.map((file) => ({
        id: file._id,
        title: file.title,
        description: file.description,
        name: file.attachment?.split('/').pop() || file.title,
        size: null,
        path: file.attachment,
        previewUrl: `https://filestoragebackend.onrender.com/${file.attachment.replace(/\\/g, '/')}`,
        uploadedAt: file.createdAt ? new Date(file.createdAt).toLocaleString() : '',
      }))

      setUploads(list)
    } catch (error) {
      console.error(error)
      setErrorMessage('Unable to load files from the server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  useEffect(() => {
    return () => {
      if (selectedPreview) {
        URL.revokeObjectURL(selectedPreview)
      }
    }
  }, [selectedPreview])

  const handleFileChange = (event) => {
    setErrorMessage('')
    setStatusMessage('')
    const file = event.target.files?.[0] ?? null

    if (selectedPreview) {
      URL.revokeObjectURL(selectedPreview)
    }

    setSelectedFile(file)
    setSelectedPreview(file ? URL.createObjectURL(file) : null)
  }

  const handleUpload = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setStatusMessage('')

    if (!selectedFile) {
      setErrorMessage('Please select a file to upload.')
      return
    }

    if (title.trim().length < 3) {
      setErrorMessage('Title must be at least 3 characters long.')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('title', title.trim())
    formData.append('description', description.trim())

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()

      if (!response.ok) {
        setErrorMessage(result.error || 'Upload failed. Please check the file and try again.')
        return
      }

      const previewUrl = selectedPreview
      setUploads((current) => [
        {
          id: result.data._id || Date.now(),
          title: result.data.title,
          description: result.data.description,
          name: selectedFile.name,
          size: selectedFile.size,
          path: result.data.attachment,
          previewUrl,
          uploadedAt: new Date().toLocaleString(),
        },
        ...current,
      ])

      setSelectedFile(null)
      setSelectedPreview(null)
      setTitle('')
      setDescription('')
      setStatusMessage('File uploaded successfully.')
      event.target.reset()
      fetchFiles()
    } catch (error) {
      console.error(error)
      setErrorMessage('Unable to upload file. Please make sure the server is running and try again.')
    }
  }

  return (
    <div className="drive-shell">
      <header className="drive-appbar">
        <div className="drive-brand">
          <span className="brand-icon">D</span>
          <div>
            <p className="brand-name">FileDrive</p>
            <p className="brand-subtitle">A storage-style frontend for your backend</p>
          </div>
        </div>
      </header>

      <div className="drive-layout">
        <main className="drive-main">
          <div className="page-header">
            <div>
              <p className="page-label">My Drive</p>
              <h1>Files</h1>
            </div>
          </div>

          <section className="upload-panel">
            <div className="panel-header">
              <div>
                <p className="panel-title">Upload file</p>
              </div>
            </div>

            <form className="upload-form" onSubmit={handleUpload}>
              <label className="file-field">
                <span className="field-label">Select file</span>
                <div className="dropzone">
                {selectedPreview ? (
                  <div className="selected-preview-wrapper">
                    <img
                      src={selectedPreview}
                      className="selected-image-preview"
                      alt="Selected preview"
                    />
                    <p>{selectedFile?.name}</p>
                  </div>
                ) : (
                  <>
                    <p>Click to choose an image file</p>
                    <p className="dropzone-hint">Supported: images only</p>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </div>
            </label>

              <div className="field-row">
                <label className="field-group">
                  <span className="field-label">Title</span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Add a title"
                    minLength={3}
                    required
                  />
                </label>

                <label className="field-group">
                  <span className="field-label">Description</span>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Optional description"
                    rows={3}
                  />
                </label>
              </div>

              <div className="form-footer">
                {errorMessage && <p className="message error">{errorMessage}</p>}
                {statusMessage && <p className="message success">{statusMessage}</p>}
                <button type="submit" className="primary-button upload-button">
                  Upload file
                </button>
              </div>
            </form>
          </section>

          <section className="files-panel">
            <div className="panel-header">
              <div>
                <p className="panel-title">Recent uploads</p>
                <p className="panel-description">Uploaded items will appear here after successful upload.</p>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">
                <p>Loading files...</p>
              </div>
            ) : uploads.length === 0 ? (
              <div className="empty-state">
                <p>No uploads yet.</p>
                <span>Upload a file to see it listed here.</span>
              </div>
            ) : (
              <div className="file-table">
                <div className="file-row header">
                  <span>Name</span>
                  <span>Title</span>
                  <span>Size</span>
                  <span>Uploaded</span>
                </div>
                {uploads.map((item) => (
                  <div key={item.id} className="file-row">
                    <div className="file-cell file-name">
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="file-thumbnail"
                      />
                      <div>
                        <strong>{item.name}</strong>
                        <div className="file-subtitle">{item.description || item.title}</div>
                      </div>
                    </div>
                    <span>{item.title}</span>
                    <span>{formatBytes(item.size)}</span>
                    <span>{item.uploadedAt}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
