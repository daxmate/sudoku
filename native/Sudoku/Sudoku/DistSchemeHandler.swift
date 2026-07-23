//
//  DistSchemeHandler.swift
//  Sudoku
//
//  Created by 张超 on 2026/7/23.
//

import WebKit

class DistSchemeHandler: NSObject, WKURLSchemeHandler {

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        let url = urlSchemeTask.request.url!
        var path = url.path
        if path.isEmpty || path == "/" { path = "/index.html" }

        let cleanPath = path.hasPrefix("/") ? String(path.dropFirst()) : path
        guard let fileUrl = Bundle.main.url(forResource: cleanPath, withExtension: nil, subdirectory: "dist"),
              let data = try? Data(contentsOf: fileUrl) else {
            urlSchemeTask.didFailWithError(NSError(domain: "DistHandler", code: 404,
                userInfo: [NSLocalizedDescriptionKey: "File not found: \(path)"]))
            return
        }

        let ext = (path as NSString).pathExtension
        let mimeType = MIMEType(for: ext)
        let response = HTTPURLResponse(url: url, mimeType: mimeType,
                                      expectedContentLength: data.count,
                                      textEncodingName: nil)
        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(data)
        urlSchemeTask.didFinish()
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}

    private func MIMEType(for ext: String) -> String {
        switch ext.lowercased() {
        case "html": return "text/html"
        case "js":   return "text/javascript"
        case "css":  return "text/css"
        case "svg":  return "image/svg+xml"
        case "json": return "application/json"
        case "png":  return "image/png"
        case "ico":  return "image/x-icon"
        default:     return "text/plain"
        }
    }
}
