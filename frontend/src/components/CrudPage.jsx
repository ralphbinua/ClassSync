import { useEffect, useState } from 'react'
import PageHeader from './PageHeader'
import DataTable from './DataTable'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'
import RecordForm from './RecordForm'
import { api } from '../api/client'
import { btnPrimary, btnSecondary, inputCls } from './ui'

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export default function CrudPage({ title, subtitle, endpoint, noun, columns, fields }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [modal, setModal] = useState(null) // { mode: 'add' | 'edit' | 'view', row }
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState(null) // { type: 'success' | 'error', text }

  // Load rows. Re-runs when the search text or reloadKey changes.
  useEffect(() => {
    let ignore = false
    const timer = setTimeout(() => {
      setLoading(true)
      const term = search.trim()
      const qs = term ? `?q=${encodeURIComponent(term)}` : ''
      api
        .get(`${endpoint}${qs}`)
        .then((data) => !ignore && setRows(data))
        .catch((err) => !ignore && setNotice({ type: 'error', text: err.message }))
        .finally(() => !ignore && setLoading(false))
    }, 300)
    return () => {
      clearTimeout(timer)
      ignore = true
    }
  }, [endpoint, search, reloadKey])

  // Auto-hide the notice after 4 seconds.
  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(t)
  }, [notice])

  const reload = () => setReloadKey((k) => k + 1)

  async function save(payload) {
    const editing = modal.mode === 'edit'
    if (editing) await api.put(`${endpoint}/${modal.row.id}`, payload)
    else await api.post(endpoint, payload)
    setModal(null)
    reload()
    setNotice({ type: 'success', text: `${cap(noun)} ${editing ? 'updated' : 'added'}.` })
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await api.delete(`${endpoint}/${toDelete.id}`)
      setNotice({ type: 'success', text: `${cap(noun)} deleted.` })
      reload()
    } catch (err) {
      setNotice({ type: 'error', text: err.message })
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  const modalTitle = modal
    ? { add: `Add ${noun}`, edit: `Edit ${noun}`, view: cap(noun) }[modal.mode]
    : ''

  return (
    <>
      <PageHeader title={title} subtitle={subtitle}>
        <button className={btnPrimary} onClick={() => setModal({ mode: 'add', row: null })}>
          + Add {noun}
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

      <input
        className={`${inputCls} mb-4 max-w-sm`}
        placeholder={`Search ${title.toLowerCase()}…`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        renderActions={(row) => (
          <div className="flex justify-end gap-3 text-sm">
            <button
              className="text-slate-600 hover:underline"
              onClick={() => setModal({ mode: 'view', row })}
            >
              View
            </button>
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setModal({ mode: 'edit', row })}
            >
              Edit
            </button>
            <button className="text-red-600 hover:underline" onClick={() => setToDelete(row)}>
              Delete
            </button>
          </div>
        )}
      />

      {modal && (
        <Modal title={modalTitle} onClose={() => setModal(null)}>
          {modal.mode === 'view' ? (
            <>
              <dl className="space-y-3">
                {fields.map((f) => (
                  <div key={f.name}>
                    <dt className="text-xs font-medium uppercase text-slate-500">{f.label}</dt>
                    <dd className="text-sm">{modal.row[f.name] ?? '—'}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 flex justify-end gap-2">
                <button className={btnSecondary} onClick={() => setModal(null)}>
                  Close
                </button>
                <button
                  className={btnPrimary}
                  onClick={() => setModal({ mode: 'edit', row: modal.row })}
                >
                  Edit
                </button>
              </div>
            </>
          ) : (
            <RecordForm
              key={modal.row?.id ?? 'new'}
              fields={fields}
              initial={modal.row}
              submitLabel={modal.mode === 'edit' ? 'Save changes' : `Add ${noun}`}
              onSubmit={save}
              onCancel={() => setModal(null)}
            />
          )}
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title={`Delete ${noun}?`}
          message="This can't be undone."
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  )
}