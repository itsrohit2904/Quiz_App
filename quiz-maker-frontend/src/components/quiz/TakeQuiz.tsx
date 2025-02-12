import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import type { Quiz } from "../../types/quiz"

interface ParticipantInfo {
  [key: string]: string
}

export const TakeQuiz: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo>({})

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/quizzes/${quizId}`, {
          credentials: "include",
        })
        if (response.ok) {
          const quizData = await response.json()
          setQuiz(quizData)
          if (quizData.settings?.timeLimit) {
            setTimeRemaining(quizData.settings.timeLimit * 60)
          }
        } else {
          console.error("Failed to fetch quiz")
          navigate("/")
        }
      } catch (error) {
        console.error("Error fetching quiz:", error)
        navigate("/")
      }
    }

    fetchQuiz()
  }, [quizId, navigate])

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>

    if (timeRemaining !== null && timeRemaining > 0 && !submitted) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer)
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [timeRemaining, submitted])

  const handleParticipantInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParticipantInfo((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleAnswerChange = (questionId: number, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmit = async () => {
    if (!quiz) return

    let calculatedScore = 0
    let correctCount = 0
    quiz.questions.forEach((question) => {
      const userAnswer = userAnswers[question.id]
      if (userAnswer === question.correctAnswer) {
        calculatedScore++
        correctCount++
      }
    })

    const finalScore = Math.round((calculatedScore / quiz.questions.length) * 100)
    setScore(finalScore)
    setCorrectAnswers(correctCount)
    setSubmitted(true)

    try {
      const response = await fetch(`http://localhost:3000/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantName: participantInfo.name,
          participantEmail: participantInfo.email,
          score: finalScore,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit quiz result")
      }
    } catch (error) {
      console.error("Error submitting quiz result:", error)
    }
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (!quiz) return <div>Loading...</div>

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-3xl font-bold mb-6 text-green-600">Quiz Completed!</h2>
        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <div className="mb-4 text-left">
            <h3 className="font-semibold mb-2">Participant Information</h3>
            {Object.entries(participantInfo).map(([key, value]) => (
              <p key={key}>
                {key}: {value}
              </p>
            ))}
          </div>
          <p className="text-2xl mb-4">
            Your Score: <span className="font-bold">{score}%</span>
          </p>
          <p className="text-xl text-gray-700 mb-4">
            {correctAnswers} out of {quiz.questions.length} questions correct
          </p>
        </div>
        {quiz.settings?.allowRetake && (
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Retake Quiz
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-6">{quiz.title}</h2>
      <p className="mb-6 text-gray-600">{quiz.description}</p>

      {timeRemaining !== null && (
        <div className="mb-4 text-right">
          <span className={`text-lg font-semibold ${timeRemaining < 60 ? "text-red-600" : "text-blue-600"}`}>
            Time Remaining: {formatTime(timeRemaining)}
          </span>
        </div>
      )}

      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-4">Participant Information</h3>
        <div className="space-y-4">
          {quiz.participantFields.map((field) => (
            <div key={field.id}>
              <label className="block mb-1">{field.label}</label>
              <input
                type={field.type}
                name={field.label.toLowerCase()}
                value={participantInfo[field.label.toLowerCase()] || ""}
                onChange={handleParticipantInfoChange}
                className="w-full p-2 border rounded"
                required={field.required}
              />
            </div>
          ))}
        </div>
      </div>

      {quiz.questions.map((question, index) => (
        <div key={question.id} className="mb-6 border-b pb-6">
          <h3 className="font-semibold mb-4">
            Question {index + 1}: {question.questionText}
          </h3>

          {question.type === "multiple-choice" && (
            <div className="space-y-2">
              {question.options.map((option: any) => (
                <div key={option.id} className="flex items-center">
                  <input
                    type="radio"
                    id={`q${question.id}-${option.id}`}
                    name={`question-${question.id}`}
                    value={option.text}
                    checked={userAnswers[question.id] === option.text}
                    onChange={() => handleAnswerChange(question.id, option.text)}
                    className="mr-2"
                  />
                  <label htmlFor={`q${question.id}-${option.id}`}>{option.text}</label>
                </div>
              ))}
            </div>
          )}

          {question.type === "true-false" && (
            <div className="space-y-2">
              {["True", "False"].map((option) => (
                <div key={option} className="flex items-center">
                  <input
                    type="radio"
                    id={`q${question.id}-${option}`}
                    name={`question-${question.id}`}
                    value={option}
                    checked={userAnswers[question.id] === option}
                    onChange={() => handleAnswerChange(question.id, option)}
                    className="mr-2"
                  />
                  <label htmlFor={`q${question.id}-${option}`}>{option}</label>
                </div>
              ))}
            </div>
          )}

          {question.type === "short-answer" && (
            <input
              type="text"
              placeholder="Your answer"
              value={userAnswers[question.id] || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
          )}
        </div>
      ))}

      <div className="mt-6">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={
            Object.keys(userAnswers).length !== quiz.questions.length ||
            Object.keys(participantInfo).length !== quiz.participantFields.length
          }
        >
          Submit Quiz
        </button>
      </div>
    </div>
  )
}

