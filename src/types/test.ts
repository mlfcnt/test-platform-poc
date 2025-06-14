export interface TestConfig {
  id?: string
  // Étape 1: Configuration libre
  objective: string // "Pourquoi ce test ?"
  theme: string // "Quel domaine/sujet ?"
  gradingDescription: string // "Comment noter ? Quel barème ?"
  questionCount: number
  additionalRequirements: string // "Autres spécifications ?"
  
  // Étape 2: Questions générées par IA
  questionPlan?: QuestionPlan
  generatedQuestions?: GeneratedQuestion[]
  selectedQuestions?: GeneratedQuestion[]
  
  // Étape 3: Résultats candidat (description libre)
  candidateResultsDescription: string // "Que montrer au candidat ?"
  
  // Étape 4: Dashboard admin (description libre)
  adminDashboardDescription: string // "Quelles métriques suivre ?"
  
  // Métadonnées
  createdAt?: Date
  shareLink?: string
}

export interface QuestionCategory {
  category: string
  description: string
  suggestedCount: number
  rationale: string
}

export interface QuestionPlan {
  introduction: string
  categories: QuestionCategory[]
  totalQuestions: number
}

export interface GeneratedQuestion {
  id: string
  content: string
  type: string // Déterminé par l'IA
  category: string // Catégorie du plan
  expectedAnswer?: string
  points: number
  aiRationale: string // Pourquoi l'IA a généré cette question
  selected?: boolean // Pour l'UI de sélection
}

export interface TestResult {
  id: string
  testId: string
  candidateName?: string
  answers: Record<string, string>
  aiEvaluation: string // Évaluation libre par l'IA
  score: number
  feedback: string // Feedback généré selon la config
  completedAt: Date
}