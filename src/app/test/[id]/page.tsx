'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Question {
  id: string
  content: string
  type: string
  expectedAnswer?: string
  points: number
}

interface TestData {
  id: string
  title: string
  description: string
  questions: Question[]
}

export default function TakeTest() {
  const params = useParams()
  const testId = params.id as string
  
  const [testData, setTestData] = useState<TestData | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [candidateName, setCandidateName] = useState('')
  const [started, setStarted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Charger depuis localStorage
    try {
      const savedTest = localStorage.getItem(`test_${testId}`)
      if (savedTest) {
        const testConfig = JSON.parse(savedTest)
        setTestData({
          id: testId,
          title: testConfig.objective || 'Test personnalisé',
          description: testConfig.theme || 'Test créé avec l\'IA',
          questions: testConfig.selectedQuestions || []
        })
      } else {
        // Test introuvable
        setTestData(null)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading test:', error)
      setTestData(null)
      setLoading(false)
    }
  }, [testId])

  const handleStart = () => {
    if (!candidateName.trim()) {
      alert('Veuillez entrer votre nom')
      return
    }
    setStarted(true)
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestion < (testData?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Envoyer les réponses pour correction
      const response = await fetch('/api/evaluate-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId,
          candidateName,
          answers,
          testData
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        // Sauvegarder les résultats en localStorage et rediriger
        localStorage.setItem(`result_${data.evaluationId}`, JSON.stringify(data.evaluation))
        window.location.href = `/results/${data.evaluationId}`
      } else {
        alert('Erreur lors de la soumission')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur lors de la soumission')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du test...</p>
        </div>
      </div>
    )
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Test introuvable</h1>
          <p className="text-gray-600">Ce test n'existe pas ou a expiré.</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Test soumis !</h1>
          <p className="text-gray-600 mb-4">
            Merci {candidateName}. Vos réponses sont en cours d'évaluation.
          </p>
          <p className="text-sm text-gray-500">
            Vous recevrez vos résultats bientôt.
          </p>
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{testData.title}</h1>
          <p className="text-gray-600 mb-6">{testData.description}</p>
          
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-4">
              • {testData.questions.length} questions
              • Temps estimé : {Math.ceil(testData.questions.length * 2)} minutes
              • Une seule tentative autorisée
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votre nom
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Entrez votre nom complet"
            />
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Commencer le test
          </button>
        </div>
      </div>
    )
  }

  const currentQ = testData.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / testData.questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestion + 1} sur {testData.questions.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-blue-600">{currentQ.type}</span>
            <span className="text-sm text-gray-500">{currentQ.points} points</span>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQ.content}
          </h2>

          {currentQ.type?.toLowerCase().includes('qcm') || currentQ.type?.toLowerCase().includes('choix') ? (
            <div className="space-y-3">
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                ⚠️ Cette question était prévue comme QCM mais les options ne sont pas disponibles. Répondez en texte libre.
              </div>
              <textarea
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                rows={4}
                placeholder="Tapez votre réponse ici..."
              />
            </div>
          ) : currentQ.type?.toLowerCase().includes('audio') ? (
            <div className="space-y-3">
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                ⚠️ Cette question nécessite un fichier audio qui n'est pas disponible dans ce POC. Répondez selon votre compréhension.
              </div>
              <textarea
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                rows={4}
                placeholder="Répondez selon votre compréhension de la question..."
              />
            </div>
          ) : (
            <textarea
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              rows={6}
              placeholder="Tapez votre réponse ici..."
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Précédent
          </button>

          {currentQuestion === testData.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Soumission...' : 'Terminer le test'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Suivant
            </button>
          )}
        </div>
      </div>
    </div>
  )
}