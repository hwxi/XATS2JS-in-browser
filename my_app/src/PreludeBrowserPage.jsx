import { Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { preludeFiles } from './preludeData'

function buildTree(files) {
  const root = { name: 'prelude', path: 'prelude', children: [], files: [] }
  for (const path of Object.keys(files)) {
    const parts = path.split('/')
    let node = root
    parts.forEach((part, idx) => {
      const isFile = idx === parts.length - 1
      if (isFile) {
        node.files.push({ name: part, full: path })
      } else {
        let next = node.children.find((c) => c.name === part)
        if (!next) {
          const nextPath = `${node.path}/${part}`
          next = { name: part, path: nextPath, children: [], files: [] }
          node.children.push(next)
        }
        node = next
      }
    })
  }
  return root
}

function FileTree({ tree }) {
  const [open, setOpen] = useState({ [tree.path]: true })

  const toggle = (path) => setOpen((o) => ({ ...o, [path]: !o[path] }))

  const renderNode = (node) => {
    const isOpen = open[node.path]
    return (
      <div key={node.path} className="tree-node">
        <button className="folder-btn" onClick={() => toggle(node.path)}>
          {isOpen ? '▾' : '▸'} {node.name}
        </button>
        {isOpen && (
          <div className="branch">
            {node.children.map(renderNode)}
            {node.files.map((file) => (
              <div key={file.full} className="file-row">
                <span className="file-name">{file.name}</span>
                <Link
                  className="open-btn"
                  to={`/prelude/file/${encodeURIComponent(file.full)}`}
                >
                  Open
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return <div>{renderNode(tree)}</div>
}

function FileView() {
  const params = useParams()
  const encodedPath = params['*']
  const path = encodedPath ? decodeURIComponent(encodedPath) : null
  const content = path ? preludeFiles[path] : null

  if (!path) return <div className="empty">Select a file from the left.</div>
  if (!content) return <div className="empty">File not found in prelude.</div>

  return (
    <div className="file-view">
      <div className="file-header">{path}</div>
      <pre className="file-body">{content}</pre>
    </div>
  )
}

function Welcome() {
  return (
    <div className="hero">
      <div className="hero-title">Prelude Browser</div>
      <p className="hero-text">
        Explore the embedded prelude files in the browser.
      </p>
      <Link className="hero-btn" to="/prelude/file">
        Start exploring files
      </Link>
    </div>
  )
}

export default function PreludeBrowserPage() {
  const tree = useMemo(() => buildTree(preludeFiles), [])
  const location = useLocation()
  const onFileRoute = location.pathname.startsWith('/prelude/file')
  const layoutClass = onFileRoute ? 'layout' : 'layout full'

  return (
    <>
      <div className={layoutClass}>
        {onFileRoute && (
          <aside className="tree-pane">
            <div className="pane-title">Prelude files</div>
            <FileTree tree={tree} />
          </aside>
        )}
        <main className="viewer-pane">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="file/*" element={<FileView />} />
            <Route path="*" element={<Navigate to="/prelude" replace />} />
          </Routes>
        </main>
      </div>
    </>
  )
}
