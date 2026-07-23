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

            // 把 dist 拷贝到 Documents 目录，绕过 Bundle 沙盒限制
            let fm = FileManager.default
            let docs = fm.urls(for: .documentDirectory, in: .userDomainMask).first!
            let distTarget = docs.appendingPathComponent("dist")

            if !fm.fileExists(atPath: distTarget.path) {
                if let distSrc = Bundle.main.url(forResource: "dist", withExtension: nil) {
                    try? fm.copyItem(at: distSrc, to: distTarget)
                }
            }

            let indexUrl = distTarget.appendingPathComponent("index.html")
            if fm.fileExists(atPath: indexUrl.path) {
                wv.loadFileURL(indexUrl, allowingReadAccessTo: distTarget)
            }
            return wv
        }

        func updateUIView(_ uiView: WKWebView, context: Context) {}
    }
#endif

#Preview {
    ContentView()
}
