import { useState } from "react";
import './App.css';
export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);

  const analyze = async () => {
    if (!file) return;
    try {
      setLoading(true); setResult("");
      const fd = new FormData();
      fd.append("resume", file);
     const res = await fetch("https://ai-resume-analyzer-92gr.onrender.com/analyze", {
     method: "POST",
     body: fd
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data.result);
    } catch { alert("Something went wrong. Check backend."); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="card">

        <div className="header">
          <div className="badge"><span className="badge-dot" />AI Powered</div>
          <h1>Resume <span>Analyzer</span></h1>
          <p>Get instant AI feedback on your résumé — structure, impact, keywords, and more.</p>
        </div>

        <div className="divider" />

        <div
          className={`drop-zone ${drag ? "drag" : ""}`}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => {
            e.preventDefault(); setDrag(false);
            const f = e.dataTransfer.files[0];
            if (f?.type === "application/pdf") setFile(f);
          }}
        >
          <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} />
          <div className="upload-circle">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16"/>
              <line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
          </div>
          <div className="drop-title">{file ? "File ready to analyze" : "Drop your résumé here"}</div>
          <div className="drop-sub">
            {file ? "Click to swap file" : <>PDF format only · or <b>browse files</b></>}
          </div>
          {file && (
            <div className="file-badge">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {file.name}
            </div>
          )}
        </div>

        <button className="btn" onClick={analyze} disabled={loading || !file}>
          {loading ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation:"spin 1s linear infinite"}}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Analyzing…
            </>
          ) : (
            <>
              Analyze Résumé
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </>
          )}
        </button>

        {loading && (
          <div className="loader">
            <div className="spin-ring" />
            <div className="progress-wrap">
              <div className="progress-label">Reading your document…</div>
              <div className="progress-track"><div className="progress-fill" /></div>
            </div>
          </div>
        )}

        {result && (
          <div className="result">
            <div className="result-head">
              <div className="result-head-left">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <span>Analysis Report</span>
              </div>
              <div className="result-done">✓ Complete</div>
            </div>
            <pre className="result-body">{result}</pre>
          </div>
        )}

        <div className="footer-note">AI Resume Analyzer</div>

      </div>
    </>
  );
}
