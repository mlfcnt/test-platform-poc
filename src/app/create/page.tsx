'use client'

import { useState } from 'react'
import { TestConfig, QuestionPlan, GeneratedQuestion } from '@/types/test'

export default function CreateTest() {
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState<Partial<TestConfig>>({
    objective: '',
    theme: '',
    gradingDescription: '',
    questionCount: 10,
    additionalRequirements: '',
    candidateResultsDescription: '',
    adminDashboardDescription: ''
  })

  const handleNext = () => {
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Étape {step} sur 4</span>
              <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          {step === 1 && (
            <Step1 
              config={config} 
              setConfig={setConfig}
              onNext={handleNext}
            />
          )}
          {step === 2 && (
            <Step2 
              config={config}
              setConfig={setConfig}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {step === 3 && (
            <Step3 
              config={config}
              setConfig={setConfig}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {step === 4 && (
            <Step4 
              config={config}
              setConfig={setConfig}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function Step1({ config, setConfig, onNext }: {
  config: Partial<TestConfig>
  setConfig: (config: Partial<TestConfig>) => void
  onNext: () => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration générale</h2>
        <p className="text-gray-600">Décrivez votre test en langage naturel. L'IA s'adaptera à vos besoins.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Objectif du test
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            rows={3}
            placeholder="Ex: Évaluer le niveau d'anglais technique des développeurs backend pour des missions internationales..."
            value={config.objective}
            onChange={(e) => setConfig({...config, objective: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thème / Domaine
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="Ex: Anglais technique, Python, Management, Marketing digital..."
            value={config.theme}
            onChange={(e) => setConfig({...config, theme: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Système de notation
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            rows={3}
            placeholder="Ex: Barème TOEIC adapté au contexte technique, plus de poids sur la compréhension que la grammaire..."
            value={config.gradingDescription}
            onChange={(e) => setConfig({...config, gradingDescription: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de questions
          </label>
          <input
            type="number"
            min="5"
            max="50"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            value={config.questionCount}
            onChange={(e) => setConfig({...config, questionCount: parseInt(e.target.value)})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Spécifications supplémentaires
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            rows={3}
            placeholder="Ex: Inclure des questions sur les APIs REST, éviter les questions trop académiques, adapter au niveau junior/senior..."
            value={config.additionalRequirements}
            onChange={(e) => setConfig({...config, additionalRequirements: e.target.value})}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!config.objective || !config.theme}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Générer les questions
        </button>
      </div>
    </div>
  )
}

function Step2({ config, setConfig, onNext, onBack }: {
  config: Partial<TestConfig>
  setConfig: (config: Partial<TestConfig>) => void
  onNext: () => void
  onBack: () => void
}) {
  const [questionPlan, setQuestionPlan] = useState<QuestionPlan | null>(null)
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<GeneratedQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [regenerationFeedback, setRegenerationFeedback] = useState('')
  const [showRegenerationForm, setShowRegenerationForm] = useState(false)
  const [regeneratingQuestionId, setRegeneratingQuestionId] = useState<string | null>(null)

  const generateQuestions = async (feedback?: string) => {
    setLoading(true)
    try {
      const requestBody = {
        ...config,
        regenerationFeedback: feedback
      }
      
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate questions')
      }
      
      const data = await response.json()
      setQuestionPlan(data.plan)
      setQuestions(data.questions)
      setGenerated(true)
      setShowRegenerationForm(false)
      setRegenerationFeedback('')
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur lors de la génération des questions')
    } finally {
      setLoading(false)
    }
  }

  const regenerateQuestion = async (questionId: string, feedback: string) => {
    setRegeneratingQuestionId(questionId)
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...config,
          regenerateSpecificQuestion: true,
          questionToReplace: questions.find(q => q.id === questionId),
          regenerationFeedback: feedback
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to regenerate question')
      }
      
      const data = await response.json()
      // Remplacer la question dans la liste
      setQuestions(questions.map(q => 
        q.id === questionId ? data.questions[0] : q
      ))
      
      // Si la question était sélectionnée, la remplacer aussi dans les sélections
      if (selectedQuestions.some(q => q.id === questionId)) {
        setSelectedQuestions(selectedQuestions.map(q => 
          q.id === questionId ? data.questions[0] : q
        ))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur lors de la régénération de la question')
    } finally {
      setRegeneratingQuestionId(null)
    }
  }

  const addQuestion = (question: GeneratedQuestion) => {
    setSelectedQuestions([...selectedQuestions, question])
  }

  const removeQuestion = (questionId: string) => {
    setSelectedQuestions(selectedQuestions.filter(q => q.id !== questionId))
  }

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = selectedQuestions.findIndex(q => q.id === questionId)
    if (currentIndex === -1) return
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= selectedQuestions.length) return
    
    const newSelectedQuestions = [...selectedQuestions]
    const [movedQuestion] = newSelectedQuestions.splice(currentIndex, 1)
    newSelectedQuestions.splice(newIndex, 0, movedQuestion)
    setSelectedQuestions(newSelectedQuestions)
  }

  // Grouper les questions par catégorie
  const questionsByCategory = questions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = []
    }
    acc[question.category].push(question)
    return acc
  }, {} as Record<string, GeneratedQuestion[]>)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan de test et questions</h2>
        <p className="text-gray-600">L'IA propose un plan structuré pour votre test. Ajoutez les questions qui vous conviennent.</p>
      </div>

      {!generated ? (
        <div className="text-center py-8">
          <button
            onClick={generateQuestions}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            {loading ? 'Génération en cours...' : 'Générer le plan et les questions'}
          </button>
        </div>
      ) : (
        <>
          {/* Actions pour régénérer le plan */}
          {!showRegenerationForm ? (
            <div className="flex justify-between items-center mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <p className="text-sm text-yellow-800">
                  Ce plan ne vous convient pas ? Vous pouvez en générer un nouveau.
                </p>
              </div>
              <button
                onClick={() => setShowRegenerationForm(true)}
                disabled={loading}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Modifier le plan
              </button>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-3">Que souhaitez-vous changer dans ce plan ?</h4>
              <textarea
                value={regenerationFeedback}
                onChange={(e) => setRegenerationFeedback(e.target.value)}
                className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 mb-3"
                rows={3}
                placeholder="Ex: Je voudrais plus de questions pratiques et moins de théorie, ajouter des questions sur les frameworks modernes, réduire la difficulté..."
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => generateQuestions(regenerationFeedback)}
                  disabled={loading || !regenerationFeedback.trim()}
                  className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Régénération...' : 'Générer un nouveau plan'}
                </button>
                <button
                  onClick={() => {
                    setShowRegenerationForm(false)
                    setRegenerationFeedback('')
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan proposé par l'IA */}
          <div className="lg:col-span-2 space-y-6">
            {questionPlan && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Plan proposé par l'IA</h3>
                <p className="text-blue-800 mb-4">{questionPlan.introduction}</p>
                <div className="space-y-3">
                  {questionPlan.categories.map((category, index) => (
                    <div key={index} className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{category.category}</h4>
                        <span className="text-sm text-gray-600">{category.suggestedCount} questions</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{category.description}</p>
                      <p className="text-xs text-gray-500">{category.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions par catégorie */}
            <div className="space-y-6">
              {Object.entries(questionsByCategory).map(([category, categoryQuestions]) => (
                <div key={category} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    {category} ({categoryQuestions.length} questions disponibles)
                  </h3>
                  {categoryQuestions.map((question) => {
                    const isSelected = selectedQuestions.some(q => q.id === question.id)
                    const isRegenerating = regeneratingQuestionId === question.id
                    return (
                      <QuestionCard 
                        key={question.id}
                        question={question}
                        isSelected={isSelected}
                        isRegenerating={isRegenerating}
                        onAdd={() => addQuestion(question)}
                        onRegenerate={regenerateQuestion}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Récapitulatif des questions sélectionnées */}
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Questions sélectionnées ({selectedQuestions.length})
              </h3>
              
              {selectedQuestions.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucune question sélectionnée</p>
              ) : (
                <div className="space-y-3">
                  {selectedQuestions.map((question, index) => (
                    <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-blue-600">{question.category}</span>
                            <span className="text-xs text-gray-500">{question.points}pts</span>
                          </div>
                          <p className="text-sm text-gray-900 line-clamp-2">{question.content}</p>
                        </div>
                        <div className="flex flex-col ml-2 space-y-1">
                          <button
                            onClick={() => moveQuestion(question.id, 'up')}
                            disabled={index === 0}
                            className="text-xs px-1 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => removeQuestion(question.id)}
                            className="text-xs px-1 py-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                          <button
                            onClick={() => moveQuestion(question.id, 'down')}
                            disabled={index === selectedQuestions.length - 1}
                            className="text-xs px-1 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Retour
        </button>
        <button
          onClick={() => {
            setConfig({...config, questionPlan, selectedQuestions})
            onNext()
          }}
          disabled={!generated || selectedQuestions.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Continuer ({selectedQuestions.length} questions)
        </button>
      </div>
    </div>
  )
}

function QuestionCard({ question, isSelected, isRegenerating, onAdd, onRegenerate }: {
  question: GeneratedQuestion
  isSelected: boolean
  isRegenerating: boolean
  onAdd: () => void
  onRegenerate: (questionId: string, feedback: string) => void
}) {
  const [showRegenerationForm, setShowRegenerationForm] = useState(false)
  const [regenerationFeedback, setRegenerationFeedback] = useState('')

  const handleRegenerate = () => {
    if (regenerationFeedback.trim()) {
      onRegenerate(question.id, regenerationFeedback)
      setShowRegenerationForm(false)
      setRegenerationFeedback('')
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-600">{question.type}</span>
            <span className="text-sm text-gray-500">{question.points} points</span>
          </div>
          <p className="text-gray-900 mb-2">{question.content}</p>
          {question.expectedAnswer && (
            <p className="text-sm text-green-700 bg-green-50 p-2 rounded mb-2">
              <strong>Réponse attendue :</strong> {question.expectedAnswer}
            </p>
          )}
          <p className="text-xs text-gray-500 mb-3">
            <strong>Justification :</strong> {question.aiRationale}
          </p>
          
          {/* Formulaire de régénération */}
          {showRegenerationForm && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <h5 className="text-sm font-medium text-orange-800 mb-2">Que voulez-vous changer dans cette question ?</h5>
              <textarea
                value={regenerationFeedback}
                onChange={(e) => setRegenerationFeedback(e.target.value)}
                className="w-full p-2 border border-orange-300 rounded text-sm mb-2"
                rows={2}
                placeholder="Ex: Rendre plus pratique, changer le niveau de difficulté, modifier le format..."
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating || !regenerationFeedback.trim()}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-xs font-medium py-1 px-3 rounded transition-colors"
                >
                  {isRegenerating ? 'Génération...' : 'Générer nouvelle question'}
                </button>
                <button
                  onClick={() => {
                    setShowRegenerationForm(false)
                    setRegenerationFeedback('')
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium py-1 px-3 rounded transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="ml-4 flex flex-col space-y-2">
          <button
            onClick={onAdd}
            disabled={isSelected}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isSelected 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSelected ? 'Ajoutée' : 'Ajouter'}
          </button>
          <button
            onClick={() => setShowRegenerationForm(!showRegenerationForm)}
            disabled={isRegenerating}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-orange-100 hover:bg-orange-200 text-orange-700 transition-colors"
          >
            {showRegenerationForm ? 'Fermer' : 'Nouvelle question'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Step3({ config, setConfig, onNext, onBack }: {
  config: Partial<TestConfig>
  setConfig: (config: Partial<TestConfig>) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Résultats pour le candidat</h2>
        <p className="text-gray-600">Que voulez-vous montrer au candidat après qu'il ait passé le test ?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Informations à afficher
        </label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          rows={4}
          placeholder="Ex: Score global, détail par compétence, recommandations d'amélioration, comparaison avec la moyenne des candidats, suggestions de formation..."
          value={config.candidateResultsDescription}
          onChange={(e) => setConfig({...config, candidateResultsDescription: e.target.value})}
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Retour
        </button>
        <button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Continuer
        </button>
      </div>
    </div>
  )
}

function Step4({ config, setConfig, onBack }: {
  config: Partial<TestConfig>
  setConfig: (config: Partial<TestConfig>) => void
  onBack: () => void
}) {
  const [testCreated, setTestCreated] = useState(false)
  const [testLink, setTestLink] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFinish = async () => {
    setLoading(true)
    try {
      // Générer un ID unique pour le test
      const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Sauvegarder dans localStorage
      const testData = {
        id: testId,
        ...config,
        createdAt: new Date().toISOString()
      }
      
      localStorage.setItem(`test_${testId}`, JSON.stringify(testData))
      console.log('Test sauvegardé:', testData)
      
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const link = `${window.location.origin}/test/${testId}`
      setTestLink(link)
      setTestCreated(true)
    } catch (error) {
      console.error('Error creating test:', error)
      alert('Erreur lors de la création du test')
    } finally {
      setLoading(false)
    }
  }

  if (testCreated) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Test créé avec succès !</h2>
          <p className="text-gray-600 mb-6">Votre test est maintenant prêt à être partagé</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-800 mb-3">Lien de partage</h3>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={testLink}
              readOnly
              className="flex-1 p-3 border border-blue-300 rounded-lg bg-white text-sm"
            />
            <button
              onClick={() => navigator.clipboard.writeText(testLink)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
            >
              Copier
            </button>
          </div>
          <p className="text-sm text-blue-700 mt-2">
            Partagez ce lien avec vos candidats pour qu'ils puissent passer le test
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => window.open(testLink, '_blank')}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Tester le lien
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Créer un nouveau test
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard administrateur</h2>
        <p className="text-gray-600">Quelles métriques voulez-vous suivre pour analyser les résultats ?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tableaux de bord et analytics
        </label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          rows={4}
          placeholder="Ex: Moyenne d'équipe, taux de réussite par département, évolution des compétences, identification des gaps de formation, benchmarks sectoriels..."
          value={config.adminDashboardDescription}
          onChange={(e) => setConfig({...config, adminDashboardDescription: e.target.value})}
        />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-800 mb-2">Récapitulatif</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• <strong>Objectif:</strong> {config.objective}</li>
          <li>• <strong>Thème:</strong> {config.theme}</li>
          <li>• <strong>Questions:</strong> {config.questionCount}</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Retour
        </button>
        <button
          onClick={handleFinish}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Création en cours...' : 'Créer le test'}
        </button>
      </div>
    </div>
  )
}