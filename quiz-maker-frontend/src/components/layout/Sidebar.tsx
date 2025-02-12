import type React from "react"
import { BarChart3, FileText, Home, LogOut, Menu, X } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

interface SidebarProps {
  isSidebarOpen: boolean
  setIsSidebarOpen: (value: boolean) => void
  activePage: string
  setActivePage: (page: string) => void
}

export const navigation = [
  { name: "Dashboard", icon: Home, id: "home", path: "/dashboard" },
  { name: "Generate Quiz", icon: FileText, id: "generate", path: "/create-quiz" },
  { name: "View Results", icon: BarChart3, id: "results", path: "/results" },
]

export const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setIsSidebarOpen, activePage, setActivePage }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <div
      className={`h-screen ${isSidebarOpen ? "w-64" : "w-20"} bg-white shadow-lg transition-all duration-300 flex flex-col justify-between fixed left-0 top-0`}
    >
      <div>
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {isSidebarOpen && <h1 className="text-xl font-bold">Quiz Maker</h1>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="mt-4">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id)
                navigate(item.path)
              }}
              className={`w-full flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors
                ${location.pathname === item.path ? "bg-blue-50 text-blue-700" : ""}`}
            >
              <item.icon size={20} className="mr-4" />
              {isSidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>
      </div>
      <div className="mb-8">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} className="mr-4" />
          {isSidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}