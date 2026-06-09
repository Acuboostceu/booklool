'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/lib/i18n/LocaleContext'

type LogEntry = {
  id: string
  page_from: number
  page_to: number
  chapter_title: string | null
  created_at: string
}

export default function ReadingLogSection({
  bookId,
  profileId,
  totalPages,
}: {
  bookId: string
  profileId: string
  totalPages: number | null
}) {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLocale()

  const [logs, setLogs] = useState<LogEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [pageFrom, setPageFrom] = useState('')
  const [pageTo, setPageTo] = useState('')
  const [chapterTitle, setChapterTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchLogs = useCallback(async () => {
    const { data } = await supabase.rpc('get_reading_logs', { p_book_id: bookId })
    setLogs((data as LogEntry[]) || [])
  }, [bookId, supabase])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const maxPage = logs.length > 0 ? Math.max(...logs.map(l => l.page_to)) : 0
  const progressPct = totalPages && totalPages > 0 ? Math.min(100, Math.round((maxPage / totalPages) * 100)) : null

  async function handleSave() {
    const from = parseInt(pageFrom)
    const to = parseInt(pageTo)
    if (!from || !to || from > to) return
    setSaving(true)
    await supabase.rpc('insert_reading_log', {
      p_book_id: bookId,
      p_profile_id: profileId,
      p_page_from: from,
      p_page_to: to,
      p_chapter_title: chapterTitle || null,
    })
    setPageFrom('')
    setPageTo('')
    setChapterTitle('')
    setShowForm(false)
    setSaving(false)
    await fetchLogs()
    router.refresh()
  }

  async function handleDelete(id: string) {
    await supabase.rpc('delete_reading_log', { p_id: id })
    await fetchLogs()
    router.refresh()
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t('log_title')}</p>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1 text-xs font-bold rounded-2xl px-3 py-1.5 transition"
          style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}
        >
          {showForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {showForm ? t('log_cancel') : t('log_add')}
        </button>
      </div>

      {/* Progress bar */}
      {progressPct !== null && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">{t('log_progress', progressPct as never)}</span>
            <span className="text-xs text-gray-400">{maxPage} / {totalPages} p.</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progressPct}%`, background: 'var(--green)' }}
            />
          </div>
        </div>
      )}

      {/* Inline add form */}
      {showForm && (
        <div className="mb-4 rounded-2xl p-3 space-y-2" style={{ background: 'var(--green-light)' }}>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={pageFrom}
              onChange={e => setPageFrom(e.target.value)}
              placeholder={t('log_from')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none bg-white"
            />
            <span className="text-gray-400 font-bold">~</span>
            <input
              type="number"
              value={pageTo}
              onChange={e => setPageTo(e.target.value)}
              placeholder={t('log_to')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none bg-white"
            />
          </div>
          <input
            type="text"
            value={chapterTitle}
            onChange={e => setChapterTitle(e.target.value)}
            placeholder={t('log_chapter')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none bg-white"
          />
          <button
            onClick={handleSave}
            disabled={saving || !pageFrom || !pageTo}
            className="w-full font-bold rounded-xl py-2 text-sm transition disabled:opacity-60"
            style={{ background: 'var(--green)', color: 'white' }}
          >
            {saving ? t('log_saving') : t('log_save')}
          </button>
        </div>
      )}

      {/* Log entries */}
      {logs.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-2">{t('log_no_entries')}</p>
      ) : (
        <div className="space-y-2">
          {logs.map(entry => (
            <div key={entry.id} className="flex items-center justify-between rounded-2xl px-3 py-2 bg-gray-50">
              <div>
                <span className="text-sm font-semibold text-gray-700">
                  p.{entry.page_from} ~ {entry.page_to}
                </span>
                {entry.chapter_title && (
                  <span className="text-sm text-gray-500 ml-2">{entry.chapter_title}</span>
                )}
              </div>
              <button
                onClick={() => handleDelete(entry.id)}
                className="text-gray-300 hover:text-red-400 transition ml-2 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
