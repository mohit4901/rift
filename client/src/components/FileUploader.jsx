// ============================
// FileUploader.jsx (CLEAN MINIMAL VERSION)
// ============================

import { useState, useRef } from "react";
import { useUpload } from "../hooks/useUpload";

export default function FileUploader() {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);
  const { uploadFile } = useUpload();

  const openPicker = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">

      {/* ================= DROP AREA ================= */}
      <div
        onClick={openPicker}
        className="
          border border-[#e5e7eb]
          rounded-xl
          px-6 py-10
          text-center
          cursor-pointer
          bg-[#fafafa]
          hover:border-[#c4b5fd]
          hover:bg-[#f5f3ff]
          transition-all
          duration-200
        "
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0])}
        />

        <div className="text-3xl mb-2">📄</div>

        <p className="text-sm font-semibold text-[#374151]">
          Click to choose CSV file
        </p>

        <p className="text-xs text-[#9ca3af] mt-1">
          Upload transaction dataset for analysis
        </p>

        {file && (
          <div className="mt-4 text-xs bg-white border rounded-lg px-3 py-2 inline-block">
            ✅ {file.name}
          </div>
        )}
      </div>

      {/* ================= SUBMIT BUTTON ================= */}
      <button
        disabled={!file}
        onClick={() => uploadFile(file)}
        className={`
          w-full mt-6
          py-3
          rounded-lg
          font-semibold
          text-sm
          transition-all
          duration-200
          ${
            file
              ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9] cursor-pointer shadow-sm"
              : "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed"
          }
        `}
      >
        Submit
      </button>
    </div>
  );
}
