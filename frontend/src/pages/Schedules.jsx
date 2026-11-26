import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import ScheduleForm from '../components/ScheduleForm'
import Select from '../components/Select'
import { api } from '../api/client'
import { btnPrimary, btnSecondary, inputCls } from '../components/ui'
import { DAYS } from '../constants'

const columns = [
  { key: 'subject_code', label: 'Code' },
  { key: 'subject_name', label: 'Subject' },
  { key: 'teacher_name', label: 'Teacher' },
  { key: 'room_number', label: 'Room' },
  { key: 'grade_section', label: 'Grade / Section' },
  { key: 'day_name', label: 'Day' },
  { key: 'start_time', label: 'Start' },
  { key: 'end_time', label: 'End' },
]

const EMPTY_FILTERS = { teacher_id: '', room_id: '', subject_id: '', section_id: '', day: '' }

export default function Schedules() {
  const [lookups, setLookups] = useState({ subjects: [], teachers: [], rooms: [], sections: [] })
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const [modal, setModal] = useState(null) // { mode: 'add' | 'edit', row }
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState(null)

  // Load the lists used by the dropdowns (once).
  useEffect(() => {
    Promise.all([api.get('/subjects'), api.get('/teachers'), api.get('/rooms'), api.get('/sections')])
      .then(([subjects, teachers, rooms, sections]) =>
        setLookups({ subjects, teachers, rooms, sections })
      )
      .catch((err) => setNotice({ type: 'error', text: err.message }))
  }, [])

  // Load schedules whenever filters, search, or reloadKey change (debounced).
  useEffect(() => {
    let ignore = false
    const timer = setTimeout(() => {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, val]) => val && params.set(k, val))
      if (search.trim()) params.set('q', search.trim())
      const qs = params.toString()
      api
        .get(`/schedules${qs ? `?${qs}` : ''}`)
        .then((data) => !ignore && setRows(data))
        .catch((err) => !ignore && setNotice({ type: 'error', text: err.message }))
        .finally(() => !ignore && setLoading(false))
    }, 300)
    return () => {
      clearTimeout(timer)
      ignore = true
    }
  }, [filters, search, reloadKey])

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(t)
  }, [notice])

  const reload = () => setReloadKey((k) => k + 1)
  const setFilter = (name) => (value) => setFilters((f) => ({ ...f, [name]: value }))
  const hasFilters = search.trim() !== '' || Object.values(filters).some(Boolean)

  // Dropdown options: value = id sent to the API, label = what people read.
  const opts = {
    subjects: lookups.subjects.map((s) => ({
      value: s.id, label: `${s.subject_code} — ${s.subject_name}`,
    })),
    teachers: lookups.teachers.map((t) => ({
      value: t.id, label: `${t.last_name}, ${t.first_name}`,
    })),
    rooms: lookups.rooms.map((r) => ({ value: r.id, label: r.room_number })),
    sections: lookups.sections.map((s) => ({
      value: s.id, label: `${s.grade_level} - ${s.section_name}`,
    })),
  }

  async function save(payload) {
    const editing = modal.mode === 'edit'
    if (editing) await api.put(`/schedules/${modal.row.id}`, payload)
    else await api.post('/schedules', payload)
    setModal(null)
    reload()
    setNotice({ type: 'success', text: `Schedule ${editing ? 'updated' : 'added'}.` })
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await api.delete(`/schedules/${toDelete.id}`)
      setNotice({ type: 'success', text: 'Schedule deleted.' })
      reload()
    } catch (err) {
      setNotice({ type: 'error', text: err.message })
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  return (
    <>
      <PageHeader title="Schedules" subtitle="Assign subjects, teachers, rooms, and times">
        <button className={btnPrimary} onClick={() => setModal({ mode: 'add', row: null })}>
          + Add schedule
        </button>
      </PageHeader>

      {notice && (
        <div
          className={`mb-4 rounded-md p-3 text-sm ${
            notice.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Search and filters */}
      <div className="mb-4 space-y-3">
        <input
          className={`${inputCls} max-w-sm`}
          placeholder="Search subject, teacher, room, section, day…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Select value={filters.teacher_id} onChange={setFilter('teacher_id')}
            options={opts.teachers} placeholder="All teachers" />
          <Select value={filters.room_id} onChange={setFilter('room_id')}
            options={opts.rooms} placeholder="All rooms" />
          <Select value={filters.subject_id} onChange={setFilter('subject_id')}
            options={opts.subjects} placeholder="All subjects" />
          <Select value={filters.section_id} onChange={setFilter('section_id')}
            options={opts.sections} placeholder="All sections" />
          <Select value={filters.day} onChange={setFilter('day')}
            options={DAYS} placeholder="All days" />
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>
            {loading ? 'Loading…' : `${rows.length} schedule${rows.length === 1 ? '' : 's'}`}
          </span>
          {hasFilters && (
            <button
              className="text-blue-600 hover:underline"
              onClick={() => {
                setFilters(EMPTY_FILTERS)
                setSearch('')
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        renderActions={(row) => (
          <div className="flex justify-end gap-3 text-sm">
            <button className="text-blue-600 hover:underline"
              onClick={() => setModal({ mode: 'edit', row })}>
              Edit
            </button>
            <button className="text-red-600 hover:underline" onClick={() => setToDelete(row)}>
              Delete
            </button>
          </div>
        )}
      />

      {modal && (
        <Modal
          wide
          title={modal.mode === 'edit' ? 'Edit schedule' : 'Add schedule'}
          onClose={() => setModal(null)}
        >
          <ScheduleForm
            key={modal.row?.id ?? 'new'}
            opts={opts}
            initial={modal.row}
            onSubmit={save}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete schedule?"
          message={`${toDelete.subject_code} · ${toDelete.grade_section} · ${toDelete.day_name} ${toDelete.start_time}–${toDelete.end_time}. This can't be undone.`}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  )
}