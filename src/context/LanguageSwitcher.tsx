'use client'

import { useLanguage } from '@/context/LanguageContext'
import { languages } from '@/lib/i18n'
import { Globe } from 'lucide-react'
import { useState } from 'react'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)

  const current = languages.find(l => l.code === locale)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-all"
      >
        <Globe className="w-4 h-4" />
        <span>{current?.native || 'English'}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 max-h-64 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code)
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-800 transition-colors ${
                locale === lang.code ? 'text-amber-400 font-bold' : 'text-slate-300'
              }`}
            >
              {lang.native}
              <span className="text-xs text-slate-500 ml-2">({lang.name})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}