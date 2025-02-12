import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Sidebar } from "../components/layout/Sidebar"

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
  const [activePage, setActivePage] = React.useState("home")

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex w-full">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <div className={`flex-1 ${isSidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>{children}</div>
    </div>
  )
}

export default PrivateRoute

