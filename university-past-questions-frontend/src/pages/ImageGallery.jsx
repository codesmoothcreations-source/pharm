import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getImages, deleteImage, updateImage, getMyImageStats } from '../api/imagesApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Toast from '../components/common/Toast';
import { FaUpload, FaTrash, FaEdit, FaSave, FaTimes, FaImage, FaChartBar, FaFilter, FaSearch } from 'react-icons/fa';
import './ImageGallery.css';

const ImageGallery = () => {
    const { user } = useAuth();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [stats, setStats] = useState(null);
    const [editingImage, setEditingImage] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', tags: '', isPublic: true });
    
    // Upload form state
    const [uploadForm, setUploadForm] = useState({
        image: null,
        title: '',
        description: '',
        tags: '',
        isPublic: true
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    
    // Filter state
    const [filters, setFilters] = useState({
        myImages: true,
        search: '',
        tags: ''
    });
    const [showUploadForm, setShowUploadForm] = useState(false);

    // Fetch images on component mount and when filters change
    useEffect(() => {
        fetchImages();
        fetchStats();
    }, [filters]);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const response = await getImages(filters);
            setImages(response.data || []);
        } catch (error) {
            showToast('Error loading images', 'error');
            console.error('Fetch images error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await getMyImageStats();
            setStats(response.data);
        } catch (error) {
            console.error('Fetch stats error:', error);
        }
    };

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showToast('Please select an image file', 'error');
                return;
            }
            
            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                showToast('Image size must be less than 10MB', 'error');
                return;
            }
            
            setUploadForm({ ...uploadForm, image: file });
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        
        if (!uploadForm.image) {
            showToast('Please select an image', 'error');
            return;
        }
        
        if (!uploadForm.title.trim()) {
            showToast('Please provide a title', 'error');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('image', uploadForm.image);
            formData.append('title', uploadForm.title);
            formData.append('description', uploadForm.description);
            formData.append('tags', uploadForm.tags);
            formData.append('isPublic', uploadForm.isPublic);

            const { uploadImage } = await import('../api/imagesApi');
            await uploadImage(formData);
            
            showToast('Image uploaded successfully!', 'success');
            
            // Reset form
            setUploadForm({
                image: null,
                title: '',
                description: '',
                tags: '',
                isPublic: true
            });
            setPreviewUrl(null);
            setShowUploadForm(false);
            
            // Refresh images and stats
            fetchImages();
            fetchStats();
        } catch (error) {
            showToast(error.response?.data?.message || 'Error uploading image', 'error');
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (imageId) => {
        if (!window.confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            await deleteImage(imageId);
            showToast('Image deleted successfully', 'success');
            fetchImages();
            fetchStats();
        } catch (error) {
            showToast(error.response?.data?.message || 'Error deleting image', 'error');
            console.error('Delete error:', error);
        }
    };

    const startEdit = (image) => {
        setEditingImage(image._id);
        setEditForm({
            title: image.title,
            description: image.description || '',
            tags: image.tags?.join(', ') || '',
            isPublic: image.isPublic
        });
    };

    const cancelEdit = () => {
        setEditingImage(null);
        setEditForm({ title: '', description: '', tags: '', isPublic: true });
    };

    const handleUpdate = async (imageId) => {
        try {
            await updateImage(imageId, editForm);
            showToast('Image updated successfully', 'success');
            setEditingImage(null);
            fetchImages();
        } catch (error) {
            showToast(error.response?.data?.message || 'Error updating image', 'error');
            console.error('Update error:', error);
        }
    };

    if (loading && images.length === 0) {
        return <LoadingSpinner text="Loading images..." fullScreen />;
    }

    return (
        <div className="image-gallery-container">
            {toast.show && <Toast message={toast.message} type={toast.type} />}
            
            <div className="gallery-header">
                <h1><FaImage /> My Image Gallery</h1>
                <p>Upload and manage your images with Cloudinary</p>
            </div>

            {/* Statistics */}
            {stats && (
                <div className="image-stats">
                    <div className="stat-card">
                        <FaChartBar />
                        <div>
                            <h3>{stats.totalImages}</h3>
                            <p>Total Images</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <FaImage />
                        <div>
                            <h3>{stats.publicImages}</h3>
                            <p>Public</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <FaImage />
                        <div>
                            <h3>{stats.privateImages}</h3>
                            <p>Private</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <FaChartBar />
                        <div>
                            <h3>{stats.totalStorageMB} MB</h3>
                            <p>Storage Used</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Button */}
            <div className="gallery-actions">
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowUploadForm(!showUploadForm)}
                >
                    <FaUpload /> {showUploadForm ? 'Hide Upload Form' : 'Upload New Image'}
                </button>
            </div>

            {/* Upload Form */}
            {showUploadForm && (
                <div className="upload-form-container">
                    <form onSubmit={handleUpload} className="upload-form">
                        <h2>Upload New Image</h2>
                        
                        <div className="form-group">
                            <label htmlFor="image">Select Image *</label>
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleFileChange}
                                required
                            />
                            {previewUrl && (
                                <div className="image-preview">
                                    <img src={previewUrl} alt="Preview" />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="title">Title *</label>
                            <input
                                type="text"
                                id="title"
                                value={uploadForm.title}
                                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                placeholder="Enter image title"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                value={uploadForm.description}
                                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                placeholder="Enter image description"
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="tags">Tags (comma-separated)</label>
                            <input
                                type="text"
                                id="tags"
                                value={uploadForm.tags}
                                onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                                placeholder="e.g., nature, landscape, sunset"
                            />
                        </div>

                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={uploadForm.isPublic}
                                    onChange={(e) => setUploadForm({ ...uploadForm, isPublic: e.target.checked })}
                                />
                                Make this image public
                            </label>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Upload Image'}
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowUploadForm(false);
                                    setPreviewUrl(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div className="gallery-filters">
                <div className="filter-group">
                    <FaFilter />
                    <label>
                        <input
                            type="checkbox"
                            checked={filters.myImages}
                            onChange={(e) => setFilters({ ...filters, myImages: e.target.checked })}
                        />
                        My Images Only
                    </label>
                </div>
                
                <div className="filter-group">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search images..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>
            </div>

            {/* Image Grid */}
            <div className="images-grid">
                {images.length === 0 ? (
                    <div className="no-images">
                        <FaImage />
                        <p>No images found. Upload your first image!</p>
                    </div>
                ) : (
                    images.map((image) => (
                        <div key={image._id} className="image-card">
                            {editingImage === image._id ? (
                                <div className="edit-form">
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        placeholder="Title"
                                    />
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        placeholder="Description"
                                        rows="2"
                                    />
                                    <input
                                        type="text"
                                        value={editForm.tags}
                                        onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                                        placeholder="Tags (comma-separated)"
                                    />
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={editForm.isPublic}
                                            onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })}
                                        />
                                        Public
                                    </label>
                                    <div className="edit-actions">
                                        <button onClick={() => handleUpdate(image._id)} className="btn-save">
                                            <FaSave /> Save
                                        </button>
                                        <button onClick={cancelEdit} className="btn-cancel">
                                            <FaTimes /> Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="image-wrapper">
                                        <img src={image.secureUrl} alt={image.title} />
                                    </div>
                                    <div className="image-info">
                                        <h3>{image.title}</h3>
                                        {image.description && <p>{image.description}</p>}
                                        {image.tags && image.tags.length > 0 && (
                                            <div className="image-tags">
                                                {image.tags.map((tag, index) => (
                                                    <span key={index} className="tag">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="image-meta">
                                            <span>{image.width} x {image.height}</span>
                                            <span>{(image.size / 1024).toFixed(2)} KB</span>
                                            <span>{image.isPublic ? 'Public' : 'Private'}</span>
                                        </div>
                                        {image.uploadedBy._id === user._id && (
                                            <div className="image-actions">
                                                <button onClick={() => startEdit(image)} className="btn-edit">
                                                    <FaEdit /> Edit
                                                </button>
                                                <button onClick={() => handleDelete(image._id)} className="btn-delete">
                                                    <FaTrash /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ImageGallery;
