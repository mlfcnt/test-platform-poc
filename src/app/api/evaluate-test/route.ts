import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

const EvaluationSchema = z.object({
  overallScore: z.number().min(0).max(100),
  totalPoints: z.number(),
  earnedPoints: z.number(),
  questionEvaluations: z.array(z.object({
    questionId: z.string(),
    score: z.number(),
    feedback: z.string(),
    suggestions: z.string()
  })),
  globalFeedback: z.string(),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  recommendations: z.array(z.string())
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testId, candidateName, answers, testData } = body

    // Construire le prompt d'évaluation
    const questionsAndAnswers = testData.questions.map((q: any) => ({
      question: q.content,
      type: q.type,
      points: q.points,
      candidateAnswer: answers[q.id] || 'Pas de réponse',
      expectedAnswer: q.expectedAnswer
    }))

    const prompt = `Tu es un évaluateur expert. Évalue ce test de manière objective et bienveillante.

CANDIDAT: ${candidateName}
TITRE DU TEST: ${testData.title}
DESCRIPTION: ${testData.description}

QUESTIONS ET RÉPONSES:
${questionsAndAnswers.map((qa, i) => `
Question ${i + 1} (${qa.points} points):
${qa.question}

Réponse du candidat:
${qa.candidateAnswer}

${qa.expectedAnswer ? `Réponse attendue: ${qa.expectedAnswer}` : ''}
`).join('\n---\n')}

CONSIGNES D'ÉVALUATION:
1. Évalue chaque réponse de 0 à la note maximale de la question
2. Sois bienveillant mais objectif
3. Donne des feedbacks constructifs
4. Identifie les points forts et axes d'amélioration
5. Propose des recommandations concrètes
6. Calcule un score global sur 100

Le score global doit refléter la performance générale du candidat.`

    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: EvaluationSchema,
      prompt
    })

    // Sauvegarder le résultat (en prod, sauvegarder en base)
    const evaluation = {
      id: `eval_${Date.now()}`,
      testId,
      candidateName,
      ...result.object,
      completedAt: new Date().toISOString()
    }

    // Pour le POC, on stocke en mémoire (en prod: base de données)
    console.log('Evaluation completed:', evaluation)

    return NextResponse.json({ 
      success: true, 
      evaluationId: evaluation.id,
      evaluation 
    })

  } catch (error) {
    console.error('Error evaluating test:', error)
    return NextResponse.json(
      { error: 'Failed to evaluate test' },
      { status: 500 }
    )
  }
}