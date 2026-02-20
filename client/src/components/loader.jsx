import { motion } from "framer-motion";

export default function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050010]/90 backdrop-blur-lg z-50">
      
      <div className="flex flex-col items-center gap-6">

        {/* 🔥 Animated Ring Loader */}
        <div className="relative w-20 h-20">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-purple-600"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: "linear",
            }}
          />

          <motion.div
            className="absolute inset-2 rounded-full border-4 border-pink-500"
            animate={{ rotate: -360 }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: "linear",
            }}
          />
        </div>

        {/* 🔥 Text */}
        <motion.div
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
          className="text-purple-300 text-sm tracking-wider"
        >
          Analyzing Financial Graph...
        </motion.div>

      </div>
    </div>
  );
}
