import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

const QuestionCategorySchema = z.object({
  category: z.string(),
  description: z.string(),
  suggestedCount: z.number(),
  rationale: z.string()
})

const QuestionSchema = z.object({
  id: z.string(),
  content: z.string(),
  type: z.string(),
  category: z.string(),
  expectedAnswer: z.string().optional(),
  points: z.number(),
  aiRationale: z.string()
})

const QuestionsResponseSchema = z.object({
  plan: z.object({
    introduction: z.string(),
    categories: z.array(QuestionCategorySchema),
    totalQuestions: z.number()
  }),
  questions: z.array(QuestionSchema)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      objective, 
      theme, 
      gradingDescription, 
      questionCount, 
      additionalRequirements,
      regenerationFeedback,
      regenerateSpecificQuestion,
      questionToReplace
    } = body

    let prompt = ''
    let responseSchema = QuestionsResponseSchema

    if (regenerateSpecificQuestion && questionToReplace) {
      // Régénération d'une question spécifique
      prompt = `Tu es un expert en création de tests éducatifs et professionnels.

Génère UNE SEULE nouvelle question pour remplacer celle-ci :

QUESTION À REMPLACER :
- Contenu : ${questionToReplace.content}
- Type : ${questionToReplace.type}
- Catégorie : ${questionToReplace.category}
- Points : ${questionToReplace.points}

CONTEXTE DU TEST :
- Objectif : ${objective}
- Thème : ${theme}
- Système de notation : ${gradingDescription}

FEEDBACK UTILISATEUR : ${regenerationFeedback}

Génère une nouvelle question dans la même catégorie (${questionToReplace.category}) mais qui prend en compte le feedback utilisateur.
La nouvelle question doit :
1. Rester dans la même catégorie
2. Avoir un niveau de difficulté similaire
3. Respecter le feedback fourni
4. Avoir un id unique

Retourne uniquement cette nouvelle question dans le format attendu.`

      // Schema simplifié pour une seule question
      responseSchema = z.object({
        plan: z.object({
          introduction: z.string(),
          categories: z.array(QuestionCategorySchema),
          totalQuestions: z.number()
        }),
        questions: z.array(QuestionSchema).length(1)
      })
    } else {
      // Génération complète ou régénération du plan
      const regenerationContext = regenerationFeedback 
        ? `\n\nFEEDBACK UTILISATEUR POUR AMÉLIORATION : ${regenerationFeedback}\nTiens compte de ce feedback pour ajuster le plan et les questions.`
        : ''

      prompt = `Tu es un expert en création de tests éducatifs et professionnels. 

Crée un plan de test structuré et ${questionCount} questions personnalisées basées sur ces critères :

OBJECTIF : ${objective}
THÈME : ${theme}
SYSTÈME DE NOTATION : ${gradingDescription}
SPÉCIFICATIONS : ${additionalRequirements || 'Aucune spécification supplémentaire'}${regenerationContext}

ÉTAPE 1 - PLAN DE TEST :
Propose un plan structuré avec :
- Une introduction expliquant ton approche (2-3 phrases)
- Des catégories de questions pertinentes pour l'objectif (ex: "Connaissances théoriques", "Mise en pratique", "Analyse de cas", etc.)
- Pour chaque catégorie : description, nombre de questions suggéré, et justification
- Le total doit faire ${questionCount} questions

ÉTAPE 2 - GÉNÉRATION DES QUESTIONS :
Pour chaque question générée :
1. Assigne-la à une catégorie du plan
2. Adapte le type de question au contexte (QCM, réponse libre, analyse, etc.)
3. Définis le nombre de points selon l'importance
4. Explique pourquoi cette question est pertinente (aiRationale)
5. Si c'est une question fermée, précise la réponse attendue

Varie les types de questions et les niveaux de difficulté selon le contexte professionnel.`
    }

    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: responseSchema,
      prompt
    })

    return NextResponse.json(result.object)

  } catch (error) {
    console.error('Error generating questions:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}