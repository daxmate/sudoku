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

class WSCoordinator {
    let schemeHandler = DistSchemeHandler()
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
        func makeCoordinator() -> WSCoordinator { WSCoordinator() }
    }
#else
    struct WebViewContainer: UIViewRepresentable {
        func makeUIView(context: Context) -> WKWebView {
            let config = WKWebViewConfiguration()
            config.setURLSchemeHandler(context.coordinator.schemeHandler, forURLScheme: "sudoku")

            let wv = WKWebView(frame: .zero, configuration: config)
            if let distUrl = Bundle.main.url(forResource: "dist", withExtension: nil) {
                let indexUrl = distUrl.appendingPathComponent("index.html")
                if let html = try? String(contentsOf: indexUrl, encoding: .utf8) {
                    wv.loadHTMLString(html, baseURL: URL(string: "sudoku://bundle/"))
                }
            }
            return wv
        }

        func updateUIView(_ uiView: WKWebView, context: Context) {}
        func makeCoordinator() -> WSCoordinator { WSCoordinator() }
    }
#endif

#Preview {
    ContentView()
}
