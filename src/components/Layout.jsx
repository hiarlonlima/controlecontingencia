import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'

export default function Layout() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto max-w-[1500px] px-8 py-7">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
