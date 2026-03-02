'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { siteConfig } from '@/config/siteConfig'
import { MenuIcon, CloseIcon } from './icons'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const navBase = scrolled
    ? 'bg-white/95 backdrop-blur-md shadow-card border-b border-border-light'
    : 'bg-transparent'

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBase}`}
        role="navigation"
        aria-label="Navegacion principal"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center group shrink-0">
              {scrolled ? (
                <span className="inline-flex items-center bg-primary-500 rounded-xl px-4 py-2">
                  <Image src="/logo-segopi.png" alt="SEGOPI" width={140} height={50} className="h-11 w-auto brightness-0 invert" priority />
                </span>
              ) : (
                <Image src="/logo-segopi.png" alt="SEGOPI" width={160} height={58} className="h-14 w-auto brightness-0 invert" priority />
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {siteConfig.navigation.items.map((item) => {
                const isExternal = item.href.startsWith('http')
                const className = `px-4 py-2 rounded-lg text-body-sm font-medium transition-colors ${
                  scrolled
                    ? 'text-foreground-secondary hover:text-primary-600 hover:bg-primary-50'
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                }`
                return isExternal ? (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
                    {item.label}
                  </a>
                ) : (
                  <Link key={item.label} href={item.href} className={className}>
                    {item.label}
                  </Link>
                )
              })}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                scrolled ? 'text-foreground hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
              aria-label="Abrir menu de navegacion"
              aria-expanded={mobileOpen}
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Menu de navegacion">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-modal animate-slide-in-right flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
              <div className="flex items-center">
                <span className="inline-flex items-center bg-primary-500 rounded-lg px-2.5 py-1">
                  <Image src="/logo-segopi.png" alt="SEGOPI" width={90} height={32} className="h-7 w-auto brightness-0 invert" />
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Cerrar menu"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-4 py-4 overflow-y-auto">
              {siteConfig.navigation.items.map((item) => {
                const isExternal = item.href.startsWith('http')
                const className = "flex items-center py-3 px-3 text-body-md font-medium text-foreground hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                return isExternal ? (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={className} onClick={() => setMobileOpen(false)}>
                    {item.label}
                  </a>
                ) : (
                  <Link key={item.label} href={item.href} className={className} onClick={() => setMobileOpen(false)}>
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Spacer */}
            <div className="pb-6" />
          </div>
        </div>
      )}
    </>
  )
}
