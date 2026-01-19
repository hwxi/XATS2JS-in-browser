package XATS2JS_in_browser.my_app.tools;

import java.nio.file.*;
import java.io.*;
import java.util.*;

public class GenerateFileMap {

    private static String esc (String s) {
        return s.replace("\\", "\\\\").replace("`", "\\`");
    }

    public static void main (String[] args) throws Exception {
        Path root = Paths.get(args[0]);
        Path out = Paths.get(args[1]);
        Map<String, String> files = new TreeMap<>();
        try (var paths = Files.walk(root)) {
            paths.filter(Files::isRegularFile).forEach(p -> {
                try {
                    files.put(root.relativize(p).toString().replace("\\", "/"), esc(Files.readString(p)));
                } catch (IOException e) {
                    throw new UncheckedIOException(e);
                }
            });
        }
        try (var w = Files.newBufferedWriter(out)) {
            w.write("export const preludeFiles = {\n");
            for (var e : files.entrySet()) {
                w.write("  \""+e.getKey()+"\": `"+e.getValue()+"`,\n");
            }
            w.write("};\n");
        }
    }
}
