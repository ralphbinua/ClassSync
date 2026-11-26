import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { api } from '../api/client'

const cards = [
  { key: 'subjects', label: 'Subjects', path: '/subjects' },
  { key: 'teachers', label: 'Teachers', path: '/teachers' },
  { key: 'rooms', label: 'Rooms', path: '/rooms' },
  { key: 'sections', label: 'Sections', path: '/sections' },
  { key: 'schedules', label: 'Schedules', path: '/schedules' },
]

export default function Dashboard() {
  const [counts, setCounts] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all(cards.map((c) => api.get(c.path)))
      .then((results) => {
        const next = {}
        cards.forEach((c, i) => (next[c.key] = results[i].length))
        setCounts(next)
      })
      .catch((e) => setError(e.message))
  }, [])

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of your scheduling data" />

      {error && (
        <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
          Could not reach the API: {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.key} className="rounded-lg bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">{c.label}</div>
            <div className="mt-1 text-3xl font-bold">{counts[c.key] ?? '–'}</div>
          </div>
        ))}
      </div>
    </>
  )
}