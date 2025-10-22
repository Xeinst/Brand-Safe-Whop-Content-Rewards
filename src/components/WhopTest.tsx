import React, { useEffect, useState } from 'react'

export const WhopTest: React.FC = () => {
  const [info, setInfo] = useState<any>({})

  useEffect(() => {
    const gatherInfo = () => {
      setInfo({
        url: window.location.href,
        hostname: window.location.hostname,
        isIframe: window.parent !== window,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        searchParams: Object.fromEntries(new URLSearchParams(window.location.search)),
        parentOrigin: window.parent !== window ? 'different' : 'same'
      })
    }

    gatherInfo()
    
    // Listen for messages from parent (Whop)
    const handleMessage = (event: MessageEvent) => {
      console.log('Received message from parent:', event.data)
      if (event.data && event.data.type === 'whop-user-data') {
        setInfo((prev: any) => ({ ...prev, whopData: event.data }))
      }
    }

    window.addEventListener('message', handleMessage)
    
    // Request user data from parent
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'request-user-data' }, '*')
    }

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <div className="fixed top-4 left-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2 text-yellow-400">Whop Environment Test</h3>
      <pre className="whitespace-pre-wrap text-xs">
        {JSON.stringify(info, null, 2)}
      </pre>
    </div>
  )
}
