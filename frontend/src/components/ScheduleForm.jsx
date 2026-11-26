import { useEffect, useState } from 'react'
import { api } from '../api/client'
import Select from './Select'
import { btnPrimary, btnSecondary, inputCls } from './ui'
import { DAYS } from '../constants'

// The form is ready for a conflict check when every field is filled and end is after start.
// "HH:MM" strings compare correctly as plain text.
const isReady = (v) =>
  Object.values(v).every((x) => x !== '') && v.end_time > v.start_time

const toPayload = (v) => ({
  subject_id: Number(v.subject_id),
  teacher_id: Number(v.teacher_id),
  room_id: Number(v.room_id),
  section_id: Number(v.section_id),
  day: Number(v.day),
  start_time: v.start_time,
  end_time: v.end_time,
})

export default function ScheduleForm({ opts, initial, onSubmit, onCancel }) {
  const [v, setV] = useState({
    subject_id: initial?.subject_id ?? '',
    teacher_id: initial?.teacher_id ?? '',
    room_id: initial?.room_id ?? '',
    section_id: initial?.section_id ?? '',
    day: initial?.day ?? '',
    start_time: initial?.start_time ?? '',
    end_time: initial?.end_time ?? '',
  })
  const [result, setResult] = useState(null) // { key, conflicts, failed? }
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (name) => (value) => setV((old) => ({ ...old, [name]: value }))

  const ready = isReady(v)
  const key = ready ? JSON.stringify(toPayload(v)) : null
  const fresh = result?.key === key          // is the stored result for the current values?
  const checking = ready && !fresh
  const conflicts = ready && fresh ? result.conflicts : []
  const timesBad = v.start_time && v.end_time && v.end_time <= v.start_time

  // Ask the backend about conflicts, 300 ms after the user stops changing things.
  useEffect(() => {
    if (!key) return
    let ignore = false
    const timer = setTimeout(() => {
      api
        .post('/schedules/check-conflict', { ...JSON.parse(key), exclude_id: initial?.id ?? null })
        .then((r) => !ignore && setResult({ key, conflicts: r.conflicts }))
        .catch((e) => !ignore && setResult({ key, conflicts: [], failed: e.message }))
    }, 300)
    return () => {
      clearTimeout(timer)
      ignore = true
    }
  }, [key, initial?.id])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSubmit(toPayload(v))
    } catch (err) {
      setError(err.message)
      if (err.conflicts?.length) setResult({ key, conflicts: err.conflicts })
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Select id="subject_id" label="Subject" required value={v.subject_id}
            onChange={set('subject_id')} options={opts.subjects} />
        </div>
        <Select id="teacher_id" label="Teacher" required value={v.teacher_id}
          onChange={set('teacher_id')} options={opts.teachers} />
        <Select id="room_id" label="Room" required value={v.room_id}
          onChange={set('room_id')} options={opts.rooms} />
        <Select id="section_id" label="Grade / Section" required value={v.section_id}
          onChange={set('section_id')} options={opts.sections} />
        <Select id="day" label="Day" required value={v.day}
          onChange={set('day')} options={DAYS} />

        <div>
          <label htmlFor="start_time" className="mb-1 block text-sm font-medium">
            Start time <span className="text-red-500">*</span>
          </label>
          <input id="start_time" type="time" required className={inputCls}
            value={v.start_time} onChange={(e) => set('start_time')(e.target.value)} />
        </div>
        <div>
          <label htmlFor="end_time" className="mb-1 block text-sm font-medium">
            End time <span className="text-red-500">*</span>
          </label>
          <input id="end_time" type="time" required className={inputCls}
            value={v.end_time} onChange={(e) => set('end_time')(e.target.value)} />
        </div>
      </div>

      {/* Live status area */}
      {timesBad && (
        <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">
          End time must be after the start time.
        </div>
      )}
      {checking && <div className="text-sm text-slate-500">Checking for conflicts…</div>}
      {ready && fresh && result.failed && (
        <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">
          Couldn&apos;t check for conflicts: {result.failed}
        </div>
      )}
      {ready && fresh && !result.failed && conflicts.length === 0 && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          ✓ No conflicts. This time slot is free.
        </div>
      )}
      {conflicts.length > 0 && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="font-semibold">Conflict detected. This can&apos;t be saved.</div>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {conflicts.map((c, i) => (
              <li key={i}>{c.message}</li>
            ))}
          </ul>
        </div>
      )}

      {error && conflicts.length === 0 && (
        <div className="rounded-md bg-red-100 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className={btnSecondary} onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className={btnPrimary}
          disabled={saving || checking || conflicts.length > 0 || timesBad}
        >
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Add schedule'}
        </button>
      </div>
    </form>
  )
}