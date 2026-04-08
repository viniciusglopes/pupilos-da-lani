'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface FooterContent {
  id: string
  section_key: string
  title: string
  content?: string
  link_url?: string
  display_order: number
}

export default function Footer() {
  const [footerContent, setFooterContent] = useState<FooterContent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFooterContent()
  }, [])

  const loadFooterContent = async () => {
    try {
      const res = await fetch('/api/footer')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setFooterContent(data.data)
        }
      }
    } catch (err) {
      console.warn('Failed to load footer content:', err)
    } finally {
      setLoading(false)
    }
  }

  // Helper to get content by section key
  const getContent = (key: string) => {
    return footerContent.find(item => item.section_key === key)
  }

  const aboutContent = getContent('about')
  const contactContent = getContent('contact')
  const privacyContent = getContent('privacy')
  const instagramContent = getContent('social_instagram')
  const whatsappContent = getContent('social_whatsapp')
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About Section */}
          <div>
            {aboutContent?.title !== undefined && (
              <h3 className="text-lg font-bold tracking-tight uppercase mb-4">
                {aboutContent.title}
              </h3>
            )}
            {aboutContent?.content !== undefined && (
              <p className="text-gray-400 text-sm leading-relaxed">
                {aboutContent.content}
              </p>
            )}
          </div>

          {/* Navigation Section */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-4">Navegação</h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Início' },
                { href: '/pupilos', label: 'Talentos' },
                ...(privacyContent ? [{ href: privacyContent.link_url || '/privacidade', label: privacyContent.title || 'Privacidade' }] : []),
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            {contactContent?.title !== undefined && (
              <h4 className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-4">
                {contactContent.title}
              </h4>
            )}
            <div className="space-y-3 text-sm text-gray-400">
              {contactContent?.content !== undefined && (
                <p>{contactContent.content}</p>
              )}
              
              {/* Social Links */}
              <div className="flex flex-col gap-2 mt-4">
                {instagramContent?.link_url && (
                  <a 
                    href={instagramContent.link_url}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {instagramContent.title}
                  </a>
                )}
                
                {whatsappContent?.link_url && (
                  <a 
                    href={whatsappContent.link_url}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {whatsappContent.title}
                  </a>
                )}
                
                {contactContent?.link_url && (
                  <a 
                    href={contactContent.link_url}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-xs tracking-wide">
            © 2026 Pupilos da Lani. Todos os direitos reservados.
          </p>
          <p className="text-gray-700 text-xs mt-2 md:mt-0">
            LGPD Compliance
          </p>
        </div>
      </div>
    </footer>
  )
}
