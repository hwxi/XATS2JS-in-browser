(function () {
    const rt = globalThis.__xats_browser_runtime__;
    if (!rt) {
        throw new Error("__xats_browser_runtime__ is missing");
    }

    function candidatePaths(path) {
        const raw = String(path);
        const noHome = raw.replace(/^\$\(XATSHOME\)\//, '');
        const noPrelude = noHome.replace(/^prelude\//, '');

        return [
            raw, 
            noHome,
            noPrelude
        ];
    }

    function readFromMap(path) {
        for (const key of candidatePaths(path)) {
            if (key in rt.fileMap) {
                return rt.fileMap[key];
            }
        }
        throw new Error(`Missing browser file: ` + path);
    }

    globalThis.registerXatsFile = function (path, text) {
        rt.registerFile(String(path), String(text));
    };

    globalThis.XATSOPT_XATSHOME_get = function () {
        return "$(XATSHOME)";
    };

    globalThis.XATSOPT_fpath_full$read = function (fpx) {
        return readFromMap(fpx);
    };

    globalThis.XATSOPT_fpath_rexists = function (fpx) {
        try {
            readFromMap(fpx);
            return 1;
        } catch {
            return 0;
        }
    };

    globalThis.XATS2JS_NODE_g_stdout = function () {
        return rt.stdout;
    };

    globalThis.XATS2JS_NODE_g_stderr = function () {
        return rt.stderr;
    };

    globalThis.XATS2JS_NODE_g_fprint = function (obj, out) {
        out.write(String(obj));
    };

    globalThis.XATS2JS_NODE_bool_fprint = function (obj, out) {
        out.write(String(obj));
    }

    globalThis.XATS2JS_NODE_char_fprint = function (obj, out) {
        out.write(String.fromCharCode(obj));
    };
    
    globalThis.XATS2JS_NODE_strn_fprint = function (obj, out) {
        out.write(String(obj));
    };
    
    globalThis.XATS2JS_NODE_sint_fprint = function (obj, out) {
        out.write(String(obj));
    };
    
    globalThis.XATS2JS_NODE_uint_fprint = function (obj, out) {
        out.write(String(obj));
    };
    
    globalThis.XATS2JS_NODE_gint_fprint$sint = function (obj, out) {
        out.write(String(obj));
    };
    
    globalThis.XATS2JS_NODE_gint_fprint$uint = function (obj, out) {
        out.write(String(obj));
    };
    
    globalThis.XATS2JS_NODE_gflt_fprint$sflt = function (obj, out) {
        out.write(String(obj));
    };
    
    globalThis.XATS2JS_NODE_gflt_fprint$dflt = function (obj, out) {
        out.write(String(obj));
    };
})();
