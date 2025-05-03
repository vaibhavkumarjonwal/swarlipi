'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

const UploadPage = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    setError(null);

    if (!file) {
      setError("Please select a PDF file to upload.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      const rowsRes = await fetch("http://127.0.0.1:5000/get_initial_rows", {
        method: "GET",
        credentials: "include",
      });

      const rowsData = await rowsRes.json();
      if (!rowsRes.ok) throw new Error(rowsData.error || "Failed to get initial rows");

      // Store data in localStorage or use a state management solution
      localStorage.setItem('initialRowsData', JSON.stringify(rowsData));
      
      // Navigate to initial_rows page
      router.push("/initial_rows");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-6 max-w-xl w-full bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-900">Upload Page</h2>
        <p className="mb-4 text-center text-gray-600">
          Welcome, <strong className="text-blue-900 font-bold">{"Manan Sharma"}</strong>!
        </p>

        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="w-full p-3 my-4 border-2 border-dashed border-gray-300 rounded-md bg-gray-100 text-center hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded font-semibold uppercase tracking-wide transition hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Uploading..." : "Upload PDF"}
        </button>

        {error && (
          <p className="text-red-600 mt-4 p-3 bg-red-100 border-l-4 border-red-500 rounded text-center">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default UploadPage;