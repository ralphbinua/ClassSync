import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Subjects from './pages/Subjects'
import Teachers from './pages/Teachers'
import Rooms from './pages/Rooms'
import Sections from './pages/Sections'
import Schedules from './pages/Schedules'
import Conflicts from './pages/Conflicts'
import Reports from './pages/Reports'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/sections" element={<Sections />} />
        <Route path="/schedules" element={<Schedules />} />
        <Route path="/conflicts" element={<Conflicts />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
    </Routes>
  )
}