// Browser-side patch for XATS2JS compiler.
// Overrides the Node-only XATSOPT_fpath_full$read so it works without fs.

(function (global) {
  if (typeof window === "undefined") return;

  // Virtual file system map path -> text content.
  const vfs = Object.create(null);

  // Preload compiler inputs.
  global.registerXatsFile = function registerXatsFile(path, contents) {
    vfs[path] = contents;
  };

  function syncFetch(path) {
    if (typeof XMLHttpRequest === "undefined") return null;
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", path, false);
      xhr.overrideMimeType("text/plain");
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) return xhr.responseText;
    } catch (err) {
      console.warn("XATSOPT_fpath_full$read fetch failed", err);
    }
    return null;
  }

  //Patch the compiler's file-read primitive.
  global.XATSOPT_fpath_full$read = function XATSOPT_fpath_full$read(fpx0) {
    // 1) Try virtual FS first.
    if (Object.prototype.hasOwnProperty.call(vfs, fpx0)) {
      return vfs[fpx0];
    }
    // 2) Try same-origin synchronous fetch as a fallback.
    const fetched = syncFetch(fpx0);
    if (fetched !== null) return fetched;

    throw new Error(
      "XATSOPT_fpath_full$read: cannot read file in browser: " + fpx0
    );
  };
})(typeof globalThis !== "undefined" ? globalThis : window);

