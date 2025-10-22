import React from 'react'

interface DebugInfoProps {
  sdk: any
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ sdk }) => {
  if (process.env.NODE_ENV === 'production') {
    return null // Don't show debug info in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>User: {sdk?.user?.display_name || 'Unknown'}</div>
        <div>Role: {sdk?.user?.role || 'Unknown'}</div>
        <div>Is Owner: {sdk?.isOwner() ? 'Yes' : 'No'}</div>
        <div>Is Member: {sdk?.isMember() ? 'Yes' : 'No'}</div>
        <div>URL: {window.location.href}</div>
        <div>Parent: {window.parent !== window ? 'In iframe' : 'Not in iframe'}</div>
        <div>Referrer: {document.referrer || 'None'}</div>
      </div>
    </div>
  )
}
