const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div
      className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"
    />
    <span className="text-sm text-gray-400 font-medium">Loading...</span>
  </div>
);

export default LoadingSpinner;
