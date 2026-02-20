// ============================
// FileUploader.jsx (UPGRADED UI)
// ============================

import { useState } from "react";
import { motion } from "framer-motion";
import { useUpload } from "../hooks/useUpload";

export default function FileUploader() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const { uploadFile } = useUpload();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  return (
    <div className="w-full max-w-xl mx-auto">

      {/* ================= DROP ZONE ================= */}
      <motion.label
        whileHover={{ scale: 1.02 }}
        className={`
          flex flex-col items-center justify-center
          border-2 border-dashed rounded-2xl
          p-8 text-center cursor-copy
          transition-all duration-300
          ${dragging
            ? "border-purple-500 bg-purple-900/20"
            : "border-purple-700 bg-[#060012]"
          }
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {/* Hidden Input */}
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />

        {/* Icon */}
        <div className="text-4xl mb-3 select-none">📂</div>

        {/* Main Text */}
        <p className="text-purple-300 font-semibold">
          Choose CSV file or Drag & Drop here
        </p>

        <p className="text-xs text-purple-400 mt-1">
          Upload transaction dataset for graph analysis
        </p>

        {/* File Preview */}
        {file && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 px-4 py-2 bg-black/40 rounded-lg text-sm border border-purple-700"
          >
            ✅ {file.name}
          </motion.div>
        )}
      </motion.label>

      {/* ================= UPLOAD BUTTON ================= */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        disabled={!file}
        className={`
          w-full mt-6 py-3 rounded-xl font-semibold tracking-wide
          transition-all duration-300
          ${file
            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white cursor-pointer shadow-lg shadow-purple-500/30"
            : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }
        `}
        onClick={() => uploadFile(file)}
      >
        🚀 Analyze Financial Graph
      </motion.button>
    </div>
  );
}
