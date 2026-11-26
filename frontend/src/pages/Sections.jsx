import CrudPage from '../components/CrudPage'

const columns = [
  { key: 'grade_level', label: 'Grade level' },
  { key: 'section_name', label: 'Section' },
]

const fields = [
  { name: 'grade_level', label: 'Grade level', required: true, placeholder: 'e.g. Grade 7' },
  { name: 'section_name', label: 'Section', required: true, placeholder: 'e.g. A' },
]

export default function Sections() {
  return (
    <CrudPage
      title="Sections"
      subtitle="Manage grade levels and sections"
      endpoint="/sections"
      noun="section"
      columns={columns}
      fields={fields}
    />
  )
}