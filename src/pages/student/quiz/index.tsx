import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Clock, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

function QuizTest() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds
  const [showResults, setShowResults] = useState(false);

  const quiz = {
    title: 'Midterm Exam',
    course: 'Software Engineering',
    duration: 90,
    totalQuestions: 10
  };

  const questions = [
    {
      id: 1,
      question: 'Which of the following is NOT a creational design pattern?',
      options: ['Singleton', 'Factory', 'Observer', 'Prototype'],
      correct: 2
    },
    {
      id: 2,
      question: 'What is the main purpose of the MVC pattern?',
      options: ['Data encryption', 'Separation of concerns', 'Performance optimization', 'Memory management'],
      correct: 1
    },
    {
      id: 3,
      question: 'Which SOLID principle does the following statement describe: "A class should have only one reason to change"?',
      options: ['Open/Closed Principle', 'Single Responsibility Principle', 'Liskov Substitution Principle', 'Interface Segregation Principle'],
      correct: 1
    },
    {
      id: 4,
      question: 'What type of relationship does inheritance represent in UML?',
      options: ['Association', 'Composition', 'Generalization', 'Aggregation'],
      correct: 2
    },
    {
      id: 5,
      question: 'Which testing approach tests individual units of code in isolation?',
      options: ['Integration Testing', 'System Testing', 'Unit Testing', 'Acceptance Testing'],
      correct: 2
    },
    {
      id: 6,
      question: 'What is the purpose of the Abstract Factory pattern?',
      options: ['To create a single instance', 'To create families of related objects', 'To observe changes', 'To adapt interfaces'],
      correct: 1
    },
    {
      id: 7,
      question: 'Which Agile methodology uses sprints?',
      options: ['Kanban', 'XP', 'Scrum', 'Lean'],
      correct: 2
    },
    {
      id: 8,
      question: 'What does the "D" in SOLID stand for?',
      options: ['Dependency Inversion', 'Data Abstraction', 'Dynamic Binding', 'Distributed Computing'],
      correct: 0
    },
    {
      id: 9,
      question: 'Which diagram shows the sequence of messages between objects?',
      options: ['Class Diagram', 'Use Case Diagram', 'Sequence Diagram', 'State Diagram'],
      correct: 2
    },
    {
      id: 10,
      question: 'What is continuous integration?',
      options: ['Manual code review', 'Automated building and testing of code changes', 'Database optimization', 'User interface design'],
      correct: 1
    }
  ];

  useEffect(() => {
    if (timeLeft <= 0 || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResults]);

  useEffect(() => {
    if (timeLeft <= 0 && !showResults) {
      handleSubmit();
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct) correct++;
    });
    return Math.round((correct / questions.length) * 100);
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
            score >= 70 ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <CheckCircle className={`w-12 h-12 ${score >= 70 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          <h1 className="text-2xl font-bold text-[#0A1B3C] mb-2">Quiz Completed!</h1>
          <p className="text-gray-600 mb-6">{quiz.title}</p>
          <div className={`text-5xl font-bold mb-2 ${score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
            {score}%
          </div>
          <p className="text-gray-500 mb-8">
            You answered {Object.keys(answers).filter(k => answers[parseInt(k)] === questions.find(q => q.id === parseInt(k))?.correct).length} out of {questions.length} questions correctly
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => navigate('/student/course-details')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
            >
              Back to Course
            </button>
            <button 
              onClick={() => navigate('/student/courses')}
              className="px-6 py-3 bg-[#F37022] text-white rounded-lg font-semibold hover:bg-[#D96419]"
            >
              View All Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="p-4 md:p-6">
      {/* Timer Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0A1B3C]">{quiz.title}</h1>
          <p className="text-sm text-gray-600">{quiz.course}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${
          timeLeft <= 300 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
        }`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-6">
              <span className="text-sm text-orange-600 font-medium">Question {currentQuestion + 1} of {questions.length}</span>
              <h2 className="text-xl font-bold text-[#0A1B3C] mt-2">{currentQ.question}</h2>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(currentQ.id, index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    answers[currentQ.id] === index
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`inline-block w-8 h-8 rounded-full mr-3 text-center leading-8 ${
                    answers[currentQ.id] === index
                      ? 'bg-[#F37022] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                  className="flex items-center gap-2 px-4 py-2 bg-[#F37022] text-white rounded-lg font-medium hover:bg-[#D96419]"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-[#0A1B3C] mb-4">Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-lg font-medium text-sm ${
                    currentQuestion === index
                      ? 'bg-[#F37022] text-white'
                      : answers[q.id] !== undefined
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{Object.keys(answers).length}</span> of {questions.length} answered
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizTest;
