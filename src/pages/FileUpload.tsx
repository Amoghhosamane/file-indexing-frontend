"use client";
import { useState } from "react";
import axios from "axios";

interface FileUploadProps {
  onUploadSuccess?: () => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setMessage("Authentication error. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      setMessage("");

      await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(`✅ File "${file.name}" uploaded successfully!`);
      setFile(null);
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || "❌ Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-8"> 
      
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width="36px"
          height="36px"
        >
          <path
            fill="#4285F4"
            d="M23.49 12.27c1.67 0 3.17.57 4.36 1.69l3.25-3.25C29.05 8.72 26.49 7.5 23.49 7.5c-4.82 0-8.93 2.74-10.98 6.74l3.84 2.97c1.03-2.81 3.75-4.94 7.14-4.94z"
          />
          <path
            fill="#34A853"
            d="M36.97 24.29c0-.88-.08-1.72-.22-2.53H23.49v4.78h7.57c-.33 1.78-1.32 3.29-2.79 4.3l4.31 3.34c2.52-2.33 4.39-5.75 4.39-9.89z"
          />
          <path
            fill="#FBBC05"
            d="M12.51 28.76c-.48-1.4-.75-2.9-.75-4.45s.27-3.05.75-4.45l-3.84-2.97C7.63 19.28 7 21.33 7 23.82s.63 4.54 1.67 6.93l3.84-2.97z"
          />
          <path
            fill="#EA4335"
            d="M23.49 40.15c3.18 0 5.86-1.05 7.81-2.86l-4.31-3.34c-1.2.8-2.75 1.27-4.5 1.27-3.39 0-6.11-2.13-7.14-4.94l-3.84 2.97c2.05 4 6.16 6.74 10.98 6.74z"
          />
        </svg>
        <h1 className="text-2xl font-semibold text-gray-800">
          Upload your file
        </h1>
      </div>

      {/* File Input */}
      <label
        htmlFor="fileInput"
        className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition p-6"
      >
        <div className="flex flex-col items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-blue-500 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p className="text-gray-600 font-medium text-center">
            {file ? file.name : "Click to browse or drag & drop"}
          </p>
          {file && (
            <p className="text-xs text-gray-500 mt-1">
              ({formatFileSize(file.size)})
            </p>
          )}
        </div>
        <input
          id="fileInput"
          type="file"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`mt-6 w-full py-3 rounded-md text-white font-medium transition flex items-center justify-center ${
          !file || isUploading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-[#1a73e8] hover:bg-[#155ab6]"
        }`}
      >
        {isUploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </>
        ) : (
          "Upload"
        )}
      </button>

      {/* Message */}
      {message && (
        <p
          className={`mt-4 text-center text-sm p-2 rounded-md ${
            message.includes("successfully")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}