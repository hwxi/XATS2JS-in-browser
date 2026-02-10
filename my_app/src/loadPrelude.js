import '../../sourcefile/browser_fs_patch'   // installs XATSOPT_fpath_full$read override
import { preludeFiles } from './preludeData'

const { registerXatsFile } = globalThis
if (typeof registerXatsFile !== 'function') {
  throw new Error('browser_fs_patch did not load; registerXatsFile missing')
}

Object.entries(preludeFiles).forEach(([path, text]) => {
  registerXatsFile(path, text) // provided by the patch
})

// test for how many files were registered
const count = Object.keys(preludeFiles).length
console.log('Prelude registered', count, 'files; sample:', Object.keys(preludeFiles).slice(0,5))
