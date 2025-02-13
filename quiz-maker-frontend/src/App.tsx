import { useState } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import PrivateRoute from "./components/PrivateRoute"
import PublicRoute from "./components/PublicRoute"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { DashboardHome } from "./pages/DashboardHome"
import { QuizGenerator } from "./components/quiz/QuizGenerator"
import { QuizResults } from "./components/quiz/QuizResults"
import { TakeQuiz } from "./components/quiz/TakeQuiz"
import { QuizPreview } from "./components/quiz/QuizPreview"
import { Sidebar } from "./components/layout/Sidebar"

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activePage, setActivePage] = useState("home")
  const location = useLocation()

  
  const hideSidebarRoutes = ["/login", "/register", "/take-quiz"]
  const shouldShowSidebar = !hideSidebarRoutes.some((path) => location.pathname.startsWith(path))

  return (
    <div className="flex h-screen">

      {shouldShowSidebar && (
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activePage={activePage}
          setActivePage={setActivePage}
        />
      )}

      <div className={`flex-1 transition-all duration-300 ${shouldShowSidebar ? (isSidebarOpen ? "ml-64" : "ml-20") : "ml-0"}`}>
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
          <Route path="/take-quiz/:quizId" 
          element={
      
            <TakeQuiz />
            } />

       
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Routes>
                  <Route path="/dashboard" element={<DashboardHome />} />
                  <Route path="/create-quiz" element={<QuizGenerator />} />
                  <Route path="/edit-quiz/:quizId" element={<QuizGenerator />} />
                  <Route path="/results" element={<QuizResults />} />
                  <Route path="/preview/:quizId" element={<QuizPreview />} />
                </Routes>
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  )
}

export default App
