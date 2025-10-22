export function LoadingSpinner() {

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Brand Safe Content Rewards...</p>
      </div>
    </div>
  )
}
