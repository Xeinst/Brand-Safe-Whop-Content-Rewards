export function LoadingSpinner() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="backdrop-blur-md bg-white/10 p-8 rounded-lg border border-white/20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
        <p className="mt-4 text-gray-300">Loading Brand Safe Content Rewards...</p>
      </div>
    </div>
  )
}
