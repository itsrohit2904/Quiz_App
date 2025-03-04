import { Request, Response } from 'express';
import pool from '../db';

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const { title, description, questions, settings, participantFields } = req.body;
    const userId = req.user?.id;

    const quizResult = await pool.query(
      'INSERT INTO quizzes (user_id, title, description, settings) VALUES ($1, $2, $3, $4) RETURNING id',
      [userId, title, description, JSON.stringify(settings)]
    );

    const quizId = quizResult.rows[0].id;

    for (const question of questions) {
      await pool.query(
        'INSERT INTO questions (quiz_id, type, question_text, options, correct_answer) VALUES ($1, $2, $3, $4, $5)',
        [quizId, question.type, question.questionText, JSON.stringify(question.options), question.correctAnswer]
      );
    }

    for (const field of participantFields) {
      await pool.query(
        'INSERT INTO participant_fields (quiz_id, label, type, required) VALUES ($1, $2, $3, $4)',
        [quizId, field.label, field.type, field.required]
      );
    }

    res.status(201).json({ message: 'Quiz created successfully', quizId });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getQuizzes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await pool.query('SELECT * FROM quizzes WHERE user_id = $1', [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const quizId = req.params.id;

   
    const quizQuery = `
      SELECT id, title, description, created_at, settings
      FROM quizzes
      WHERE id = $1
    `;
    const quizResult = await pool.query(quizQuery, [quizId]);

    if (quizResult.rows.length === 0) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }

    const quizData = quizResult.rows[0];

    const questionsQuery = `
      SELECT id, type, question_text, options, correct_answer
      FROM questions
      WHERE quiz_id = $1
    `;
    const questionsResult = await pool.query(questionsQuery, [quizId]);

    const participantFieldsQuery = `
      SELECT id, label, type, required
      FROM participant_fields
      WHERE quiz_id = $1
    `;
    const participantFieldsResult = await pool.query(participantFieldsQuery, [quizId]);

    const settings = typeof quizData.settings === "string" ? JSON.parse(quizData.settings) : quizData.settings;

    const questions = questionsResult.rows.map((q) => ({
      id: q.id,
      type: q.type,
      questionText: q.question_text, 
      options: typeof q.options === "string" ? JSON.parse(q.options) : q.options, 
      correctAnswer: q.correct_answer,
    }));

    const quiz = {
      id: quizData.id,
      title: quizData.title,
      description: quizData.description,
      createdAt: quizData.created_at,
      settings: settings || {}, 
      questions,
      participantFields: participantFieldsResult.rows.map((field) => ({
        id: field.id,
        label: field.label,
        type: field.type,
        required: field.required,
      })),
    };

    res.status(200).json(quiz);
  } catch (error) {
    console.error(" Error fetching quiz:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const updateQuiz = async (req: Request, res: Response): Promise<any> => {
  try {
    const quizId = req.params.id;
    const { title, description, questions, settings, participantFields } = req.body;
    const userId = (req as any).user?.id;


    const quizResult = await pool.query('SELECT user_id, settings FROM quizzes WHERE id = $1', [quizId]);

    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (quizResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this quiz' });
    }

    const existingSettings = quizResult.rows[0].settings; 


    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      updateValues.push(title);
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateValues.push(description);
    }

    if (settings !== undefined) {
      updateFields.push(`settings = $${paramIndex++}`);
      updateValues.push(JSON.stringify(settings));
    }

    if (updateFields.length > 0) {
      updateValues.push(quizId);
      const updateQuery = `UPDATE quizzes SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
      await pool.query(updateQuery, updateValues);
    }

    if (questions !== undefined) {
      if (!Array.isArray(questions)) {
        return res.status(400).json({ error: 'Invalid questions format. Expected an array.' });
      }
      await pool.query('DELETE FROM questions WHERE quiz_id = $1', [quizId]);
      if (questions.length > 0) {
        const questionValues = questions
          .map((q) => `(${quizId}, '${q.type}', '${q.questionText}', '${JSON.stringify(q.options)}', '${q.correctAnswer}')`)
          .join(',');
        await pool.query(`INSERT INTO questions (quiz_id, type, question_text, options, correct_answer) VALUES ${questionValues}`);
      }
    }

    
    if (participantFields !== undefined) {
      if (!Array.isArray(participantFields)) {
        return res.status(400).json({ error: 'Invalid participant fields format. Expected an array.' });
      }
      await pool.query('DELETE FROM participant_fields WHERE quiz_id = $1', [quizId]);
      if (participantFields.length > 0) {
        const participantValues = participantFields
          .map((f) => `(${quizId}, '${f.label}', '${f.type}', ${f.required})`)
          .join(',');
        await pool.query(`INSERT INTO participant_fields (quiz_id, label, type, required) VALUES ${participantValues}`);
      }
    }

    res.status(200).json({ message: 'Quiz updated successfully' });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



export const deleteQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const quizId = req.params.id;
    const userId = (req as any).user?.id; 

    const quizResult = await pool.query('SELECT user_id FROM quizzes WHERE id = $1', [quizId]);

    if (quizResult.rows.length === 0) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    if (quizResult.rows[0].user_id !== userId) {
      res.status(403).json({ error: 'Unauthorized to delete this quiz' });
      return;
    }

    await pool.query('DELETE FROM participant_fields WHERE quiz_id = $1', [quizId]);
    await pool.query('DELETE FROM questions WHERE quiz_id = $1', [quizId]);
    await pool.query('DELETE FROM quiz_results WHERE quiz_id = $1', [quizId]);
    await pool.query('DELETE FROM quizzes WHERE id = $1', [quizId]);

    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const submitQuizResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const quizId = req.params.id;
    const { participantName, participantEmail, score, answers } = req.body;

   
    if (!quizId || !participantName || !participantEmail || score === undefined) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ error: "Answers array is required and must not be empty" });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

     
      const quizCheck = await client.query(
        "SELECT id FROM quizzes WHERE id = $1",
        [quizId]
      );

      if (quizCheck.rows.length === 0) {
        throw new Error(`Quiz with ID ${quizId} not found`);
      }

      const result = await client.query(
        `INSERT INTO quiz_results (quiz_id, participant_name, participant_email, score) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [quizId, participantName, participantEmail, score]
      );

      const quizResultId = result.rows[0].id;

      
      const answerValues = [];
      const answerQueries = [];
      let paramCount = 1;

      for (const [index, answer] of answers.entries()) {
        const { questionId, participantAnswer } = answer;
        
      
        if (!questionId || participantAnswer === undefined || participantAnswer === null) {
          console.error(`Invalid answer at index ${index}:`, answer);
          throw new Error(`Invalid answer data at index ${index}`);
        }

   
        const questionCheck = await client.query(
          "SELECT id FROM questions WHERE id = $1 AND quiz_id = $2",
          [questionId, quizId]
        );

        if (questionCheck.rows.length === 0) {
          throw new Error(`Question ${questionId} not found or doesn't belong to quiz ${quizId}`);
        }

        answerValues.push(quizResultId, questionId, participantAnswer);
        answerQueries.push(
          `($${paramCount}, $${paramCount + 1}, $${paramCount + 2})`
        );
        paramCount += 3;
      }

      
      if (answerValues.length > 0) {
        const answerInsertQuery = `
          INSERT INTO participant_answers (quiz_result_id, question_id, participant_answer)
          VALUES ${answerQueries.join(", ")}
          RETURNING id`;

        const answerResult = await client.query(answerInsertQuery, answerValues);
        
        if (answerResult.rows.length !== answers.length) {
          throw new Error("Not all answers were inserted successfully");
        }
      }

      await client.query("COMMIT");
      res.status(201).json({ 
        message: "Quiz result and answers submitted successfully",
        quizResultId,
        answersStored: answers.length
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Transaction error:", error);
      res.status(500).json({ 
        error: "Failed to store quiz results", 
        details: error.message 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error submitting quiz result:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: error.message 
    });
  }
};

export const getQuizResults = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      `SELECT 
        qr.id,
        qr.quiz_id as "quizId",
        q.title,
        qr.participant_name as "participantName",
        qr.participant_email as "participantEmail",
        qr.score,
        qr.date
      FROM quiz_results qr 
      JOIN quizzes q ON qr.quiz_id = q.id 
      WHERE q.user_id = $1
      ORDER BY qr.date DESC`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getParticipantAnswers = async (req: Request, res: Response) => {
  try {
    const quizResultId = req.params.resultId;

    const result = await pool.query(
      `SELECT 
        q.question_text AS "question",
        pa.participant_answer AS "participantAnswer",
        q.correct_answer AS "correctAnswer"
      FROM participant_answers pa
      JOIN questions q ON pa.question_id = q.id
      WHERE pa.quiz_result_id = $1`,
      [quizResultId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching participant answers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const previewQuiz = async (req, res) => {
  const { quizId } = req.params;

  try {
    const quizResult = await pool.query(
      `SELECT * FROM quizzes WHERE id = $1`,
      [quizId]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const quiz = quizResult.rows[0];

    const questionsResult = await pool.query(
      `SELECT * FROM questions WHERE quiz_id = $1`,
      [quizId]
    );

    const participantFieldsResult = await pool.query(
      `SELECT * FROM participant_fields WHERE quiz_id = $1`,
      [quizId]
    );

    const formattedQuiz = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      createdAt: quiz.created_at,
      settings: quiz.settings || {},
      questions: questionsResult.rows.map((q) => ({
        id: q.id,
        type: q.type,
        questionText: q.question_text,
        options: Array.isArray(q.options) 
          ? q.options.map(opt => typeof opt === 'object' ? opt.text || String(opt) : String(opt))
          : [],
        correctAnswer: typeof q.correct_answer === 'object' 
          ? q.correct_answer.text || String(q.correct_answer)
          : String(q.correct_answer),
      })),
      participantFields: participantFieldsResult.rows.map((p) => ({
        id: p.id,
        label: p.label,
        type: p.type,
        required: p.required,
      })),
    };

    res.json(formattedQuiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const deleteQuizResult = async (req: Request, res: Response): Promise<void> => {
  const { resultId } = req.params;

  const client = await pool.connect();

  try {
 
    await client.query('BEGIN');

 
    const resultCheck = await client.query("SELECT * FROM quiz_results WHERE id = $1", [resultId]);
    if (resultCheck.rowCount === 0) {
      res.status(404).json({ message: "Quiz result not found" });
      return;
    }

    
    await client.query("DELETE FROM participant_answers WHERE quiz_result_id = $1", [resultId]);

   
    await client.query("DELETE FROM quiz_results WHERE id = $1", [resultId]);

   
    await client.query('COMMIT');

    res.status(200).json({ message: "Quiz result deleted successfully" });
  } catch (error) {
  
    await client.query('ROLLBACK');
    console.error("Error deleting quiz result:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
   
    client.release();
  }
};