import { Router } from "express"
import {
  createQuiz,
  getQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuizResult,
  getQuizResults,
  previewQuiz,
  getParticipantAnswers,
  deleteQuizResult
} from "../controllers/QuizController"
import { authenticateToken } from "../middleware/auth"

const quizRouter = Router()

quizRouter.post("/quizzes", authenticateToken, createQuiz)
quizRouter.get("/quizzes", authenticateToken, getQuizzes)
quizRouter.get("/quizzes/:id", getQuiz)
quizRouter.put("/quizzes/:id", authenticateToken, updateQuiz)
quizRouter.delete("/quizzes/:id", authenticateToken, deleteQuiz)
quizRouter.post("/quizzes/:id/submit", submitQuizResult)
quizRouter.get("/quiz-results", authenticateToken, getQuizResults)
quizRouter.get("/quiz-results/:resultId/answers", authenticateToken, getParticipantAnswers)
quizRouter.delete("/quiz-results/:resultId", authenticateToken, deleteQuizResult);
quizRouter.get("/preview/:quizId", authenticateToken, previewQuiz);
export default quizRouter

