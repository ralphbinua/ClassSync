import Modal from './Modal'
import { btnDanger, btnSecondary } from './ui'

export default function ConfirmDialog({ title, message, busy, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button className={btnSecondary} onClick={onCancel}>
          Cancel
        </button>
        <button className={btnDanger} disabled={busy} onClick={onConfirm}>
          {busy ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Modal>
  )
}