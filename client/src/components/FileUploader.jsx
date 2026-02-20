// ============================
// FileUploader.jsx
// ============================

import { useState } from "react";
import { useUpload } from "../hooks/useUpload";

export default function FileUploader() {
  const [file, setFile] = useState(null);
  const { uploadFile } = useUpload();

  return (
    <div className="p-6 border border-[rgba(0,0,0,0.08)] rounded-2xl bg-[#f9fafb]">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        className="bg-[#1f4d2e] text-white px-5 py-2 mt-4 rounded-full text-sm shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
        onClick={() => uploadFile(file)}
      >
        Upload CSV
      </button>
    </div>
  );
}
