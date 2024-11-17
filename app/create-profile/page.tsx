"use client";

import { useState, useEffect } from "react";
import { pinata, getFileUrl } from "@/lib/config";
import FilesList from "@/components/FilesList";
import mammoth from "mammoth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function PublicFiles() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [groupId, setGroupId] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [documentContent, setDocumentContent] = useState<string>("");
  const [profileData, setProfileData] = useState<string>("");
  // Profile data loading state
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  useEffect(() => {
    const initializeGroup = async () => {
      try {
        const response = await fetch("/api/init-create-group");
        if (!response.ok) {
          throw new Error("Failed to initialize group");
        }
        const group = await response.json();
        setGroupId(group.id);
      } catch (err) {
        console.error(err);
        setError("Failed to initialize group");
      }
    };

    initializeGroup();
  }, []);

  const uploadFile = async () => {
    if (!file || !groupId) {
      alert("No file selected or group not initialized");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const keyRequest = await fetch("/api/key");
      const keyData = await keyRequest.json();
      const upload = await pinata.upload
        .file(file)
        .group(groupId)
        .key(keyData.JWT);

      console.log("upload", upload);
      const publicUrl = getFileUrl(upload.cid);
      console.log("publicUrl", publicUrl);
      setUrl(publicUrl);
      setUploading(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setError("Failed to upload file");
      setUploading(false);
    }
  };

  const previewDocument = async (file: File) => {
    try {
      const reader = new FileReader();

      if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // Handle DOCX files with mammoth
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setDocumentContent(result.value);
        // Add to local storage in array
        const files = localStorage.getItem("files") || "[]";
        const filesArray = JSON.parse(files);
        filesArray.push({
          name: file.name,
          text: result.value,
        });
        console.log("filesArray", filesArray);
        localStorage.setItem("files", JSON.stringify(filesArray));
      } else {
        // Handle other text files
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setDocumentContent(content);
        };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error("Error previewing document:", err);
      setError("Failed to preview document");
    }
  };

  const handleGenerateProfile = async () => {
    try {
      setProfileLoading(true);
      const filesData = localStorage.getItem("files");
      if (!filesData) {
        toast({
          title: "No Files",
          description: "No files found in local storage to generate profile.",
          variant: "destructive",
        });
        return;
      }

      const url =
        "https://magicloops.dev/api/loop/0cc2481a-a849-48e1-86e1-912a730abe6f/run";
      const apiResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: filesData,
      });

      const profileData = await apiResponse.json();
      console.log("Profile generated:", profileData);

      // Update state
      setProfileData(profileData);

      toast({
        title: "Profile Generated",
        description: "Profile has been generated successfully.",
      });
      setProfileLoading(false);
    } catch (error) {
      console.error("Error generating profile:", error);
      toast({
        title: "Error",
        description: "Failed to generate profile. Please try again.",
        variant: "destructive",
      });
      setProfileLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target?.files?.[0] || null;
    setFile(selectedFile);

    if (
      selectedFile?.type === "text/plain" ||
      selectedFile?.type === "application/pdf" ||
      selectedFile?.type === "application/msword" ||
      selectedFile?.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      previewDocument(selectedFile);
    } else {
      setDocumentContent("");
    }
  };

  const renderContent = () => {
    if (!url) return null;

    const fileType = file?.type || "";

    if (
      fileType === "text/plain" ||
      fileType === "application/pdf" ||
      fileType === "application/msword" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return (
        <div className="flex gap-4 w-full">
          <div className="flex-1">
            <a href={url}>Download Document</a>
          </div>
          <div className="flex-1">
            <textarea
              value={documentContent}
              readOnly
              className="w-full h-48 p-2 border rounded-md"
              placeholder="Document preview"
            />
          </div>
        </div>
      );
    }

    if (fileType.startsWith("image/")) {
      return (
        <img src={url} alt="Uploaded content" className="max-w-full h-auto" />
      );
    }
    if (fileType.startsWith("video/")) {
      return <video src={url} controls className="max-w-full" />;
    }
    if (fileType.startsWith("audio/")) {
      return (
        <div className="w-full max-w-md">
          <audio src={url} controls className="w-full" />
          <p className="mt-2 text-sm text-gray-500 text-center">
            {file?.name} ({((file?.size ?? 0) / (1024 * 1024)).toFixed(2)} MB)
          </p>
        </div>
      );
    }
    return <a href={url}>Download File</a>;
  };

  return (
    <main className="w-full min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Profile File Upload
        </h1>

        <div className="space-y-6">
          {/* File Input Section */}
          <div className="flex flex-col items-center p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
            <div className="w-full">
              <input
                type="file"
                onChange={handleChange}
                className="w-full text-sm text-gray-500 
                  file:mr-4 file:py-2 file:px-4 
                  file:rounded-full file:border-0 
                  file:text-sm file:font-semibold 
                  file:bg-blue-50 file:text-blue-700 
                  hover:file:bg-blue-100 
                  file:cursor-pointer
                  sm:file:mr-5 sm:file:py-2.5 sm:file:px-6
                  focus:outline-none"
              />
            </div>
            {file && (
              <p className="mt-2 text-xs sm:text-sm text-gray-500 truncate w-full text-center">
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* Upload Button */}
          <button
            disabled={uploading || !file}
            onClick={uploadFile}
            className={`w-full py-2 px-4 rounded-md text-white font-medium
              ${
                !file
                  ? "bg-gray-300 cursor-not-allowed"
                  : uploading
                  ? "bg-blue-400 cursor-wait"
                  : "bg-blue-600 hover:bg-blue-700"
              } transition-colors`}
          >
            {uploading ? "Uploading..." : "Upload via Pinata"}
          </button>

          {/* Preview Section */}
          {url && (
            <div className="mt-8 border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Preview
              </h2>
              <div className="flex justify-center">{renderContent()}</div>
              <div className="mt-4 text-center">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  View on Pinata
                </a>
              </div>
            </div>
          )}

          {/* Files List Section */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Profile Files
            </h2>
            <FilesList groupId={groupId} key={refreshTrigger} />
          </div>

          {/* Generate Profile Button */}
          <div className="flex justify-end mt-6">
            <Button onClick={handleGenerateProfile} disabled={profileLoading}>
              {profileLoading ? "Generating..." : "Generate Profile"}
              {/* Add spinner if loading */}
              {profileLoading && (
                <span className="ml-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </span>
              )}
            </Button>
          </div>

          {/* Display the document content for file list */}
          {profileData && (
            <div className="mt-8 border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Profile Data
              </h2>
              {/* Use markdown to display the profile data with react-markdown and remark-gfm */}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {profileData}
              </ReactMarkdown>
            </div>
          )}

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>
    </main>
  );
}
