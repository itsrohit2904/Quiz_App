import { useState } from "react"
import { Routes, Route } from "react-router-dom"
import PrivateRoute from "./components/PrivateRoute"
import PublicRoute from "./components/PublicRoute"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { DashboardHome } from "./pages/DashboardHome"
import { QuizGenerator } from "./components/quiz/QuizGenerator"
import { QuizResults } from "./components/quiz/QuizResults"
import { TakeQuiz } from "./components/quiz/TakeQuiz"
import { Sidebar } from "./components/layout/Sidebar"
import { QuizPreview } from "./components/quiz/QuizPreview"

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activePage, setActivePage] = useState("home")

  return (
    <div className="flex h-screen">
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route 
        path="/take-quiz/:quizId" 
        element={
            <TakeQuiz />
          } 
          />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="flex w-full">
                <Sidebar
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  activePage={activePage}
                  setActivePage={setActivePage}
                />
                <div className={`flex-1 ${isSidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardHome />} />
                    <Route path="/create-quiz" element={<QuizGenerator />} />
                    <Route path="/edit-quiz/:quizId" element={<QuizGenerator />} />
                    <Route path="/results" element={<QuizResults />} />
                    <Route path="/preview/:quizId" element={<QuizPreview />} />
                  </Routes>
                </div>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App

