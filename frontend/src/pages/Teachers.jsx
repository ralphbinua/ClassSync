import CrudPage from '../components/CrudPage'

const columns = [
  { key: 'teacher_id_no', label: 'ID No.' },
  { key: 'name', label: 'Name', render: (r) => `${r.last_name}, ${r.first_name}` },
  { key: 'department', label: 'Department' },
  { key: 'email', label: 'Email' },
]

const fields = [
  { name: 'teacher_id_no', label: 'Teacher ID no.', required: true, placeholder: 'e.g. T-001' },
  { name: 'first_name', label: 'First name', required: true },
  { name: 'last_name', label: 'Last name', required: true },
  { name: 'department', label: 'Department' },
  { name: 'email', label: 'Email', type: 'email' },
]

export default function Teachers() {
  return (
    <CrudPage
      title="Teachers"
      subtitle="Manage teacher records"
      endpoint="/teachers"
      noun="teacher"
      columns={columns}
      fields={fields}
    />
  )
}