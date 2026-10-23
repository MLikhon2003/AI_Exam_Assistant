import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuestions } from '../data/api';

export default function SessionSetup() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('Dynamic Programming — Knapsack & LCS');
  const [file, setFile] = useState(null);
  const [questionType, setQuestionType] = useState('mcq');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  // FR-11 — generate a set of questions via the AI model, then hand the
  // session + questions off to the Practice page.
  const handleGenerate = async () => {
    setError('');
    setLoading(true);
    const result = await generateQuestions({ topic, file, questionType, difficulty, count });
    setLoading(false);

    if (!result.ok) {
      setError(result.error || 'Could not generate questions. Please try again.');
      return;
    }

    navigate('/practice', { state: { session: result.session, questions: result.questions } });
  };

  return (
    <main style={{ padding: '50px 60px', maxWidth: 760 }}>
      <div className="eyebrow">UC-02 · Generate questions</div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 600, margin: '10px 0 6px' }}>Set up a practice session</h1>
      <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 34 }}>
        Give the AI a topic or your notes, then choose how you want to be tested.
      </p>

      <div className="card" style={{ padding: 30 }}>
        {/* FR-07 */}
        <div className="field">
          <label>Topic</label>
          <input
            type="text"
            placeholder="e.g. Dynamic Programming, Cell Biology, French Revolution"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <span className="field-hint">Or skip this and upload a document below.</span>
        </div>

        {/* FR-08 */}
        <div className="field">
          <label>Upload notes (optional)</label>
          <label
            htmlFor="notes-upload"
            style={{
              border: '1.5px dashed var(--line)', borderRadius: 10, padding: 22, textAlign: 'center',
              cursor: 'pointer', background: 'var(--paper-dim)', display: 'block',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>📄</div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{file ? file.name : 'Click to upload a PDF'}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
              {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB — ready to extract text` : 'Scanned/image-only PDFs are not supported'}
            </div>
          </label>
          <input id="notes-upload" type="file" accept="application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {/* FR-09 — values match the backend's question_type enum */}
          <div className="field">
            <label>Question type</label>
            <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
              <option value="mcq">Multiple choice (MCQ)</option>
              <option value="short_answer">Short answer</option>
              <option value="true_false">True / False</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          {/* FR-10 — values match the backend's difficulty enum */}
          <div className="field">
            <label>Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>
            Number of questions — <strong style={{ fontFamily: 'var(--mono)', color: 'var(--amber-deep)' }}>{count}</strong>
          </label>
          <input
            type="range"
            min="3"
            max="15"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={{ padding: 0, accentColor: 'var(--amber-deep)' }}
          />
        </div>

        {error && <p style={{ fontSize: 12.5, color: 'var(--clay-deep)', marginBottom: 12 }}>{error}</p>}

        <button className="btn btn-accent btn-block" style={{ marginTop: 10, padding: 14 }} onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate questions →'}
        </button>
        <p className="field-hint" style={{ textAlign: 'center', marginTop: 10 }}>Usually ready in under 5 seconds</p>
      </div>
    </main>
  );
}
