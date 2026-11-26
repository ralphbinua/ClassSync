import CrudPage from '../components/CrudPage'

const columns = [
  { key: 'subject_code', label: 'Code' },
  { key: 'subject_name', label: 'Name' },
  { key: 'units', label: 'Units' },
  { key: 'description', label: 'Description' },
]

const fields = [
  { name: 'subject_code', label: 'Subject code', required: true, placeholder: 'e.g. MATH7' },
  { name: 'subject_name', label: 'Subject name', required: true },
  { name: 'units', label: 'Units', type: 'number', min: 0 },
  { name: 'description', label: 'Description' },
]

export default function Subjects() {
  return (
    <CrudPage
      title="Subjects"
      subtitle="Manage subject records"
      endpoint="/subjects"
      noun="subject"
      columns={columns}
      fields={fields}
    />
  )
}