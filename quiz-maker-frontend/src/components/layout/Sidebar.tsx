import React, { useCallback } from "react"
import { BarChart3, FileText, Home, LogOut, Menu, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import classNames from "classnames"

interface SidebarProps {
  isSidebarOpen: boolean
  setIsSidebarOpen: (value: boolean) => void
  activePage: string
  setActivePage: (page: string) => void
}

const navigation = [
  { name: "Dashboard", icon: Home, id: "home", path: "/dashboard" },
  { name: "Generate Quiz", icon: FileText, id: "generate", path: "/create-quiz" },
  { name: "View Results", icon: BarChart3, id: "results", path: "/results" },
]

export const Sidebar: React.FC<SidebarProps> = React.memo(({ isSidebarOpen, setIsSidebarOpen, activePage, setActivePage }) => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = useCallback(async () => {
    await logout()
    navigate("/login")
  }, [logout, navigate])

  return (
    <aside
      className={classNames(
        "h-screen bg-white shadow-lg transition-all duration-300 flex flex-col justify-between fixed left-0 top-0",
        isSidebarOpen ? "w-64" : "w-20"
      )}
    >
      <div>
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {isSidebarOpen && <h1 className="text-xl font-bold">Quiz Maker</h1>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2" aria-label="Toggle Sidebar">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-4">
          {navigation.map(({ id, name, icon: Icon, path }) => (
            <button
              key={id}
              onClick={() => {
                setActivePage(id)
                navigate(path)
              }}
              className={classNames(
                "group flex items-center w-full px-4 py-3 text-gray-700 transition-colors",
                activePage === id ? "bg-blue-50 text-blue-700" : "hover:bg-blue-50 hover:text-blue-700"
              )}
              aria-label={name}
            >
              <Icon size={20} className="mr-4 group-hover:scale-110 transition-transform" />
              {isSidebarOpen && <span>{name}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="mb-8">
        <button
          onClick={handleLogout}
          className="group flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
          aria-label="Logout"
        >
          <LogOut size={20} className="mr-4 group-hover:scale-110 transition-transform" />
          {isSidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
})

Sidebar.displayName = "Sidebar"
