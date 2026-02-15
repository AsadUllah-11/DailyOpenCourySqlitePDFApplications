import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  ThumbsUp, 
  ThumbsDown, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipForward,
  SkipBack,
  User,
  Calendar,
  FileVideo,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search
} from 'lucide-react';
import { getAllVideoFeedback, submitVideoFeedback, getVideoFeedbackStats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './VideoFeedback.css';

const VideoFeedback = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [feedbackRemarks, setFeedbackRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 6;

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // ✅ Helper function to construct video URL
  // ✅ Helper function to construct video URL - handles both cases
const getVideoURL = (videoFile) => {
  if (!videoFile) {
    console.error('❌ No video file provided');
    return '';
  }
  
  // If videoFile already contains full URL, return it as-is
  if (videoFile.startsWith('http://') || videoFile.startsWith('https://')) {
    console.log('🎬 Video file is already a full URL:', videoFile);
    return videoFile;
  }
  
  // Otherwise, construct the URL
  const cleanPath = videoFile.replace(/^\/+/, '');
  const url = `http://localhost:8000/media/${cleanPath}`;
  
  console.log('🎬 Constructing video URL:');
  console.log('   Input:', videoFile);
  console.log('   Final URL:', url);
  
  return url;
};

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, searchTerm, filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [videosData, statsData] = await Promise.all([
        getAllVideoFeedback(),
        getVideoFeedbackStats()
      ]);
      
      const videoArray = Array.isArray(videosData) ? videosData : [];
      
      console.log('📊 Fetched videos:', videoArray);
      console.log('📊 Stats:', statsData);
      
      setVideos(videoArray);
      setStats(statsData);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError(error.message || 'Failed to load video feedback');
      setVideos([]);
      setStats({ total: 0, pending: 0, liked: 0, disliked: 0 });
    } finally {
      setLoading(false);
    }
  };

  const filterVideos = () => {
    if (!Array.isArray(videos)) {
      setFilteredVideos([]);
      return;
    }

    let result = videos;

    if (filterStatus !== 'ALL') {
      result = result.filter(v => v.admin_feedback === filterStatus);
    }

    if (searchTerm) {
      result = result.filter(v =>
        v.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVideos(result);
    setCurrentPage(1);
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setShowModal(true);
    setFeedbackRemarks(video.admin_remarks || '');
    setIsPlaying(false);
  };

  const handleSubmitFeedback = async (feedbackType) => {
    if (!selectedVideo) return;

    try {
      await submitVideoFeedback(selectedVideo.id, feedbackType, feedbackRemarks);
      
      setVideos(videos.map(v => 
        v.id === selectedVideo.id 
          ? { ...v, admin_feedback: feedbackType, admin_remarks: feedbackRemarks, reviewed_by_name: user.username }
          : v
      ));

      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      alert('Failed to submit feedback: ' + error.message);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const skipTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { icon: <AlertCircle size={14} />, class: 'badge-pending', text: 'Pending' },
      LIKE: { icon: <CheckCircle size={14} />, class: 'badge-approved', text: 'Approved' },
      DISLIKE: { icon: <XCircle size={14} />, class: 'badge-rejected', text: 'Rejected' }
    };
    return badges[status] || badges.PENDING;
  };

  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = filteredVideos.slice(indexOfFirstVideo, indexOfLastVideo);
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading video feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertCircle size={64} color="#e74c3c" />
        <h2>Error Loading Videos</h2>
        <p>{error}</p>
        <button onClick={fetchData} className="btn-retry">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="video-feedback-page">
      {/* Header */}
      <div className="vf-header">
        <div className="vf-header-left">
          <Video size={32} className="header-icon" />
          <div>
            <h1>Video Feedback</h1>
            <p>Review and manage user video submissions</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="vf-stats-grid">
          <div className="vf-stat-card stat-total">
            <FileVideo size={24} />
            <div className="stat-content">
              <h3>{stats.total || 0}</h3>
              <p>Total Videos</p>
            </div>
          </div>

          <div className="vf-stat-card stat-pending">
            <AlertCircle size={24} />
            <div className="stat-content">
              <h3>{stats.pending || 0}</h3>
              <p>Pending Review</p>
            </div>
          </div>

          <div className="vf-stat-card stat-approved">
            <ThumbsUp size={24} />
            <div className="stat-content">
              <h3>{stats.liked || 0}</h3>
              <p>Approved</p>
            </div>
          </div>

          <div className="vf-stat-card stat-rejected">
            <ThumbsDown size={24} />
            <div className="stat-content">
              <h3>{stats.disliked || 0}</h3>
              <p>Rejected</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="vf-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by user name or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterStatus('ALL')}
          >
            All ({videos.length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'PENDING' ? 'active' : ''}`}
            onClick={() => setFilterStatus('PENDING')}
          >
            Pending ({videos.filter(v => v.admin_feedback === 'PENDING').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'LIKE' ? 'active' : ''}`}
            onClick={() => setFilterStatus('LIKE')}
          >
            Approved ({videos.filter(v => v.admin_feedback === 'LIKE').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'DISLIKE' ? 'active' : ''}`}
            onClick={() => setFilterStatus('DISLIKE')}
          >
            Rejected ({videos.filter(v => v.admin_feedback === 'DISLIKE').length})
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="vf-grid">
        {currentVideos.length === 0 ? (
          <div className="no-videos">
            <FileVideo size={64} />
            <h3>No videos found</h3>
            <p>
              {videos.length === 0 
                ? 'No video feedback has been submitted yet.' 
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          currentVideos.map((video) => {
            const badge = getStatusBadge(video.admin_feedback);
            const videoURL = getVideoURL(video.video_file);
            
            return (
              <div key={video.id} className="video-card" onClick={() => handleVideoClick(video)}>
                <div className="video-thumbnail">
                  <video 
                    src={videoURL}
                    preload="metadata"
                    onError={(e) => {
                      console.error('❌ Video load error:', videoURL);
                      console.error('Video file path:', video.video_file);
                    }}
                  />
                  <div className="play-overlay">
                    <Play size={48} />
                  </div>
                  <span className={`status-badge ${badge.class}`}>
                    {badge.icon}
                    {badge.text}
                  </span>
                </div>

                <div className="video-info">
                  <h3>{video.title}</h3>
                  
                  <div className="video-meta">
                    <span className="meta-item">
                      <User size={14} />
                      {video.user_name}
                    </span>
                    <span className="meta-item">
                      <Calendar size={14} />
                      {new Date(video.submitted_date).toLocaleDateString()}
                    </span>
                  </div>

                  {video.file_size_mb && (
                    <div className="video-size">
                      <FileVideo size={14} />
                      {video.file_size_mb} MB
                    </div>
                  )}

                  {video.reviewed_by_name && (
                    <div className="reviewed-by">
                      Reviewed by: {video.reviewed_by_name}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>

          <div className="pagination-numbers">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Video Modal */}
      {showModal && selectedVideo && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>

            <div className="modal-content">
              <div className="video-section">
                <div className="video-player-wrapper">
                  <video
                    ref={videoRef}
                    src={getVideoURL(selectedVideo.video_file)}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    onError={(e) => {
                      console.error('❌ Modal video error:', getVideoURL(selectedVideo.video_file));
                    }}
                    className="video-player"
                  />

                  {/* Custom Controls */}
                  <div className="video-controls">
                    <div className="progress-bar">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={(currentTime / duration) * 100 || 0}
                        onChange={handleSeek}
                        className="seek-bar"
                      />
                    </div>

                    <div className="controls-row">
                      <div className="controls-left">
                        <button onClick={togglePlayPause} className="control-btn">
                          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                        <button onClick={() => skipTime(-10)} className="control-btn">
                          <SkipBack size={18} />
                        </button>
                        <button onClick={() => skipTime(10)} className="control-btn">
                          <SkipForward size={18} />
                        </button>
                        <button onClick={toggleMute} className="control-btn">
                          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        <span className="time-display">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <div className="controls-right">
                        <button 
                          onClick={() => videoRef.current?.requestFullscreen()} 
                          className="control-btn"
                        >
                          <Maximize size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="video-details">
                  <h2>{selectedVideo.title}</h2>
                  
                  <div className="detail-row">
                    <User size={18} />
                    <span><strong>Submitted by:</strong> {selectedVideo.user_name}</span>
                  </div>

                  <div className="detail-row">
                    <Calendar size={18} />
                    <span><strong>Date:</strong> {new Date(selectedVideo.submitted_date).toLocaleString()}</span>
                  </div>

                  <div className="detail-row">
                    <FileVideo size={18} />
                    <span><strong>File Size:</strong> {selectedVideo.file_size_mb} MB</span>
                  </div>

                  {selectedVideo.description && (
                    <div className="description">
                      <strong>Description:</strong>
                      <p>{selectedVideo.description}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="feedback-section">
                <h3>Admin Feedback</h3>
                
                <div className="current-status">
                  <strong>Current Status:</strong>
                  <span className={`status-badge-large ${getStatusBadge(selectedVideo.admin_feedback).class}`}>
                    {getStatusBadge(selectedVideo.admin_feedback).icon}
                    {getStatusBadge(selectedVideo.admin_feedback).text}
                  </span>
                </div>

                <div className="remarks-box">
                  <label>Remarks (Optional):</label>
                  <textarea
                    value={feedbackRemarks}
                    onChange={(e) => setFeedbackRemarks(e.target.value)}
                    placeholder="Add your review comments here..."
                    rows={4}
                  />
                </div>

                <div className="feedback-actions">
                  <button
                    className="btn-approve"
                    onClick={() => handleSubmitFeedback('LIKE')}
                  >
                    <ThumbsUp size={18} />
                    Approve Video
                  </button>

                  <button
                    className="btn-reject"
                    onClick={() => handleSubmitFeedback('DISLIKE')}
                  >
                    <ThumbsDown size={18} />
                    Reject Video
                  </button>
                </div>

                {selectedVideo.reviewed_by_name && (
                  <div className="reviewed-info">
                    <p><strong>Reviewed by:</strong> {selectedVideo.reviewed_by_name}</p>
                    {selectedVideo.reviewed_at && (
                      <p><strong>Reviewed on:</strong> {new Date(selectedVideo.reviewed_at).toLocaleString()}</p>
                    )}
                    {selectedVideo.admin_remarks && (
                      <p><strong>Previous Remarks:</strong> {selectedVideo.admin_remarks}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoFeedback;