import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";


type QuizOption = string | { text: string; [key: string]: any };

interface QuizQuestion {
  id: number;
  type: string;
  questionText: string;
  options: QuizOption[];
  correctAnswer: string | { text: string; [key: string]: any };
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  settings: {
    timeLimit?: number;
    allowRetake?: boolean;
    startDate?: string;
    endDate?: string;
  };
  questions: QuizQuestion[];
}

export const QuizPreview: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/preview/${quizId}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
  
      if (response.status === 401) {
        navigate("/login");
        return;
      }
  
      if (!response.ok) {
        throw new Error(`Failed to fetch quiz: ${response.statusText}`);
      }
  
      const data: Quiz = await response.json();
  
      if (!data || !data.id || !Array.isArray(data.questions)) {
        throw new Error("Invalid quiz data received");
      }
  
      const formattedQuiz: Quiz = {
        ...data,
        settings: data.settings || {},
        questions: data.questions.map((q) => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : [],
        })),
      };
  
      setQuiz(formattedQuiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Quiz not found</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

const safeOptions = currentQuestion.options.map(option => 
  typeof option === 'object' && option !== null
    ? String((option as { text?: string }).text || JSON.stringify(option))
    : String(option)
);

const safeCorrectAnswer = typeof currentQuestion.correctAnswer === 'object' && currentQuestion.correctAnswer !== null
  ? String((currentQuestion.correctAnswer as { text?: string }).text || JSON.stringify(currentQuestion.correctAnswer))
  : String(currentQuestion.correctAnswer);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
          <p className="text-gray-600">{quiz.description}</p>
          <div className="mt-2 text-sm text-gray-500">
            <p>Total Questions: {quiz.questions.length}</p>
            {quiz.settings && (
              <>
                <p>Time Limit: {quiz.settings.timeLimit ?? "N/A"} minutes</p>
                <p>Allow Retake: {quiz.settings.allowRetake ? "Yes" : "No"}</p>
                {quiz.settings.startDate && (
                  <p>Start Date: {new Date(quiz.settings.startDate).toLocaleString()}</p>
                )}
                {quiz.settings.endDate && (
                  <p>End Date: {new Date(quiz.settings.endDate).toLocaleString()}</p>
                )}
              </>
            )}
          </div>
        </div>
        {user && (
          <button
            onClick={() => navigate(`/edit-quiz/${quiz.id}`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Edit2 size={16} className="mr-2" />
            Edit Quiz
          </button>
        )}
      </div>

      <div className="border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </h3>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">{currentQuestion.type}</span>
        </div>
        <p className="text-lg mb-6">{currentQuestion.questionText}</p>

        {currentQuestion.type !== "short-answer" ? (
  <div className="space-y-3">
    {safeOptions.map((option, index) => (
      <div
        key={index}
        className={`p-3 border rounded-lg ${
          option === safeCorrectAnswer ? "border-green-500 bg-green-50" : "border-gray-200"
        }`}
      >
        {option}
        {option === safeCorrectAnswer && (
          <span className="ml-2 text-green-600 text-sm">(Correct Answer)</span>
        )}
      </div>
    ))}
  </div>
) : (
  <div className="border rounded-lg p-4 bg-gray-50">
    <p className="font-medium mb-2">Correct Answer:</p>
    <p>{safeCorrectAnswer}</p>
  </div>
)}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          Previous Question
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => setCurrentQuestionIndex((prev) => Math.min(quiz.questions.length - 1, prev + 1))}
          disabled={currentQuestionIndex === quiz.questions.length - 1}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          Next Question
        </button>
      </div>
    </div>
  );
};
