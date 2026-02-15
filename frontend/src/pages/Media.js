import React, { useState, useEffect } from 'react';
import {
  Film,
  Music,
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  User,
  FileIcon,
  AlertCircle,
  Trash2,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Media.css';

const Media = () => {
  const { user } = useAuth();
  const [mediaItems, setMediaItems] = useState([
    // Sample data - in production, fetch from backend
    {
      id: 1,
      title: 'Open Court Session - January 2024',
      type: 'video', // 'video', 'image', 'document', 'audio'
      fileSize: '245 MB',
      uploadedBy: 'Admin User',
      uploadedDate: '2024-01-15',
      thumbnail: 'https://via.placeholder.com/300x200?text=Video+Thumbnail',
      url: '#',
      description: 'Full recording of the open court session held on January 15, 2024'
    },
    {
      id: 2,
      title: 'Press Release - Monthly Report',
      type: 'document',
      fileSize: '2.5 MB',
      uploadedBy: 'John Doe',
      uploadedDate: '2024-01-10',
      url: '#',
      description: 'Monthly performance report for the DIG office'
    },
    {
      id: 3,
      title: 'Court Proceedings Audio',
      type: 'audio',
      fileSize: '156 MB',
      uploadedBy: 'Sarah Smith',
      uploadedDate: '2024-01-08',
      url: '#',
      description: 'Audio recording of court proceedings'
    },
    {
      id: 4,
      title: 'Court Layout Diagram',
      type: 'image',
      fileSize: '1.2 MB',
      uploadedBy: 'Admin User',
      uploadedDate: '2024-01-05',
      thumbnail: 'https://via.placeholder.com/300x200?text=Court+Diagram',
      url: '#',
      description: 'Architectural layout of the open court'
    }
  ]);

  const [filteredMedia, setFilteredMedia] = useState(mediaItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);

  // Filter media based on search and type
  useEffect(() => {
    let filtered = mediaItems;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMedia(filtered);
  }, [searchTerm, filterType, mediaItems]);

  const getMediaIcon = (type) => {
    switch (type) {
      case 'video':
        return <Film size={20} />;
      case 'audio':
        return <Music size={20} />;
      case 'document':
        return <FileText size={20} />;
      case 'image':
        return <FileIcon size={20} />;
      default:
        return <FileIcon size={20} />;
    }
  };

  const getMediaColor = (type) => {
    switch (type) {
      case 'video':
        return 'media-video';
      case 'audio':
        return 'media-audio';
      case 'document':
        return 'media-document';
      case 'image':
        return 'media-image';
      default:
        return 'media-default';
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this media?')) {
      setMediaItems(mediaItems.filter(item => item.id !== id));
    }
  };

  const handleDownload = (item) => {
    alert(`Downloading: ${item.title}`);
    // In production: implement actual download logic
  };

  const handleUpload = () => {
    alert('Upload feature coming soon!');
    // In production: implement upload modal/form
  };

  return (
    <div className="media-page">
      {/* Header */}
      <div className="media-header">
        <div className="media-header-left">
          <Film size={32} className="header-icon" />
          <div>
            <h1>Media Library</h1>
            <p>Manage media content related to the Open Court</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="media-stats">
        <div className="stat-card video-stat">
          <Film size={24} />
          <div>
            <h3>{mediaItems.filter(m => m.type === 'video').length}</h3>
            <p>Videos</p>
          </div>
        </div>

        <div className="stat-card document-stat">
          <FileText size={24} />
          <div>
            <h3>{mediaItems.filter(m => m.type === 'document').length}</h3>
            <p>Documents</p>
          </div>
        </div>

        <div className="stat-card image-stat">
          <FileIcon size={24} />
          <div>
            <h3>{mediaItems.filter(m => m.type === 'image').length}</h3>
            <p>Images</p>
          </div>
        </div>

        <div className="stat-card audio-stat">
          <Music size={24} />
          <div>
            <h3>{mediaItems.filter(m => m.type === 'audio').length}</h3>
            <p>Audio Files</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="media-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search media by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={20} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
            <option value="image">Images</option>
            <option value="audio">Audio</option>
          </select>
        </div>

        {user?.role === 'ADMIN' && (
          <button onClick={handleUpload} className="btn-upload">
            <Upload size={20} />
            Upload Media
          </button>
        )}
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="media-empty">
          <AlertCircle size={48} />
          <h3>No media found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="media-grid">
          {filteredMedia.map((item) => (
            <div key={item.id} className={`media-card ${getMediaColor(item.type)}`}>
              {/* Thumbnail for videos and images */}
              {(item.type === 'video' || item.type === 'image') && item.thumbnail && (
                <div className="media-thumbnail">
                  <img src={item.thumbnail} alt={item.title} />
                  <div className="thumbnail-overlay">
                    <Eye size={32} />
                  </div>
                </div>
              )}

              {/* Icon for documents and audio */}
              {(item.type === 'document' || item.type === 'audio') && (
                <div className="media-icon">
                  {getMediaIcon(item.type)}
                </div>
              )}

              {/* Content */}
              <div className="media-content">
                <div className="media-type-badge">
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </div>

                <h3 className="media-title">{item.title}</h3>

                <p className="media-description">{item.description}</p>

                {/* Meta Info */}
                <div className="media-meta">
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>{new Date(item.uploadedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="meta-item">
                    <User size={16} />
                    <span>{item.uploadedBy}</span>
                  </div>
                </div>

                <div className="media-filesize">
                  <FileIcon size={14} />
                  <span>{item.fileSize}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="media-actions">
                <button
                  onClick={() => handleDownload(item)}
                  className="action-btn download-btn"
                  title="Download"
                >
                  <Download size={20} />
                </button>

                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="action-btn delete-btn"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Media;