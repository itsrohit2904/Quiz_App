
import type React from "react"
import { useEffect, useState } from "react"
import { PlusCircle, Trash2 } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"

interface Option {
  id: number
  text: string
}

interface Question {
  id: number
  type: "multiple-choice" | "true-false" | "short-answer"
  questionText: string
  options: Option[]
  correctAnswer: string
}

interface ParticipantField {
  id: number
  label: string
  type: "text" | "email"
  required: boolean
}

interface Quiz {
  id: string
  title: string
  description: string
  questions: Question[]
  createdAt: string
  settings: any
  participantFields: ParticipantField[]
}

export const QuizGenerator: React.FC = () => {
  const navigate = useNavigate()
  const { quizId } = useParams()
  const { isAuthenticated } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      type: "multiple-choice",
      questionText: "",
      options: [
        { id: 1, text: "" },
        { id: 2, text: "" },
        { id: 3, text: "" },
        { id: 4, text: "" },
      ],
      correctAnswer: "",
    },
  ])
  const [participantFields, setParticipantFields] = useState<ParticipantField[]>([
    { id: 1, label: "Name", type: "text", required: true },
    { id: 2, label: "Email", type: "email", required: true },
  ])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    if (quizId) {
      axios
        .get<Quiz>(`http://localhost:3000/api/quizzes/${quizId}`, {
          withCredentials: true,
        })
        .then((response) => {
          const quiz = response.data
          setTitle(quiz.title)
          setDescription(quiz.description)
          setQuestions(quiz.questions)
          setParticipantFields(
            quiz.participantFields || [
              { id: 1, label: "Name", type: "text", required: true },
              { id: 2, label: "Email", type: "email", required: true },
            ],
          )
        })
        .catch((error) => console.error("Error fetching quiz:", error))
    }
  }, [quizId, isAuthenticated, navigate])

  const addParticipantField = () => {
    setParticipantFields([
      ...participantFields,
      {
        id: participantFields.length + 1,
        label: "",
        type: "text",
        required: false,
      },
    ])
  }

  const updateParticipantField = (id: number, field: Partial<ParticipantField>) => {
    setParticipantFields(participantFields.map((f) => (f.id === id ? { ...f, ...field } : f)))
  }

  const deleteParticipantField = (id: number) => {
    setParticipantFields(participantFields.filter((f) => f.id !== id))
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: questions.length + 1,
        type: "multiple-choice",
        questionText: "",
        options: [
          { id: 1, text: "" },
          { id: 2, text: "" },
          { id: 3, text: "" },
          { id: 4, text: "" },
        ],
        correctAnswer: "",
      },
    ])
  }

  const handleQuestionTypeChange = (questionId: number, newType: Question["type"]) => {
    setQuestions(
      questions.map((question) => {
        if (question.id === questionId) {
          let options: Option[] = []

          switch (newType) {
            case "multiple-choice":
              options = [
                { id: 1, text: "" },
                { id: 2, text: "" },
                { id: 3, text: "" },
                { id: 4, text: "" },
              ]
              break
            case "true-false":
              options = [
                { id: 1, text: "True" },
                { id: 2, text: "False" },
              ]
              break
            case "short-answer":
              options = []
              break
          }

          return {
            ...question,
            type: newType,
            options,
            correctAnswer: "",
          }
        }
        return question
      }),
    )
  }

  const handleQuestionTextChange = (questionId: number, text: string) => {
    setQuestions(
      questions.map((question) => (question.id === questionId ? { ...question, questionText: text } : question)),
    )
  }

  const handleOptionChange = (questionId: number, optionId: number, text: string) => {
    setQuestions(
      questions.map((question) => {
        if (question.id === questionId) {
          return {
            ...question,
            options: question.options.map((option) => (option.id === optionId ? { ...option, text } : option)),
          }
        }
        return question
      }),
    )
  }

  const handleCorrectAnswerChange = (questionId: number, answer: string) => {
    setQuestions(
      questions.map((question) => (question.id === questionId ? { ...question, correctAnswer: answer } : question)),
    )
  }

  const deleteQuestion = (questionId: number) => {
    setQuestions(questions.filter((question) => question.id !== questionId))
  }

  const handleGenerateQuiz = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  
    // Validation Checks
    if (!title.trim()) {
      alert("Please enter a quiz title");
      return;
    }
    if (questions.some((q) => !q.questionText.trim())) {
      alert("Please fill in all question texts");
      return;
    }
    if (questions.some((q) => q.type !== "short-answer" && !q.correctAnswer)) {
      alert("Please select correct answers for all questions");
      return;
    }
    if (participantFields.some((f) => !f.label.trim())) {
      alert("Please fill in all participant field labels");
      return;
    }
  
    try {
      let existingSettings = {};
  
      
      if (quizId) {
        const response = await axios.get(`http://localhost:3000/api/quizzes/${quizId}`, {
          withCredentials: true,
        });
  
        
        if (response && response.data && typeof response.data === "object" && "settings" in response.data) {
          existingSettings = response.data.settings || {};
        }
      }
  
      const quizData = {
        title,
        description,
        questions,
        settings: existingSettings, 
        participantFields,
      };
  
      
      if (quizId) {
        await axios.put(`http://localhost:3000/api/quizzes/${quizId}`, quizData, { withCredentials: true });
        alert("Quiz updated successfully!");
      } else {
        await axios.post("http://localhost:3000/api/quizzes", quizData, { withCredentials: true });
        alert("Quiz created successfully!");
      }
  
      navigate("/dashboard");
    } catch (error: any) {
      console.error(`Error ${quizId ? "updating" : "creating"} quiz:`, error);
  
      const errorMessage =
        (error.response && error.response.data && error.response.data.error) ||
        `Failed to ${quizId ? "update" : "create"} quiz. Please try again.`;
  
      alert(errorMessage);
    }
  };
  
  
  if (!isAuthenticated) return null;
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Quiz Details</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <textarea
            placeholder="Quiz Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            rows={3}
          />
        </div>
      </div>
      <div className="mt-6 border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Participant Information</h3>
          <button
            onClick={addParticipantField}
            className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
          >
            <PlusCircle size={20} className="mr-2" />
            Add Field
          </button>
        </div>

        {participantFields.map((field) => (
          <div key={field.id} className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between mb-4">
              <div className="flex items-center gap-4">
                <button onClick={() => deleteParticipantField(field.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={20} />
                </button>
              </div>
              <select
                className="border rounded p-1"
                value={field.type}
                onChange={(e) => updateParticipantField(field.id, { type: e.target.value as "text" | "email" })}
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Field Label"
                value={field.label}
                onChange={(e) => updateParticipantField(field.id, { label: e.target.value })}
                className="w-full p-2 border rounded mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateParticipantField(field.id, { required: e.target.checked })}
                  className="mr-2"
                />
                Required Field
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="border rounded-lg p-4">
            <div className="flex justify-between mb-4">
              <div className="flex items-center gap-4">
                <h4 className="font-medium">Question {index + 1}</h4>
                <button onClick={() => deleteQuestion(question.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={20} />
                </button>
              </div>
              <select
                className="border rounded p-1"
                value={question.type}
                onChange={(e) => handleQuestionTypeChange(question.id, e.target.value as Question["type"])}
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="short-answer">Short Answer</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Enter your question"
              value={question.questionText}
              onChange={(e) => handleQuestionTextChange(question.id, e.target.value)}
              className="w-full p-2 border rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            {question.type !== "short-answer" && (
              <div className="space-y-2">
                {question.options.map((option) => (
                  <div key={option.id} className="flex gap-2">
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(question.id, option.id, e.target.value)}
                      placeholder={`Option ${option.id}`}
                      className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      readOnly={question.type === "true-false"}
                    />
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={question.correctAnswer === option.text}
                      onChange={() => handleCorrectAnswerChange(question.id, option.text)}
                      className="mt-3"
                    />
                  </div>
                ))}
              </div>
            )}

            {question.type === "short-answer" && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Enter correct answer"
                  value={question.correctAnswer}
                  onChange={(e) => handleCorrectAnswerChange(question.id, e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={addQuestion}
          className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
        >
          <PlusCircle size={20} className="mr-2" />
          Add Question
        </button>
        <button onClick={handleGenerateQuiz} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Generate Quiz
        </button>
      </div>
    </div>
  )
}

