import Foundation
import CoreGraphics
import CoreText

let args = CommandLine.arguments
guard args.count == 3 else {
    fputs("Usage: render_pdf <input.md> <output.pdf>\n", stderr)
    exit(1)
}

let inputURL = URL(fileURLWithPath: args[1])
let outputURL = URL(fileURLWithPath: args[2])
let markdown = try String(contentsOf: inputURL, encoding: .utf8)

let pageWidth: CGFloat = 595.28
let pageHeight: CGFloat = 841.89
let marginLeft: CGFloat = 64
let marginRight: CGFloat = 64
let marginTop: CGFloat = 58
let marginBottom: CGFloat = 55
let contentWidth = pageWidth - marginLeft - marginRight

guard let consumer = CGDataConsumer(url: outputURL as CFURL) else {
    fatalError("Unable to create PDF consumer")
}
var mediaBox = CGRect(x: 0, y: 0, width: pageWidth, height: pageHeight)
guard let context = CGContext(consumer: consumer, mediaBox: &mediaBox, nil) else {
    fatalError("Unable to create PDF context")
}

func font(_ size: CGFloat, bold: Bool = false, mono: Bool = false) -> CTFont {
    let name: CFString
    if mono {
        name = "Menlo" as CFString
    } else if bold {
        name = "STHeitiSC-Medium" as CFString
    } else {
        name = "STHeitiSC-Light" as CFString
    }
    return CTFontCreateWithName(name, size, nil)
}

func paragraphStyle(alignment: CTTextAlignment = .justified,
                    lineSpacing: CGFloat = 5,
                    firstLineIndent: CGFloat = 24) -> CTParagraphStyle {
    var align = alignment
    var spacing = lineSpacing
    var indent = firstLineIndent
    return withUnsafePointer(to: &align) { alignPointer in
        withUnsafePointer(to: &spacing) { spacingPointer in
            withUnsafePointer(to: &indent) { indentPointer in
                var specs = [
                    CTParagraphStyleSetting(spec: .alignment,
                                            valueSize: MemoryLayout<CTTextAlignment>.size,
                                            value: alignPointer),
                    CTParagraphStyleSetting(spec: .lineSpacingAdjustment,
                                            valueSize: MemoryLayout<CGFloat>.size,
                                            value: spacingPointer),
                    CTParagraphStyleSetting(spec: .firstLineHeadIndent,
                                            valueSize: MemoryLayout<CGFloat>.size,
                                            value: indentPointer)
                ]
                return CTParagraphStyleCreate(&specs, specs.count)
            }
        }
    }
}

struct Block {
    let text: String
    let size: CGFloat
    let bold: Bool
    let mono: Bool
    let alignment: CTTextAlignment
    let indent: CGFloat
    let before: CGFloat
    let after: CGFloat
    let background: Bool
}

var blocks: [Block] = []
var paragraph: [String] = []
var codeLines: [String] = []
var inCode = false

func flushParagraph() {
    guard !paragraph.isEmpty else { return }
    blocks.append(Block(text: paragraph.joined(separator: " "), size: 11.2, bold: false,
                        mono: false, alignment: .justified, indent: 24,
                        before: 0, after: 9, background: false))
    paragraph.removeAll()
}

for rawLine in markdown.components(separatedBy: .newlines) {
    let line = rawLine.trimmingCharacters(in: .whitespaces)
    if line.hasPrefix("```") {
        flushParagraph()
        if inCode {
            blocks.append(Block(text: codeLines.joined(separator: "\n"), size: 9.4, bold: false,
                                mono: true, alignment: .left, indent: 0,
                                before: 2, after: 10, background: true))
            codeLines.removeAll()
        }
        inCode.toggle()
    } else if inCode {
        codeLines.append(rawLine)
    } else if line.hasPrefix("# ") {
        flushParagraph()
        blocks.append(Block(text: String(line.dropFirst(2)), size: 20, bold: true,
                            mono: false, alignment: .center, indent: 0,
                            before: 8, after: 24, background: false))
    } else if line.hasPrefix("## ") {
        flushParagraph()
        blocks.append(Block(text: String(line.dropFirst(3)), size: 14, bold: true,
                            mono: false, alignment: .left, indent: 0,
                            before: 11, after: 8, background: false))
    } else if line.isEmpty {
        flushParagraph()
    } else {
        paragraph.append(line.replacingOccurrences(of: "**", with: ""))
    }
}
flushParagraph()

var cursorY: CGFloat = pageHeight - marginTop
var pageNumber = 0

func beginPage() {
    context.beginPDFPage(nil)
    pageNumber += 1
    cursorY = pageHeight - marginTop
}

func endPage() {
    let number = "\(pageNumber)" as CFString
    let attrs: [CFString: Any] = [
        kCTFontAttributeName: font(8.5),
        kCTForegroundColorAttributeName: CGColor(gray: 0.38, alpha: 1)
    ]
    let line = CTLineCreateWithAttributedString(CFAttributedStringCreate(nil, number, attrs as CFDictionary))
    let bounds = CTLineGetBoundsWithOptions(line, .useOpticalBounds)
    context.textPosition = CGPoint(x: (pageWidth - bounds.width) / 2, y: 28)
    CTLineDraw(line, context)
    context.endPDFPage()
}

beginPage()

for block in blocks {
    let style = paragraphStyle(alignment: block.alignment,
                               lineSpacing: block.mono ? 3 : 5,
                               firstLineIndent: block.indent)
    let color = CGColor(gray: block.mono ? 0.18 : 0.08, alpha: 1)
    let attrs: [CFString: Any] = [
        kCTFontAttributeName: font(block.size, bold: block.bold, mono: block.mono),
        kCTForegroundColorAttributeName: color,
        kCTParagraphStyleAttributeName: style
    ]
    let attributed = CFAttributedStringCreate(nil, block.text as CFString, attrs as CFDictionary)
    let framesetter = CTFramesetterCreateWithAttributedString(attributed!)
    let textWidth = block.background ? contentWidth - 24 : contentWidth
    let suggested = CTFramesetterSuggestFrameSizeWithConstraints(
        framesetter, CFRange(location: 0, length: 0), nil,
        CGSize(width: textWidth, height: .greatestFiniteMagnitude), nil
    )
    let height = ceil(suggested.height) + (block.background ? 16 : 1)
    let required = block.before + height + block.after

    if cursorY - required < marginBottom {
        endPage()
        beginPage()
    }

    cursorY -= block.before
    if block.background {
        context.setFillColor(CGColor(gray: 0.95, alpha: 1))
        context.fill(CGRect(x: marginLeft, y: cursorY - height,
                            width: contentWidth, height: height))
    }
    let x = marginLeft + (block.background ? 12 : 0)
    let y = cursorY - height + (block.background ? 8 : 0)
    let drawHeight = height - (block.background ? 16 : 0)
    let path = CGPath(rect: CGRect(x: x, y: y, width: textWidth, height: drawHeight), transform: nil)
    let frame = CTFramesetterCreateFrame(framesetter, CFRange(location: 0, length: 0), path, nil)
    CTFrameDraw(frame, context)
    cursorY -= height + block.after
}

endPage()
context.closePDF()
print("Generated \(outputURL.path) (\(pageNumber) pages)")
