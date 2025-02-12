import type React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default PublicRoute

