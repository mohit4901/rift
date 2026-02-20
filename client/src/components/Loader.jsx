export default function Loader() {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      
      <div className="flex flex-col items-center gap-4">

        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />

        {/* Text */}
        <p className="text-sm font-semibold text-purple-700 tracking-wide">
          Processing Financial Graph...
        </p>

        <p className="text-xs text-gray-500">
          Detecting cycles · Smurfing · Shell networks
        </p>

      </div>
    </div>
  );
}
