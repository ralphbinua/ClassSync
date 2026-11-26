import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/subjects', label: 'Subjects' },
  { to: '/teachers', label: 'Teachers' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/sections', label: 'Sections' },
  { to: '/schedules', label: 'Schedules' },
  { to: '/conflicts', label: 'Conflicts' },
  { to: '/reports', label: 'Reports' },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800">
      <aside className="w-56 shrink-0 bg-slate-900 text-slate-200 print:hidden">
        <div className="px-5 py-5 text-xl font-bold text-white">ClassSync</div>
        <nav className="flex flex-col gap-1 px-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  )
}