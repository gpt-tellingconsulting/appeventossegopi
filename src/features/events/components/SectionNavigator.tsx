'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

// Admin routes where the navigator should not appear
const HIDDEN_PREFIXES = ['/events', '/dashboard', '/registrations', '/workflows', '/analytics', '/admin']

export function SectionNavigator() {
  const pathname = usePathname()
  const [isAtBottom, setIsAtBottom] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const sectionsRef = useRef<HTMLElement[]>([])

  const isAdminRoute = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))

  useEffect(() => {
    if (isAdminRoute) return

    sectionsRef.current = Array.from(
      document.querySelectorAll<HTMLElement>('section, footer')
    )

    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight

      setIsVisible(document.body.scrollHeight > windowHeight + 50)
      setIsAtBottom(scrollY + windowHeight >= document.body.scrollHeight - 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isAdminRoute])

  if (isAdminRoute) return null

  function scrollToNext() {
    if (isAtBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const scrollY = window.scrollY
    const threshold = scrollY + 80

    const nextSection = sectionsRef.current.find(
      (el) => el.getBoundingClientRect().top + window.scrollY > threshold + 10
    )

    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }
  }

  return (
    <button
      onClick={scrollToNext}
      aria-label={isAtBottom ? 'Volver arriba' : 'Siguiente seccion'}
      className={`fixed right-4 sm:right-6 bottom-6 z-50 w-12 h-12 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 active:scale-95 transition-all duration-300 flex items-center justify-center ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <svg
        className={`w-6 h-6 transition-transform duration-300 ${isAtBottom ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}
