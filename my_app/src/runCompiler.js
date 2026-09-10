function postprocessEmitterOutput(text) {
    let out = text
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n')

    out = out.replace(
        /let\s+([A-Za-z0-9_$]+)\s*=\s*([^;\n]+)\s*\n\s*return\s+\1/g,
        'return $2'
    )

    out = out.replace(/\n{3,}/g, '\n\n').trim()

    return out
}

export function runCompiler(sourceText) {
  const rt = globalThis.__xats_browser_runtime__

  if (!rt) {
    throw new Error('xats browser runtime is missing')
  }
  if (typeof globalThis.registerXatsFile !== 'function') {
    throw new Error('registerXatsFile is missing')
  }
  if (typeof globalThis.mymain_main_3240_ !== 'function') {
    throw new Error('compiler entry function is missing')
  }

  globalThis.registerXatsFile('input.dats', sourceText)

  rt.stdout.clear()
  rt.stderr.clear()

  globalThis.process.argv = [
    'node',
    'xats2js_jsemit01_ats2.js',
    'input.dats',
  ]

  let error = null

  try {
    globalThis.mymain_main_3240_()
  } catch (err) {
    error = err
  }

  return {
    stdout: rt.stdout.buffer,
    stdoutClean: postprocessEmitterOutput(rt.stdout.buffer),
    stderr: rt.stderr.buffer,
    error,
  }
}
  
