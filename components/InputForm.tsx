
import React, { useState, useEffect } from 'react';
import { InputData } from '../types';

interface InputFormProps {
  onSubmit: (data: InputData) => void;
  onShowSample: () => void;
  isLoading: boolean;
  contentId: string;
}

const platforms = ['TikTok', 'Instagram', 'YouTube Shorts'];
const videoOrigins = ['AI-Generated', 'Real-Footage', 'Unknown'] as const;

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const InputForm: React.FC<InputFormProps> = ({ onSubmit, onShowSample, isLoading, contentId }) => {
  const [localContentId, setLocalContentId] = useState(contentId);
  const [viewCount, setViewCount] = useState('');
  const [likeCount, setLikeCount] = useState('');
  const [commentCount, setCommentCount] = useState('');
  const [shareCount, setShareCount] = useState('');
  const [platform, setPlatform] = useState('TikTok');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [topComments, setTopComments] = useState<string[]>(['']);
  const [sourceUrl, setSourceUrl] = useState('');
  const [uploadDate, setUploadDate] = useState('');
  const [parentId, setParentId] = useState('');
  const [originalSoundId, setOriginalSoundId] = useState('');
  const [originalSoundTitle, setOriginalSoundTitle] = useState('');
  const [videoOrigin, setVideoOrigin] = useState<'AI-Generated' | 'Real-Footage' | 'Unknown'>('Unknown');

  
  useEffect(() => {
    setLocalContentId(contentId);
  }, [contentId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
    } else {
      setVideoFile(null);
    }
  };

  const handleCommentChange = (index: number, value: string) => {
    const newComments = [...topComments];
    newComments[index] = value;
    setTopComments(newComments);
  };

  const handleAddComment = () => {
    if (topComments.length < 5) {
      setTopComments([...topComments, '']);
    }
  };

  const handleRemoveComment = (index: number) => {
    if (topComments.length > 1) {
        setTopComments(topComments.filter((_, i) => i !== index));
    } else {
        setTopComments(['']); // Keep one empty field if last one is removed
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
        alert("Please select a video file to analyze.");
        return;
    }
    if (!viewCount) {
        alert("Please enter the view count.");
        return;
    }
    if (!likeCount) {
        alert("Please enter the like count.");
        return;
    }
    if (!commentCount) {
        alert("Please enter the comment count.");
        return;
    }
    if (!shareCount) {
        alert("Please enter the share count.");
        return;
    }
     if (!sourceUrl) {
        alert("Please enter the source URL.");
        return;
    }
    if (!uploadDate) {
        alert("Please select the upload date and time.");
        return;
    }
    const formattedComments = topComments
        .map(c => c.trim())
        .filter(c => c)
        .map((comment, index) => `${index + 1}. "${comment}"`)
        .join('\n');

    onSubmit({ 
        contentId: localContentId,
        parentId: parentId.trim() || null,
        platform, 
        videoFile, 
        topComments: formattedComments,
        viewCount: parseInt(viewCount, 10),
        likeCount: parseInt(likeCount, 10),
        commentCount: parseInt(commentCount, 10),
        shareCount: parseInt(shareCount, 10),
        sourceUrl: sourceUrl,
        uploadDate: new Date(uploadDate).toISOString(),
        originalSoundId: originalSoundId.trim() || undefined,
        originalSoundTitle: originalSoundTitle.trim() || undefined,
        videoOrigin: videoOrigin,
    });
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 shadow-2xl border border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-cyan-400">Video Input</h2>
        
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="contentId" className="block text-sm font-medium text-gray-300 mb-1">Content ID</label>
                    <input
                    type="text"
                    id="contentId"
                    value={localContentId}
                    onChange={(e) => setLocalContentId(e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="e.g., C000001"
                    required
                    />
                </div>
                 <div>
                    <label htmlFor="parentId" className="block text-sm font-medium text-gray-300 mb-1">Parent ID <span className="text-gray-400">(Optional)</span></label>
                    <input
                    type="text"
                    id="parentId"
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Original video's ID"
                    />
                </div>
            </div>
             <div>
                <label htmlFor="sourceUrl" className="block text-sm font-medium text-gray-300 mb-1">Source URL</label>
                <input
                    type="url"
                    id="sourceUrl"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="https://www.tiktok.com/@user/video/..."
                    required
                />
            </div>
            <div>
                <label htmlFor="uploadDate" className="block text-sm font-medium text-gray-300 mb-1">Upload Date & Time</label>
                <input
                type="datetime-local"
                id="uploadDate"
                value={uploadDate}
                onChange={(e) => setUploadDate(e.target.value)}
                className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="viewCount" className="block text-sm font-medium text-gray-300 mb-1">View Count</label>
                    <input
                    type="number"
                    id="viewCount"
                    value={viewCount}
                    onChange={(e) => setViewCount(e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="e.g., 1.2M"
                    required
                    />
                </div>
                 <div>
                    <label htmlFor="likeCount" className="block text-sm font-medium text-gray-300 mb-1">Like Count</label>
                    <input
                    type="number"
                    id="likeCount"
                    value={likeCount}
                    onChange={(e) => setLikeCount(e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="e.g., 150K"
                    required
                    />
                </div>
                 <div>
                    <label htmlFor="commentCount" className="block text-sm font-medium text-gray-300 mb-1">Comment Count</label>
                    <input
                    type="number"
                    id="commentCount"
                    value={commentCount}
                    onChange={(e) => setCommentCount(e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="e.g., 4.5K"
                    required
                    />
                </div>
                <div>
                    <label htmlFor="shareCount" className="block text-sm font-medium text-gray-300 mb-1">Share Count</label>
                    <input
                    type="number"
                    id="shareCount"
                    value={shareCount}
                    onChange={(e) => setShareCount(e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="e.g., 12K"
                    required
                    />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="originalSoundId" className="block text-sm font-medium text-gray-300 mb-1">Original Sound ID <span className="text-gray-400">(Optional)</span></label>
                    <input
                    type="text"
                    id="originalSoundId"
                    value={originalSoundId}
                    onChange={(e) => setOriginalSoundId(e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="e.g., 7522047981961366800"
                    />
                </div>
                <div>
                    <label htmlFor="originalSoundTitle" className="block text-sm font-medium text-gray-300 mb-1">Original Sound Title <span className="text-gray-400">(Optional)</span></label>
                    <input
                    type="text"
                    id="originalSoundTitle"
                    value={originalSoundTitle}
                    onChange={(e) => setOriginalSoundTitle(e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="e.g., Original Sound - Artist"
                    />
                </div>
            </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Platform</label>
          <div className="flex space-x-2 rounded-md bg-gray-700 p-1">
              {platforms.map((p) => (
                  <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                          platform === p ? 'bg-cyan-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600/50'
                      }`}
                  >
                      {p}
                  </button>
              ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Video Origin</label>
          <div className="flex space-x-2 rounded-md bg-gray-700 p-1">
              {videoOrigins.map((origin) => (
                  <button
                      key={origin}
                      type="button"
                      onClick={() => setVideoOrigin(origin)}
                      className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                          videoOrigin === origin ? 'bg-cyan-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600/50'
                      }`}
                  >
                      {origin}
                  </button>
              ))}
          </div>
        </div>

        <div>
          <label htmlFor="videoFile" className="block text-sm font-medium text-gray-300 mb-1">
            Video File
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-400">
                <label htmlFor="videoFile" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-cyan-400 hover:text-cyan-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-cyan-500">
                  <span>Upload a file</span>
                  <input id="videoFile" name="videoFile" type="file" className="sr-only" accept="video/*" onChange={handleFileChange} required />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                {videoFile ? videoFile.name : 'MP4, MOV, AVI, etc.'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Top Comments (up to 5)</label>
          <div className="space-y-3">
              {topComments.map((comment, index) => (
                  <div key={index} className="flex items-center gap-2">
                      <input
                          type="text"
                          value={comment}
                          onChange={(e) => handleCommentChange(index, e.target.value)}
                          className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                          placeholder={`Comment #${index + 1}`}
                      />
                      <button
                          type="button"
                          onClick={() => handleRemoveComment(index)}
                          className="p-2 text-gray-400 hover:text-white bg-gray-600 hover:bg-red-500 rounded-full transition-colors"
                          aria-label="Remove comment"
                      >
                         <XIcon className="w-4 h-4" />
                      </button>
                  </div>
              ))}
          </div>
          {topComments.length < 5 && (
            <button
                type="button"
                onClick={handleAddComment}
                className="mt-3 text-sm font-medium text-cyan-400 hover:text-cyan-300 disabled:text-gray-500"
                disabled={topComments.length >= 5}
            >
                + Add Comment
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Video DNA'}
          </button>
           <button
            type="button"
            onClick={onShowSample}
            disabled={isLoading}
            className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md shadow-sm text-cyan-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            Show Sample Result
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputForm;