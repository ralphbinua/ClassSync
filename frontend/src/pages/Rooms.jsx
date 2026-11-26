import CrudPage from '../components/CrudPage'

const columns = [
  { key: 'room_number', label: 'Room' },
  { key: 'building', label: 'Building' },
  { key: 'room_type', label: 'Type' },
  { key: 'capacity', label: 'Capacity' },
]

const fields = [
  { name: 'room_number', label: 'Room number', required: true, placeholder: 'e.g. 101' },
  { name: 'building', label: 'Building' },
  { name: 'room_type', label: 'Room type', options: ['Lecture', 'Laboratory', 'Gym', 'Other'] },
  { name: 'capacity', label: 'Capacity', type: 'number', min: 1 },
]

export default function Rooms() {
  return (
    <CrudPage
      title="Rooms"
      subtitle="Manage room information"
      endpoint="/rooms"
      noun="room"
      columns={columns}
      fields={fields}
    />
  )
}