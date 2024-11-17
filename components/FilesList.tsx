// Import necessary libraries and hooks
import { useState, useEffect } from "react";
import { getFileUrl } from "@/lib/config";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

interface FileListItem {
  id: string;
  name: string;
  cid: string;
  size: number;
  mime_type: string;
  created_at: string;
  // content?: string;
}

interface FilesListProps {
  groupId?: string;
}

export default function FilesList({ groupId }: FilesListProps) {
  const [files, setFiles] = useState<FileListItem[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  // const [previewContent, setPreviewContent] = useState<string>("");
  // const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const url = groupId ? `/api/files?groupId=${groupId}` : "/api/files";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }
      const data = await response.json();
      setFiles(data.data.files);
    } catch (e) {
      console.error(e);
      setError("Error fetching files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [groupId]);

  const handleDelete = async (fileId: string) => {
    try {
      setDeleting(fileId);

      const response = await fetch(`/api/delete-file`, {
        method: "POST",
        body: JSON.stringify({ fileId: fileId }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete file");
      }
      setFiles(files.filter((file) => file.id !== fileId));

      // get the name of the file to delete
      const fileToDelete = files.find((file) => file.id === fileId)?.name;
      // Remove from local storage
      const localFiles = localStorage.getItem("files") || "[]";
      const localFilesArray = JSON.parse(localFiles);
      // Find the file based on the id
      const fileIndex = localFilesArray.findIndex(
        (file: FileListItem) => file.name === fileToDelete
      );
      if (fileIndex !== -1) {
        localFilesArray.splice(fileIndex, 1);
      }
      console.log("localFilesArray", localFilesArray);
      localStorage.setItem("files", JSON.stringify(localFilesArray));
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  // const previewFile = async (file: FileListItem) => {
  //   try {
  //     const response = await fetch(`/api/fetch-file`, {
  //       method: "POST",
  //       body: JSON.stringify({ cid: file.cid }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch file");
  //     }

  //     if (
  //       file.mime_type ===
  //       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  //     ) {
  //       const arrayBuffer = await response.arrayBuffer();
  //       const result = await mammoth.extractRawText({ arrayBuffer });
  //       setPreviewContent(result.value);
  //     } else if (file.mime_type.startsWith("text/")) {
  //       const text = await response.text();
  //       setPreviewContent(text);
  //     } else if (file.mime_type.startsWith("application/pdf")) {
  //       setPreviewContent(
  //         "PDF preview not available - please download to view"
  //       );
  //     } else {
  //       setPreviewContent("Preview not available for this file type");
  //     }

  //     setSelectedFileId(file.id);
  //   } catch (err) {
  //     console.error("Error previewing file:", err);
  //     toast({
  //       title: "Error",
  //       description: "Failed to preview file",
  //       variant: "destructive",
  //     });
  //   }
  // };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-sm mb-4">{error}</p>;
  }

  return (
    <div className="space-y-4">
      {files.length === 0 && !error && (
        <p className="text-gray-500">No files uploaded yet.</p>
      )}
      {files.map((file) => (
        <div key={file.id} className="p-4 border rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium max-w-[200px] truncate sm:max-w-none sm:truncate-none">
                {file.name || "Unnamed File"}
              </p>
              <p className="text-sm text-gray-500 max-w-[200px] truncate sm:max-w-none sm:truncate-none">
                CID: {file.cid}
              </p>
              <p className="text-sm text-gray-500 max-w-[200px] truncate sm:max-w-none sm:truncate-none">
                Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <p className="text-sm text-gray-500 max-w-[200px] truncate sm:max-w-none sm:truncate-none">
                Uploaded At: {new Date(file.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* <button
                onClick={() => previewFile(file)}
                className="text-blue-600 hover:text-blue-800"
              >
                Preview
              </button> */}
              <a
                href={getFileUrl(file.cid)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                View File
              </a>
              <button
                onClick={() => handleDelete(file.id)}
                disabled={deleting === file.id}
                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                aria-label="Delete file"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preview Section */}
          {/* {selectedFileId === file.id && previewContent && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Preview:</h3>
              <textarea
                value={previewContent}
                readOnly
                className="w-full h-48 p-2 border rounded-md bg-gray-50"
                placeholder="File preview"
              />
            </div>
          )} */}
        </div>
      ))}
    </div>
  );
}
