import { invoke } from '@tauri-apps/api/core'

export interface Question {
  id: number
  question_text: string
  question_type: 'multiple_choice' | 'text_input' | 'true_false' | 'image_guess' | 'first_letter'
  correct_answer: string
  options?: string[]
  image_url?: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

export interface QuestionSet {
  id: number
  name: string
  description: string
}

export interface CreateQuestionParams {
  question_text: string
  question_type: string
  correct_answer: string
  options?: string[]
  image_url?: string
  difficulty: string
  category: string
}

/**
 * Get all questions from the database
 */
export async function getAllQuestions(): Promise<Question[]> {
  return await invoke<Question[]>('get_all_questions')
}

/**
 * Get all question sets from the database
 */
export async function getAllQuestionSets(): Promise<QuestionSet[]> {
  return await invoke<QuestionSet[]>('get_all_question_sets')
}

/**
 * Get all questions in a specific set
 */
export async function getQuestionsInSet(setId: number): Promise<Question[]> {
  return await invoke<Question[]>('get_questions_in_set', { setId })
}

/**
 * Create a new question
 */
export async function createQuestion(params: CreateQuestionParams): Promise<number> {
  return await invoke<number>('create_question', {
    questionText: params.question_text,
    questionType: params.question_type,
    correctAnswer: params.correct_answer,
    options: params.options,
    imageUrl: params.image_url,
    difficulty: params.difficulty,
    category: params.category,
  })
}

/**
 * Create a new question set
 */
export async function createQuestionSet(name: string, description: string): Promise<number> {
  return await invoke<number>('create_question_set', { name, description })
}

/**
 * Update an existing question set
 */
export async function updateQuestionSet(setId: number, name: string, description: string): Promise<void> {
  return await invoke<void>('update_question_set', { setId, name, description })
}

/**
 * Delete a question set
 */
export async function deleteQuestionSet(setId: number): Promise<void> {
  return await invoke<void>('delete_question_set', { setId })
}

/**
 * Delete a question
 */
export async function deleteQuestion(questionId: number): Promise<void> {
  return await invoke<void>('delete_question', { questionId })
}

/**
 * Add a question to a set
 */
export async function addQuestionToSet(setId: number, questionId: number): Promise<void> {
  return await invoke<void>('add_question_to_set', { setId, questionId })
}

/**
 * Remove a question from a set
 */
export async function removeQuestionFromSet(setId: number, questionId: number): Promise<void> {
  return await invoke<void>('remove_question_from_set', { setId, questionId })
}
