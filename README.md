# XATS2JS in the Browser

XATS2JS in the Browser is a web-based environment for compiling ATS/Xanadu
source code into JavaScript. It adapts the existing XATS2JS compiler to run
entirely inside a browser and provides a React interface for entering source
code, inspecting generated JavaScript, and reading compiler diagnostics.

This project is based on the
[XATS2JS-in-browser](https://github.com/hwxi/XATS2JS-in-browser) work published
by the ATS community. The current version adds the browser runtime adaptation,
virtual file handling, compiler interface, Prelude Browser, and related project
documentation.

## Features

- Compile ATS/Xanadu source code to JavaScript in the browser.
- Run the compiler without a separate Node.js back end.
- Display processed emitter output, raw standard output, and diagnostics.
- Load ATS Prelude files into an in-memory virtual file system.
- Browse the embedded Prelude through an expandable directory tree.
- Keep submitted source code on the client side during compilation.

## How It Works

The generated XATS2JS compiler was originally designed around Node.js APIs.
The browser compatibility layer exposes the small subset of that environment
needed by the compiler, including `process.argv`, standard output and error
streams, restricted `require("fs")` behavior, and file-access functions.

These interfaces are registered on `globalThis` so that the generated compiler,
the compatibility patch, and the React application can share the same runtime.
User source code and Prelude resources are stored in an in-memory file map
instead of being read from the host file system.

```text
ATS/Xanadu source
    -> virtual file system
    -> XATS2JS compiler
    -> captured stdout/stderr
    -> JavaScript output and diagnostics
```

## Running Locally

### Prerequisites

- Node.js
- npm

Clone the repository and enter the React application directory:

```bash
git clone https://github.com/qoeufv/XATS2JS-in-browser.git
cd XATS2JS-in-browser/my_app
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite in a browser.

## Production Build

Create a production build with:

```bash
cd my_app
npm run build
```

The generated website will be placed in `my_app/dist`. To preview it locally:

```bash
npm run preview
```

## Project Structure

```text
XATS2JS_in_browser/
├── doc/                         Project reports and PDF renderer
├── my_app/
│   ├── public/
│   │   ├── browser_fs_patch.js Browser compatibility functions
│   │   └── xats2js_jsemit01_ats2.js
│   ├── src/
│   │   ├── CompilerPage.jsx    Compiler user interface
│   │   ├── PreludeBrowserPage.jsx
│   │   ├── loadPrelude.js      Prelude registration
│   │   ├── preludeData.js      Embedded Prelude file map
│   │   └── runCompiler.js      Compiler invocation and output handling
│   └── tools/
│       └── GenerateFileMap.java
└── README.md
```

## Current Limitations

- The compiler interface currently focuses on a single user input file.
- The virtual file system provides only the embedded resources registered by
  the application.
- Output cleanup is text-based and is not a formal optimization pass.
- The editor does not yet provide syntax highlighting, completion, or
  source-level diagnostic locations.

## Documentation

Technical project reports in Chinese and English are available in the
[`doc`](./doc) directory.

## Acknowledgements

This project builds on the XATS/Xanadu and XATS2JS work of the ATS community.
The upstream repository and its commit history are retained to make that origin
explicit.
