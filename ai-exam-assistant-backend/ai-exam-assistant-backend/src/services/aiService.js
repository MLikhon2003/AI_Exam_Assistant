import { env } from '../config/env.js';
import { logAiError } from '../models/aiErrorLog.model.js';

async function callOpenAI(systemPrompt, userPrompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: env.openaiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    const error = new Error(`OpenAI API error (${res.status}): ${body}`);
    error.status = res.status;
    throw error;
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGemini(systemPrompt, userPrompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    const error = new Error(`Gemini API error (${res.status}): ${body}`);
    error.status = res.status;
    throw error;
  }

  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

async function callGroq(systemPrompt, userPrompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.groqApiKey}`,
    },
    body: JSON.stringify({
      model: env.groqModel || 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    const error = new Error(`Groq API error (${res.status}): ${body}`);
    error.status = res.status;
    throw error;
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function callProvider(systemPrompt, userPrompt, endpointLabel) {
  try {
    if (env.aiProvider === 'groq') {
      return await callGroq(systemPrompt, userPrompt);
    }
    if (env.aiProvider === 'gemini') {
      return await callGemini(systemPrompt, userPrompt);
    }
    return await callOpenAI(systemPrompt, userPrompt);
  } catch (err) {
    await logAiError({
      provider: env.aiProvider,
      statusCode: err.status || null,
      endpoint: endpointLabel,
      message: err.message,
    });
    throw err;
  }
}

function safeParseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const stripped = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(stripped);
  }
}

export async function generateQuestions({ topic, sourceText, questionType, difficulty, count }) {
  const systemPrompt =
    'You are an exam-preparation assistant. Generate fresh, high-quality practice questions. ' +
    'Always respond with strict JSON only, matching the requested schema, and nothing else.';

  const schemaNote =
    questionType === 'short_answer'
      ? '{ "questions": [ { "prompt": string, "type": "short_answer", "modelAnswer": string } ] }'
      : '{ "questions": [ { "prompt": string, "type": "mcq" | "true_false", "options": [ { "id": string, "label": string } ], "correctOptionId": string } ] }';

  const userPrompt = [
    `Topic: ${topic}`,
    sourceText ? `Source material (from an uploaded PDF):\n${sourceText.slice(0, 6000)}` : null,
    `Question type: ${questionType}`,
    `Difficulty: ${difficulty}`,
    `Number of questions: ${count}`,
    `Respond with JSON in exactly this shape: ${schemaNote}`,
  ].filter(Boolean).join('\n\n');

  const raw = await callProvider(systemPrompt, userPrompt, '/sessions/generate');
  const parsed = safeParseJson(raw);
  return parsed.questions;
}

export async function evaluateAnswer({ question, submittedText }) {
  if (question.question_type !== 'short_answer') {
    const correct = submittedText === question.correct_option_id;
    return {
      isCorrect: correct,
      score: correct ? 100 : 0,
      headline: correct ? 'Correct!' : "Not quite — here's why",
      body: correct
        ? "That's the right answer for this question."
        : `The correct answer was "${question.options.find((o) => o.id === question.correct_option_id)?.label}".`,
      tip: null,
    };
  }

  const systemPrompt =
    "You are grading a student's short-answer exam response. Be fair but rigorous. " +
    'Respond with strict JSON only: { "isCorrect": boolean, "score": number (0-100), ' +
    '"headline": string, "body": string, "tip": string | null }.';

  const userPrompt = [
    `Question: ${question.prompt}`,
    question.model_answer ? `Reference answer: ${question.model_answer}` : null,
    `Student's answer: ${submittedText}`,
  ].filter(Boolean).join('\n\n');

  const raw = await callProvider(systemPrompt, userPrompt, '/sessions/answer');
  return safeParseJson(raw);
}

export async function chatReply({ topic, history, message }) {
  const systemPrompt =
    `You are a friendly study chatbot helping a student with the topic "${topic}". ` +
    'Answer clearly and concisely. If the question is unrelated, gently say so (FR-30). ' +
    'Respond with strict JSON only: { "reply": string }.';

  const historyText = history.map((m) => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.message}`).join('\n');
  const userPrompt = `${historyText}\nStudent: ${message}`;

  const raw = await callProvider(systemPrompt, userPrompt, '/chat');
  const parsed = safeParseJson(raw);
  return parsed.reply;
}
