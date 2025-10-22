import React from 'react'

interface DebugInfoProps {
  sdk: any
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ sdk }) => {
  if (process.env.NODE_ENV === 'production') {
    return null // Don't show debug info in production
  }

  const toggleRole = () => {
    if (!sdk) return
    const isOwner = sdk.isOwner()
    const newRole = isOwner ? 'member' : 'owner'
    const newPerms = isOwner
      ? ['read_content', 'write_content', 'read_analytics']
      : ['admin', 'member:stats:export', 'read_content', 'write_content', 'read_analytics']
    if (sdk.user) {
      sdk.user.role = newRole as any
      sdk.user.permissions = newPerms
    }
    // Force re-render by dispatching a custom event
    window.dispatchEvent(new CustomEvent('whop-role-changed'))
  }

  const testPermissions = (perms: string[]) => {
    if (!sdk || !sdk.user) return
    sdk.user.permissions = perms
    sdk.user.role = perms.includes('admin') || perms.includes('member:stats:export') ? 'owner' : 'member'
    window.dispatchEvent(new CustomEvent('whop-role-changed'))
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
        <button
          onClick={toggleRole}
          className="mt-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
        >
          Toggle {sdk?.isOwner() ? '→ Member' : '→ Owner'}
        </button>
        
        <div className="mt-2 space-y-1">
          <div className="text-xs text-gray-300">Test Permissions:</div>
          <button
            onClick={() => testPermissions(['read_content', 'write_content'])}
            className="block w-full px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
          >
            Basic Member
          </button>
          <button
            onClick={() => testPermissions(['read_content', 'write_content', 'read_analytics'])}
            className="block w-full px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
          >
            Member + Analytics
          </button>
          <button
            onClick={() => testPermissions(['admin'])}
            className="block w-full px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
          >
            Admin (Owner)
          </button>
        </div>
      </div>
    </div>
  )
}
