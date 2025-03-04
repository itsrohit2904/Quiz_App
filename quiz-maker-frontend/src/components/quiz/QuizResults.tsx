import type React from "react";
import { useState, useEffect } from "react";
import { EyeIcon, FileTextIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ParticipantAnswers } from "../quiz/ParticipantAnswers";

interface QuizResult {
  id: string;
  quizId: string;
  title: string;
  participantName: string;
  participantEmail: string;
  score: number;
  date: string;
}

export const QuizResults: React.FC = () => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [selectedQuizResults, setSelectedQuizResults] = useState<QuizResult[] | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingResultId, setDeletingResultId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:3000/api/quiz-results", {
          credentials: "include",
        });

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch quiz results");
        }

        const data = await response.json();

        const validatedResults = data.map((result: any) => ({
          id: result.id,
          quizId: result.quizId,
          title: result.title || "Untitled Quiz",
          participantName: result.participantName || "Unknown Participant",
          participantEmail: result.participantEmail || "No email provided",
          score: result.score || 0,
          date: result.date,
        }));

        setResults(
          validatedResults.sort(
            (a: QuizResult, b: QuizResult) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
      } catch (error) {
        console.error("Error fetching quiz results:", error);
        setError("Failed to load quiz results. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [isAuthenticated, navigate]);

  const deleteResult = async (resultId: string) => {
    try {
      setDeletingResultId(resultId);
      setError(null);

      const response = await fetch(`http://localhost:3000/api/quiz-results/${resultId}`, {
        method: "DELETE",
        credentials: "include",
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete quiz result");
      }
  
     
      setResults((prevResults) => {
        const updatedResults = prevResults.filter((result) => result.id !== resultId);
        
        
        if (selectedQuizResults) {
          const updatedSelectedQuizResults = selectedQuizResults.filter((result) => result.id !== resultId);
          setSelectedQuizResults(updatedSelectedQuizResults.length > 0 ? updatedSelectedQuizResults : null);
        }
        
        return updatedResults;
      });
    } catch (error) {
      console.error("Error deleting quiz result:", error);
      setError(error instanceof Error ? error.message : "Failed to delete quiz result. Please try again.");
    } finally {
      setDeletingResultId(null);
    }
  };

  const viewQuizParticipants = (quizId: string) => {
    const quizParticipants = results.filter((result) => result.quizId === quizId);
    setSelectedQuizResults(quizParticipants);
  };

  const closeParticipantView = () => {
    setSelectedQuizResults(null);
  };

  const viewParticipantAnswers = (participantId: string) => {
    setSelectedParticipantId(participantId);
  };

  const closeParticipantAnswers = () => {
    setSelectedParticipantId(null);
  };

  const uniqueQuizzes = Array.from(new Set(results.map((result) => result.quizId))).map((quizId) => {
    const firstResult = results.find((result) => result.quizId === quizId);
    const quizResults = results.filter((result) => result.quizId === quizId);

    return {
      id: quizId,
      title: firstResult?.title || "Untitled Quiz",
      totalParticipants: quizResults.length,
      averageScore: quizResults.length > 0 
        ? Math.round(quizResults.reduce((sum, result) => sum + result.score, 0) / quizResults.length)
        : 0,
    };
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="text-center py-12 text-gray-500">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="text-center py-12 text-red-500">{error}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (selectedParticipantId) {
    return <ParticipantAnswers participantId={selectedParticipantId} onClose={closeParticipantAnswers} />;
  }

  if (selectedQuizResults) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{selectedQuizResults[0].title} - Participants</h2>
          <button onClick={closeParticipantView} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Back to Results
          </button>
        </div>
        <div className="space-y-4">
          {selectedQuizResults.map((result) => (
            <div key={result.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{result.participantName}</p>
                <p className="text-gray-600">{result.participantEmail}</p>
                <p className="font-bold">{`Score: ${result.score}%`}</p>
                <p className="text-sm text-gray-500">Taken on: {new Date(result.date).toLocaleString()}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => viewParticipantAnswers(result.id)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FileTextIcon size={20} />
                </button>
                <button
                  onClick={() => deleteResult(result.id)}
                  disabled={deletingResultId === result.id}
                  className={`px-3 py-1 rounded ${
                    deletingResultId === result.id 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  {deletingResultId === result.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-6">Quiz Results</h2>

      {results.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No quiz results yet.</div>
      ) : (
        <div className="space-y-4">
          {uniqueQuizzes.map((quiz) => (
            <div key={quiz.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3
                  className="text-lg font-semibold cursor-pointer hover:text-blue-600"
                  onClick={() => viewQuizParticipants(quiz.id)}
                >
                  {quiz.title}
                </h3>
                <div className="text-sm text-gray-600">
                  <p>Total Participants: {quiz.totalParticipants}</p>
                  <p>Average Score: {quiz.averageScore}%</p>
                </div>
              </div>
              <button
                onClick={() => viewQuizParticipants(quiz.id)}
                className="text-blue-500 hover:text-blue-700"
              >
                <EyeIcon size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};