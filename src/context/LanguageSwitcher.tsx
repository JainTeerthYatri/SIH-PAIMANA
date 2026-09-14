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
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-300 shadow-md text-sm font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-400 transition-all"
      >
        <Globe className="w-4 h-4 text-[#F59A00]" />
        <span>{current?.native || 'English'}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-2xl z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code)
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${
                locale === lang.code
                  ? 'bg-amber-50 text-amber-700 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {lang.native}
              <span className="text-xs text-slate-400 ml-2">({lang.name})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}