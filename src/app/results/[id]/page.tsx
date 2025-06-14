'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface QuestionEvaluation {
  questionId: string
  score: number
  feedback: string
  suggestions: string
}

interface TestResult {
  id: string
  testId: string
  candidateName: string
  overallScore: number
  totalPoints: number
  earnedPoints: number
  questionEvaluations: QuestionEvaluation[]
  globalFeedback: string
  strengths: string[]
  areasForImprovement: string[]
  recommendations: string[]
  completedAt: string
}

export default function TestResults() {
  const params = useParams()
  const resultId = params.id as string
  
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Charger depuis localStorage
    try {
      const savedResult = localStorage.getItem(`result_${resultId}`)
      if (savedResult) {
        const resultData = JSON.parse(savedResult)
        setResult(resultData)
      } else {
        // Résultats introuvables
        setResult(null)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading results:', error)
      setResult(null)
      setLoading(false)
    }
  }, [resultId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des résultats...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Résultats introuvables</h1>
          <p className="text-gray-600">Ces résultats n'existent pas ou ont expiré.</p>
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Bon'
    if (score >= 40) return 'Passable'
    return 'À améliorer'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Résultats du test
            </h1>
            <p className="text-gray-600 mb-6">
              Candidat : <span className="font-medium">{result.candidateName}</span>
            </p>
            
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className={`text-4xl font-bold rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-2 ${getScoreColor(result.overallScore)}`}>
                  {result.overallScore}%
                </div>
                <p className="text-sm text-gray-600">{getScoreLabel(result.overallScore)}</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {result.earnedPoints}/{result.totalPoints}
                </div>
                <p className="text-sm text-gray-600">Points obtenus</p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Feedback */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Évaluation générale</h2>
          <p className="text-gray-700 leading-relaxed">{result.globalFeedback}</p>
        </div>

        {/* Question Details */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Détail par question</h2>
          <div className="space-y-6">
            {result.questionEvaluations.map((evaluation, index) => (
              <div key={evaluation.questionId} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Question {index + 1}</h3>
                  <span className="text-sm font-medium text-blue-600">{evaluation.score} points</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Feedback</h4>
                    <p className="text-gray-600 text-sm">{evaluation.feedback}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Suggestions</h4>
                    <p className="text-gray-600 text-sm">{evaluation.suggestions}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Areas for Improvement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-bold text-green-800 mb-4">Points forts</h2>
            <ul className="space-y-2">
              {result.strengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-bold text-orange-800 mb-4">Axes d'amélioration</h2>
            <ul className="space-y-2">
              {result.areasForImprovement.map((area, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Recommandations</h2>
          <ul className="space-y-3">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="text-center">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors mr-4"
          >
            Imprimer les résultats
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}