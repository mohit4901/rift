// ============================
// FileUploader.jsx (FIXED WORKING VERSION)
// ============================

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useUpload } from "../hooks/useUpload";

export default function FileUploader() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const { uploadFile } = useUpload();

  // 🔥 IMPORTANT — direct input trigger
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.name.endsWith(".csv")) {
      setFile(dropped);
    }
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full max-w-xl mx-auto">

      {/* ================= DROP ZONE ================= */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={openFilePicker}
        className={`
          flex flex-col items-center justify-center
          border-2 border-dashed rounded-2xl
          p-8 text-center cursor-copy
          transition-all duration-300 select-none
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
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) setFile(selected);
          }}
        />

        {/* Icon */}
        <div className="text-4xl mb-3">📂</div>

        {/* Main Text */}
        <p className="text-purple-300 font-semibold">
          Click to choose CSV or Drag & Drop
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
      </motion.div>

      {/* ================= UPLOAD BUTTON ================= */}
      <motion.button
        whileHover={{ scale: file ? 1.05 : 1 }}
        whileTap={{ scale: file ? 0.96 : 1 }}
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
