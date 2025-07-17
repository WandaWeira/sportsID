import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Camera, Video, Hash, X, Play, Trash2 } from "lucide-react";
import { useCreatePostMutation } from "../../store/api/apiSlice";
import type { RootState } from "../../store";
import type { MediaFile } from "../../store/api/apiSlice";

const ROLE_TAGS = {
  player: ["#training", "#match", "#goals", "#skills", "#teamwork"],
  scout: ["#scouting", "#talent", "#report", "#recommendation", "#signing"],
  coach: [
    "#coaching",
    "#tactics",
    "#teammanagement",
    "#strategy",
    "#leadership",
  ],
  club: ["#clubnews", "#recruitment", "#trials", "#achievements", "#community"],
};

export const CreatePost: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [createPost, { isLoading }] = useCreatePostMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const availableTags = ROLE_TAGS[user.role as keyof typeof ROLE_TAGS] || [];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleFileUpload = (
    files: FileList | null,
    type: "image" | "video"
  ) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Validate file size (max 10MB for images, 50MB for videos)
      const maxSize = type === "image" ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(
          `File too large. Maximum size is ${
            type === "image" ? "10MB" : "50MB"
          }`
        );
        return;
      }

      // Validate file type
      const validTypes =
        type === "image"
          ? ["image/jpeg", "image/png", "image/gif", "image/webp"]
          : ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

      if (!validTypes.includes(file.type)) {
        alert(
          `Invalid file type. Please upload ${
            type === "image"
              ? "JPEG, PNG, GIF, or WebP"
              : "MP4, WebM, OGG, or MOV"
          } files.`
        );
        return;
      }

      // Limit total number of files
      if (mediaFiles.length >= 4) {
        alert("Maximum 4 files allowed per post");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const mediaFile: MediaFile = {
          id: `temp_${Date.now()}_${Math.random()}`,
          type,
          url: e.target?.result as string,
          thumbnail: type === "video" ? "" : undefined,
          filename: file.name,
          size: file.size,
        };

        setMediaFiles((prev) => [...prev, mediaFile]);
      };
      reader.onerror = () => {
        alert("Error reading file. Please try again.");
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMediaFile = (id: string) => {
    setMediaFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleVideoClick = () => {
    videoInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) return;

    try {
      await createPost({
        authorId: user.id,
        authorName: user.name,
        authorRole: user.role,
        content,
        tags: selectedTags,
        media: mediaFiles,
      }).unwrap();

      setContent("");
      setSelectedTags([]);
      setMediaFiles([]);
      setIsExpanded(false);
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3">
          {/* User avatar */}
          <div className="flex-shrink-0">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Post content */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder={
                user.role === "player"
                  ? "Share your latest training or match highlights..."
                  : user.role === "scout"
                  ? "Share your latest scouting insights..."
                  : user.role === "coach"
                  ? "Share team updates or coaching insights..."
                  : "What's happening at your club?"
              }
              className="w-full resize-none border-0 p-0 focus:ring-0 placeholder-gray-500 text-gray-900"
              rows={isExpanded ? 4 : 2}
            />

            {/* Tags section */}
            {isExpanded && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add tags (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedTags.includes(tag)
                            ? "bg-sport-100 text-sport-700 border border-sport-300"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <Hash className="w-3 h-3 mr-1" />
                        {tag.substring(1)}
                        {selectedTags.includes(tag) && (
                          <X className="w-3 h-3 ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Media preview */}
                {mediaFiles.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Media ({mediaFiles.length}/4)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {mediaFiles.map((file) => (
                        <div key={file.id} className="relative group">
                          <div className="relative overflow-hidden rounded-lg bg-gray-100">
                            {file.type === "image" ? (
                              <img
                                src={file.url}
                                alt="Upload preview"
                                className="w-full h-32 object-cover"
                              />
                            ) : (
                              <div className="w-full h-32 bg-gray-800 flex items-center justify-center relative">
                                <video
                                  src={file.url}
                                  className="w-full h-full object-cover"
                                  controls={false}
                                  muted
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                  <Play className="w-8 h-8 text-white" />
                                </div>
                              </div>
                            )}

                            {/* File info overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-2">
                              <div className="truncate">{file.filename}</div>
                              <div>{formatFileSize(file.size)}</div>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeMediaFile(file.id)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Media upload buttons */}
                <div className="flex items-center space-x-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files, "image")}
                    className="hidden"
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files, "video")}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handlePhotoClick}
                    disabled={mediaFiles.length >= 4}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      mediaFiles.length >= 4
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span className="text-sm">Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleVideoClick}
                    disabled={mediaFiles.length >= 4}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      mediaFiles.length >= 4
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span className="text-sm">Video</span>
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    {content.length}/500 characters
                    {mediaFiles.length > 0 && (
                      <span className="ml-2">
                        • {mediaFiles.length} file
                        {mediaFiles.length !== 1 ? "s" : ""} (
                        {formatFileSize(
                          mediaFiles.reduce(
                            (total, file) => total + file.size,
                            0
                          )
                        )}
                        )
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExpanded(false);
                        setContent("");
                        setSelectedTags([]);
                        setMediaFiles([]);
                      }}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        (!content.trim() && mediaFiles.length === 0) ||
                        isLoading
                      }
                      className="px-4 py-2 bg-sport-600 text-white rounded-md hover:bg-sport-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
