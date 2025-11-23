import React, { useState, useEffect } from 'react';
import { pastQuestionsAPI } from '../../services/api';
import QuestionItem from './QuestionItem';
import LoadingSpinner from '../common/LoadingSpinner';
import './QuestionList.css';

function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await pastQuestionsAPI.getAll();
      setQuestions(response.data);
    } catch (err) {
      setError('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="questions-container">
      <div className="questions-header">
        <h2>Past Questions</h2>
        <p>Browse through our collection of past examination questions</p>
      </div>
      
      <div className="questions-grid">
        {questions.map(question => (
          <QuestionItem key={question._id} question={question} />
        ))}
      </div>

      {questions.length === 0 && (
        <div className="empty-state">
          <h3>No questions found</h3>
          <p>Be the first to upload a past question!</p>
        </div>
      )}
    </div>
  );
}

export default QuestionList;