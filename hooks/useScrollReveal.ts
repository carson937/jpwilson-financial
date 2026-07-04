'use client'

import { useEffect } from 'react'

export function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]')

    // Safety net: if observer never fires (hydration failure, old browser, etc.)
    // reveal everything after 2s so content is never permanently invisible
    const fallback = setTimeout(() => {
      elements.forEach((el) => {
        if (!el.classList.contains('revealed')) {
          el.classList.add('revealed')
        }
      })
    }, 2000)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            const delay = el.dataset.delay ?? '0'
            el.style.transitionDelay = `${parseInt(delay) * 80}ms`
            el.classList.add('revealed')
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px 0px 0px' }
    )

    elements.forEach((el) => observer.observe(el))
    return () => {
      clearTimeout(fallback)
      observer.disconnect()
    }
  }, [])
}
