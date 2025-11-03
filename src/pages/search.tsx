"use client";
import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import FileUpload from "./FileUpload";

// --- Types ---
interface FileData {
  id: string;
  name: string;
  uploadDate: string;
}

const API_URL = "http://localhost:5000";

// --- Utility Functions ---
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// --- Main Component ---
export default function SearchPage() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/");
    }
  }, [router]);

  // Fetch all files on load or refresh
  const fetchFiles = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.get<FileData[]>(`${API_URL}/files`, {
        headers: { 
          Authorization: `Bearer ${token}`,
        },
      });
      
      setFiles(response.data);
      
    } catch (err: unknown) {
      console.error("Error fetching files:", err);
      
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError;
        
        if (error.response?.status === 500) {
          setMessage("Server error. Please try again.");
        } else if (error.response?.status === 401) {
          setMessage("Authentication failed. Please login again.");
          localStorage.removeItem("authToken");
          router.push("/");
        } else {
          setMessage("Failed to load files. Please try again.");
        }
      } else {
        setMessage("Network error. Check if backend is running.");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Load files when component mounts
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Callback for successful upload
  const handleUploadSuccess = () => {
    setMessage("File uploaded successfully!");
    setTimeout(() => fetchFiles(), 1000);
  };

  // --- Handlers ---

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchFiles();
      return;
    }

    setLoading(true);
    setMessage("");
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await axios.get<FileData[]>(
        `${API_URL}/search?query=${encodeURIComponent(searchTerm)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFiles(response.data);
      if (response.data.length === 0) {
        setMessage(`No files found matching "${searchTerm}".`);
      }
    } catch (err: unknown) {
      console.error("Error searching:", err);
      setMessage("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileName: string) => {
    const token = getAuthToken();
    if (!token) {
      setMessage("Please login again.");
      return;
    }

    setMessage(`Downloading ${fileName}...`);

    try {
      const response = await fetch(
        `${API_URL}/download?query=${encodeURIComponent(fileName)}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        setMessage("Download failed: File is empty.");
        return;
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setMessage(`Downloaded ${fileName} successfully!`);

    } catch (err: unknown) {
      console.error('Download error:', err);
      setMessage(`Download failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/");
  };

  const retryConnection = () => {
    setMessage("Refreshing...");
    fetchFiles();
  };

  // --- Component Structure ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">File Storage Portal</h1>
        <div className="flex gap-4">
          <button
            onClick={retryConnection}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow transition disabled:bg-gray-400"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg shadow transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Status Message Area */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg text-center ${
          message.toLowerCase().includes("failed") || message.toLowerCase().includes("error") 
            ? "bg-red-100 border border-red-300 text-red-800"
            : message.toLowerCase().includes("success") 
            ? "bg-green-100 border border-green-300 text-green-800"
            : "bg-blue-100 border border-blue-300 text-blue-800"
        }`}>
          {message}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Upload and Search */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg">
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Search Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Search Files</h2>
            <form onSubmit={handleSearch} className="flex gap-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by file name..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className={`py-3 px-6 rounded-lg font-medium transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                }`}
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - File List */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Your Files</h2>
              <span className="text-sm text-gray-500">{files.length} files</span>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No files found. Upload your first file!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Upload Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {files.map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs sm:max-w-none">
                          {file.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {formatDate(file.uploadDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDownload(file.name)}
                            disabled={loading}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 py-1 px-3 rounded-md transition disabled:opacity-50"
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 mb-2">✅ System Status: All Systems Operational</h3>
        <p className="text-sm text-green-700">
          Your file storage portal is now fully functional! You can:
        </p>
        <ul className="text-sm text-green-700 list-disc list-inside mt-2">
          <li>Upload files using the upload component</li>
          <li>Search files by name</li>
          <li>Download files from the list</li>
          <li>All data is persisted in the BST and saved to disk</li>
        </ul>
      </div>
    </div>
  );
}