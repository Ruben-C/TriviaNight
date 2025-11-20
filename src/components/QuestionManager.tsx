import { useState, useEffect } from 'react'
import { getAllQuestions, getAllQuestionSets, createQuestion, createQuestionSet, type Question, type QuestionSet, type CreateQuestionParams } from '../api/questions'

export default function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([])
  const [showCreateQuestion, setShowCreateQuestion] = useState(false)
  const [showCreateSet, setShowCreateSet] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form state for new question
  const [newQuestion, setNewQuestion] = useState<CreateQuestionParams>({
    question_text: '',
    question_type: 'multiple_choice',
    correct_answer: '',
    options: ['', '', '', ''],
    difficulty: 'medium',
    category: 'General',
  })

  // Form state for new set
  const [newSet, setNewSet] = useState({ name: '', description: '' })

  useEffect(() => {
    loadQuestions()
    loadQuestionSets()
  }, [])

  async function loadQuestions() {
    try {
      const data = await getAllQuestions()
      setQuestions(data)
    } catch (err) {
      console.error('Failed to load questions:', err)
    }
  }

  async function loadQuestionSets() {
    try {
      const data = await getAllQuestionSets()
      setQuestionSets(data)
    } catch (err) {
      console.error('Failed to load question sets:', err)
    }
  }

  async function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      // Filter empty options for multiple choice
      const options = newQuestion.question_type === 'multiple_choice'
        ? newQuestion.options?.filter(o => o.trim() !== '')
        : undefined

      await createQuestion({
        ...newQuestion,
        options,
      })

      // Reset form
      setNewQuestion({
        question_text: '',
        question_type: 'multiple_choice',
        correct_answer: '',
        options: ['', '', '', ''],
        difficulty: 'medium',
        category: 'General',
      })

      setShowCreateQuestion(false)
      await loadQuestions()
    } catch (err) {
      console.error('Failed to create question:', err)
      alert('Failed to create question: ' + err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateSet(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await createQuestionSet(newSet.name, newSet.description)
      setNewSet({ name: '', description: '' })
      setShowCreateSet(false)
      await loadQuestionSets()
    } catch (err) {
      console.error('Failed to create question set:', err)
      alert('Failed to create question set: ' + err)
    } finally {
      setLoading(false)
    }
  }

  function updateOption(index: number, value: string) {
    const newOptions = [...(newQuestion.options || [])]
    newOptions[index] = value
    setNewQuestion({ ...newQuestion, options: newOptions })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Question Management</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateSet(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
          >
            + New Set
          </button>
          <button
            onClick={() => setShowCreateQuestion(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            + New Question
          </button>
        </div>
      </div>

      {/* Question Sets */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Question Sets ({questionSets.length})</h3>
        {questionSets.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No question sets yet. Create one to get started!</p>
        ) : (
          <div className="grid gap-3">
            {questionSets.map((set) => (
              <div
                key={set.id}
                className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                <h4 className="font-bold text-white">{set.name}</h4>
                <p className="text-sm text-gray-400">{set.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">All Questions ({questions.length})</h3>
        {questions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No questions yet. Create your first question!</p>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q.id}
                className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-white">{q.question_text}</p>
                  <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded">
                    {q.question_type}
                  </span>
                </div>
                <div className="flex gap-3 text-sm text-gray-400">
                  <span>Answer: {q.correct_answer}</span>
                  <span>•</span>
                  <span>{q.difficulty}</span>
                  <span>•</span>
                  <span>{q.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Question Modal */}
      {showCreateQuestion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">Create New Question</h3>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              {/* Question Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Question Type
                </label>
                <select
                  value={newQuestion.question_type}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="text_input">Text Input</option>
                  <option value="true_false">True/False</option>
                </select>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Question
                </label>
                <textarea
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>

              {/* Options for Multiple Choice */}
              {newQuestion.question_type === 'multiple_choice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Answer Options
                  </label>
                  <div className="space-y-2">
                    {[0, 1, 2, 3].map((i) => (
                      <input
                        key={i}
                        type="text"
                        value={newQuestion.options?.[i] || ''}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Correct Answer */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Correct Answer
                </label>
                {newQuestion.question_type === 'multiple_choice' ? (
                  <select
                    value={newQuestion.correct_answer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Select correct answer</option>
                    {newQuestion.options?.filter(o => o.trim()).map((option, i) => (
                      <option key={i} value={option}>{option}</option>
                    ))}
                  </select>
                ) : newQuestion.question_type === 'true_false' ? (
                  <select
                    value={newQuestion.correct_answer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Select answer</option>
                    <option value="True">True</option>
                    <option value="False">False</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={newQuestion.correct_answer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                )}
              </div>

              {/* Category and Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Question'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateQuestion(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Set Modal */}
      {showCreateSet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">Create New Question Set</h3>

            <form onSubmit={handleCreateSet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Set Name
                </label>
                <input
                  type="text"
                  value={newSet.name}
                  onChange={(e) => setNewSet({ ...newSet, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newSet.description}
                  onChange={(e) => setNewSet({ ...newSet, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Set'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateSet(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
