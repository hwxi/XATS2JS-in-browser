import { useState } from 'react'
import { runCompiler } from './runCompiler'

const initialSource = `#implfun main0() = ()`

export default function CompilerPage() {
  const [source, setSource] = useState(initialSource)
  const [emitterOutput, setEmitterOutput] = useState('')
  const [rawStdout, setRawStdout] = useState('')
  const [logOutput, setLogOutput] = useState('')
  const [showRawStdout, setShowRawStdout] = useState(false)

  function handleCompile() {
    const result = runCompiler(source)
    setEmitterOutput(result.stdoutClean || result.stdout)
    setRawStdout(result.stdout)
    setLogOutput(
      result.error
        ? `${result.stderr}\n\n${String(result.error)}`
        : result.stderr
    )
  }

  return (
    <div className="compiler-page">
      <section className="editor-pane">
        <h1 className="page-title">ATS to JS Compiler</h1>
        <p className="page-copy">
          Write ATS/Xanadu source on the left, then inspect the emitter output and compiler diagnostics.
        </p>
        <textarea
          className="source-box"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          spellCheck={false}
        />
        <button className="compile-btn" onClick={handleCompile}>
          Compile
        </button>
      </section>

      <section className="output-pane">
        <div className="output-header">
          <h2 className="section-title">Emitter Output</h2>
          <button
            className="toggle-btn"
            onClick={() => setShowRawStdout((value) => !value)}
            type="button"
          >
            {showRawStdout ? 'Hide raw stdout' : 'Show raw stdout'}
          </button>
        </div>
        <pre className="output-box">{emitterOutput}</pre>

        {showRawStdout && (
          <>
            <h2 className="section-title">Raw stdout</h2>
            <pre className="output-box output-box--muted">{rawStdout}</pre>
          </>
        )}

        <h2 className="section-title">Diagnostics</h2>
        <pre className="output-box output-box--muted">{logOutput}</pre>
      </section>
    </div>
  )
}
