// import axios from "axios"
// import type { Quiz, QuizResult } from "../types/quiz"

// const API_URL = "http://localhost:5000/api"

// export const createQuiz = async (quiz: Quiz): Promise<Quiz> => {
//   const response = await axios.post(`${API_URL}/quizzes`, quiz)
//   return response.data
// }

// export const getQuiz = async (id: string): Promise<Quiz> => {
//   const response = await axios.get(`${API_URL}/quizzes/${id}`)
//   return response.data
// }

// export const getAllQuizzes = async (): Promise<Quiz[]> => {
//   const response = await axios.get(`${API_URL}/quizzes`)
//   return response.data
// }

// export const updateQuiz = async (id: string, quiz: Quiz): Promise<Quiz> => {
//   const response = await axios.put(`${API_URL}/quizzes/${id}`, quiz)
//   return response.data
// }

// export const deleteQuiz = async (id: string): Promise<void> => {
//   await axios.delete(`${API_URL}/quizzes/${id}`)
// }

// export const createResult = async (result: QuizResult): Promise<QuizResult> => {
//   const response = await axios.post(`${API_URL}/results`, result)
//   return response.data
// }

// export const getResultsByQuizId = async (quizId: string): Promise<QuizResult[]> => {
//   const response = await axios.get(`${API_URL}/results/${quizId}`)
//   return response.data
// }

// export const getAllResults = async (): Promise<QuizResult[]> => {
//   const response = await axios.get(`${API_URL}/results`)
//   return response.data
// }

