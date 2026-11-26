import { useState } from 'react'
import { btnPrimary, btnSecondary, inputCls } from './ui'

export default function RecordForm({ fields, initial, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.name, initial?.[f.name] ?? '']))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const change = (name, value) => setValues((v) => ({ ...v, [name]: value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {}
    for (const f of fields) {
      const raw = values[f.name]
      if (raw === '') payload[f.name] = null
      else payload[f.name] = f.type === 'number' ? Number(raw) : raw
    }

    try {
      await onSubmit(payload)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="mb-1 block text-sm font-medium">
            {f.label}
            {f.required && <span className="text-red-500"> *</span>}
          </label>

          {f.options ? (
            <select
              id={f.name}
              className={inputCls}
              required={f.required}
              value={values[f.name]}
              onChange={(e) => change(f.name, e.target.value)}
            >
              <option value="">— Select —</option>
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={f.name}
              className={inputCls}
              type={f.type ?? 'text'}
              step={f.type === 'number' ? 'any' : undefined}
              min={f.min}
              required={f.required}
              placeholder={f.placeholder}
              value={values[f.name]}
              onChange={(e) => change(f.name, e.target.value)}
            />
          )}
        </div>
      ))}

      {error && <div className="rounded-md bg-red-100 p-3 text-sm text-red-700">{error}</div>}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className={btnSecondary} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={btnPrimary} disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}