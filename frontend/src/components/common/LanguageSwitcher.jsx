import React from 'react'
import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const setLang = (lng) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setLang('en')} className="px-2 py-1 rounded bg-richblack-700 text-richblack-5">EN</button>
      <button onClick={() => setLang('vi')} className="px-2 py-1 rounded bg-richblack-700 text-richblack-5">VI</button>
    </div>
  )
}
