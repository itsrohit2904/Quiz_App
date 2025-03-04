import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface Answer {
  question: string;
  participantAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface Props {
  participantId: string;
  onClose: () => void;
}

interface TotalScore {
  correct: number;
  total: number;
}

export const ParticipantAnswers: React.FC<Props> = ({ participantId, onClose }) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState<TotalScore>({ correct: 0, total: 0 });

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        setLoading(true);
        setError(null);
    
        const response = await fetch(`http://localhost:3000/api/quiz-results/${participantId}/answers`, {
          credentials: "include",
        });
    
        if (!response.ok) {
          throw new Error("Failed to fetch participant answers");
        }
    
        const data = await response.json();
    
        const processedAnswers = data.map((item: any) => ({
          question: item.question, 
          participantAnswer: item.participantAnswer,
          correctAnswer: item.correctAnswer,
          isCorrect: item.participantAnswer === item.correctAnswer,
        }));
    
        setAnswers(processedAnswers);
    
        const correctAnswers = processedAnswers.filter((answer: Answer) => answer.isCorrect).length;
        setTotalScore({
          correct: correctAnswers,
          total: processedAnswers.length,
        });
      } catch (error) {
        console.error("Error fetching participant answers:", error);
        setError("Failed to load answers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    

    fetchAnswers();
  }, [participantId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-6 text-gray-500">
          Loading answers...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-6 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Participant Answers</h2>
            <p className="text-sm text-gray-500 mt-1">
              Score: {totalScore.correct} out of {totalScore.total} ({Math.round((totalScore.correct / totalScore.total) * 100)}%)
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      <div className="p-6">
        {answers.length === 0 ? (
          <div className="text-center py-6 text-gray-500">No answers available.</div>
        ) : (
          <div className="space-y-6">
            {answers.map((answer, index) => (
              <div 
                key={index} 
                className="border rounded-lg overflow-hidden"
              >
                <div className="bg-gray-50 p-4 border-b">
                  <p className="font-semibold text-gray-900">
                    Question {index + 1}: {answer.question}
                  </p>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 min-w-24">Your answer:</span>
                        <span className={`font-medium ${answer.isCorrect ? "text-green-600" : "text-red-600"}`}>
                          {answer.participantAnswer}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 min-w-24">Correct answer:</span>
                        <span className="font-medium text-green-600">{answer.correctAnswer}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {answer.isCorrect ? (
                        <CheckCircle className="text-green-500 h-6 w-6" />
                      ) : (
                        <XCircle className="text-red-500 h-6 w-6" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};