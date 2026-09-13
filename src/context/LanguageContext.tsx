'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { defaultLocale, languages, type Locale } from '@/lib/i18n'

type Messages = Record<string, any>

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  messages: Messages
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [messages, setMessages] = useState<Messages>({})

  // Load saved language + messages
  useEffect(() => {
    const saved = (localStorage.getItem('paimana_lang') as Locale) || defaultLocale
    setLocaleState(saved)
    loadMessages(saved)
  }, [])

  const loadMessages = async (lang: Locale) => {
    try {
      const mod = await import(`@/messages/${lang}.json`)
      setMessages(mod.default || mod)
    } catch {
      const mod = await import(`@/messages/en.json`)
      setMessages(mod.default || mod)
    }
  }

  const setLocale = (lang: Locale) => {
    setLocaleState(lang)
    localStorage.setItem('paimana_lang', lang)
    document.cookie = `paimana_lang=${lang}; path=/; max-age=31536000`
    loadMessages(lang)
  }

  // Nested key support: "Sidebar.dashboard"
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = messages
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) return key
    }
    return typeof value === 'string' ? value : key
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, messages }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}