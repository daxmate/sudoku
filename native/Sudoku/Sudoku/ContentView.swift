//
//  ContentView.swift
//  Sudoku
//
//  Created by 张超 on 2026/7/23.
//

import SwiftUI
import WebKit

struct ContentView: View {
    var body: some View {
#if os(macOS)
        WebViewContainer()
            .frame(minWidth: 500, minHeight: 700)
#else
        WebViewContainer()
            .ignoresSafeArea()
#endif
    }
}

#if os(macOS)
    struct WebViewContainer: NSViewRepresentable {
        func makeNSView(context: Context) -> WKWebView {
            let config = WKWebViewConfiguration()
            config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
            config.setValue(true, forKey: "allowUniversalAccessFromFileURLs")

            let wv = WKWebView(frame: .zero, configuration: config)
            if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "dist") {
                wv.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
            }
            return wv
        }

        func updateNSView(_ nsView: WKWebView, context: Context) {}
    }
#else
    struct WebViewContainer: UIViewRepresentable {

        func makeUIView(context: Context) -> WKWebView {
            let wv = WKWebView(frame: .zero)
            // 单文件 HTML，所有 JS/CSS 内联，无需额外资源加载
            if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "dist"),
               let html = try? String(contentsOf: url, encoding: .utf8) {
                wv.loadHTMLString(html, baseURL: Bundle.main.resourceURL)
            }
            return wv
        }

        func updateUIView(_ uiView: WKWebView, context: Context) {}
    }
#endif

#Preview {
    ContentView()
}
