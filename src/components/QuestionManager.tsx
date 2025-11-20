import { useState, useEffect } from 'react'
import {
  getAllQuestions,
  getAllQuestionSets,
  getQuestionsInSet,
  createQuestion,
  createQuestionSet,
  updateQuestionSet,
  deleteQuestionSet,
  deleteQuestion,
  addQuestionToSet,
  removeQuestionFromSet,
  type Question,
  type QuestionSet,
  type CreateQuestionParams,
} from '../api/questions'

export default function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([])
  const [showCreateQuestion, setShowCreateQuestion] = useState(false)
  const [showCreateSet, setShowCreateSet] = useState(false)
  const [showEditSet, setShowEditSet] = useState(false)
  const [showManageSet, setShowManageSet] = useState(false)
  const [selectedSet, setSelectedSet] = useState<QuestionSet | null>(null)
  const [questionsInSet, setQuestionsInSet] = useState<Question[]>([])
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

  // Form state for new/edit set
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

  async function loadSetQuestions(setId: number) {
    try {
      const data = await getQuestionsInSet(setId)
      setQuestionsInSet(data)
    } catch (err) {
      console.error('Failed to load set questions:', err)
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

  async function handleUpdateSet(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSet) return

    setLoading(true)
    try {
      await updateQuestionSet(selectedSet.id, newSet.name, newSet.description)
      setShowEditSet(false)
      setSelectedSet(null)
      setNewSet({ name: '', description: '' })
      await loadQuestionSets()
    } catch (err) {
      console.error('Failed to update set:', err)
      alert('Failed to update set: ' + err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteSet(setId: number) {
    if (!confirm('Are you sure you want to delete this set? This will not delete the questions themselves.')) return

    setLoading(true)
    try {
      await deleteQuestionSet(setId)
      await loadQuestionSets()
    } catch (err) {
      console.error('Failed to delete set:', err)
      alert('Failed to delete set: ' + err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteQuestion(questionId: number) {
    if (!confirm('Are you sure you want to delete this question?')) return

    setLoading(true)
    try {
      await deleteQuestion(questionId)
      await loadQuestions()
      if (selectedSet) {
        await loadSetQuestions(selectedSet.id)
      }
    } catch (err) {
      console.error('Failed to delete question:', err)
      alert('Failed to delete question: ' + err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddQuestionToSet(questionId: number) {
    if (!selectedSet) return

    setLoading(true)
    try {
      await addQuestionToSet(selectedSet.id, questionId)
      await loadSetQuestions(selectedSet.id)
    } catch (err) {
      console.error('Failed to add question to set:', err)
      alert('Failed to add question to set: ' + err)
    } finally {
      setLoading(false)
    }
  }

  async function handleRemoveQuestionFromSet(questionId: number) {
    if (!selectedSet) return

    setLoading(true)
    try {
      await removeQuestionFromSet(selectedSet.id, questionId)
      await loadSetQuestions(selectedSet.id)
    } catch (err) {
      console.error('Failed to remove question from set:', err)
      alert('Failed to remove question from set: ' + err)
    } finally {
      setLoading(false)
    }
  }

  function openEditSet(set: QuestionSet) {
    setSelectedSet(set)
    setNewSet({ name: set.name, description: set.description })
    setShowEditSet(true)
  }

  function openManageSet(set: QuestionSet) {
    setSelectedSet(set)
    loadSetQuestions(set.id)
    setShowManageSet(true)
  }

  function updateOption(index: number, value: string) {
    const newOptions = [...(newQuestion.options || [])]
    newOptions[index] = value
    setNewQuestion({ ...newQuestion, options: newOptions })
  }

  const questionTypesDisplay: Record<string, string> = {
    multiple_choice: 'Multiple Choice',
    text_input: 'Text Input',
    true_false: 'True/False',
    first_letter: 'First Letter',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Question Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateQuestion(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            + New Question
          </button>
          <button
            onClick={() => setShowCreateSet(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            + New Set
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Question Sets */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">Question Sets</h3>
          {questionSets.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No question sets yet</p>
          ) : (
            <div className="space-y-2">
              {questionSets.map((set) => (
                <div
                  key={set.id}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{set.name}</h4>
                      <p className="text-sm text-gray-400">{set.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openManageSet(set)}
                        className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => openEditSet(set)}
                        className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSet(set.id)}
                        className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Questions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">All Questions ({questions.length})</h3>
          {questions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No questions yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <p className="text-white text-sm mb-2">{q.question_text}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                        {questionTypesDisplay[q.question_type] || q.question_type}
                      </span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                        {q.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded">
                        {q.category}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Question Modal */}
      {showCreateQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Create New Question</h3>
            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Question Text</label>
                <textarea
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Question Type</label>
                <select
                  value={newQuestion.question_type}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="text_input">Text Input</option>
                  <option value="true_false">True/False</option>
                  <option value="first_letter">First Letter</option>
                </select>
              </div>

              {newQuestion.question_type === 'first_letter' && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300">
                    In "First Letter" mode, players can answer with either:
                    <br/>• The first letter of the answer (e.g., "P" for "Paris")
                    <br/>• The complete answer (e.g., "Paris")
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Correct Answer</label>
                <input
                  type="text"
                  value={newQuestion.correct_answer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {newQuestion.question_type === 'multiple_choice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Options</label>
                  {newQuestion.options?.map((option, i) => (
                    <input
                      key={i}
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 mb-2"
                    />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
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
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <input
                    type="text"
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateQuestion(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Set Modal */}
      {(showCreateSet || showEditSet) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">
              {showEditSet ? 'Edit Set' : 'Create New Question Set'}
            </h3>
            <form onSubmit={showEditSet ? handleUpdateSet : handleCreateSet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Set Name</label>
                <input
                  type="text"
                  value={newSet.name}
                  onChange={(e) => setNewSet({ ...newSet, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newSet.description}
                  onChange={(e) => setNewSet({ ...newSet, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateSet(false)
                    setShowEditSet(false)
                    setNewSet({ name: '', description: '' })
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (showEditSet ? 'Update Set' : 'Create Set')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Set Modal */}
      {showManageSet && selectedSet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Manage Set: {selectedSet.name}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Questions in Set */}
              <div>
                <h4 className="text-lg font-bold text-white mb-3">Questions in This Set ({questionsInSet.length})</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {questionsInSet.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No questions in this set yet</p>
                  ) : (
                    questionsInSet.map((q) => (
                      <div key={q.id} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-white text-sm mb-2">{q.question_text}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                            {questionTypesDisplay[q.question_type]}
                          </span>
                          <button
                            onClick={() => handleRemoveQuestionFromSet(q.id)}
                            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Available Questions */}
              <div>
                <h4 className="text-lg font-bold text-white mb-3">Add Questions</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {questions
                    .filter((q) => !questionsInSet.find((sq) => sq.id === q.id))
                    .map((q) => (
                      <div key={q.id} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-white text-sm mb-2">{q.question_text}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                            {questionTypesDisplay[q.question_type]}
                          </span>
                          <button
                            onClick={() => handleAddQuestionToSet(q.id)}
                            disabled={loading}
                            className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowManageSet(false)
                  setSelectedSet(null)
                  setQuestionsInSet([])
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
