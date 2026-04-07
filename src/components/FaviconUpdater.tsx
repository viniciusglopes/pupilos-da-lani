'use client'

import { useEffect } from 'react'

export default function FaviconUpdater() {
  useEffect(() => {
    fetch('/api/config/site')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const faviconUrl = data?.config?.favicon_url
        if (!faviconUrl) return

        let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
        if (!link) {
          link = document.createElement('link')
          link.rel = 'icon'
          document.head.appendChild(link)
        }
        link.href = faviconUrl
      })
      .catch(() => {})
  }, [])

  return null
}
