import { inputCls } from './ui'

export default function Select({
  id, label, value, onChange, options, placeholder = '— Select —', required,
}) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <select
        id={id}
        className={inputCls}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}