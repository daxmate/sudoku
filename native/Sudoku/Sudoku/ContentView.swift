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

class WebViewCoordinator {
    let schemeHandler = DistSchemeHandler()
}

#if os(macOS)
    struct WebViewContainer: NSViewRepresentable {
        func makeNSView(context: Context) -> WKWebView {
            let config = WKWebViewConfiguration()
            config.setURLSchemeHandler(context.coordinator.schemeHandler, forURLScheme: "sudoku")
            let wv = WKWebView(frame: .zero, configuration: config)

            if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "dist"),
               let html = try? String(contentsOf: url, encoding: .utf8) {
                wv.loadHTMLString(html, baseURL: URL(string: "sudoku://bundle/"))
            }
            return wv
        }

        func updateNSView(_ nsView: WKWebView, context: Context) {}

        func makeCoordinator() -> WebViewCoordinator { WebViewCoordinator() }
    }
#else
    struct WebViewContainer: UIViewRepresentable {
        func makeUIView(context: Context) -> WKWebView {
            let config = WKWebViewConfiguration()
            config.setURLSchemeHandler(context.coordinator.schemeHandler, forURLScheme: "sudoku")
            let wv = WKWebView(frame: .zero, configuration: config)

            if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "dist"),
               let html = try? String(contentsOf: url, encoding: .utf8) {
                wv.loadHTMLString(html, baseURL: URL(string: "sudoku://bundle/"))
            }
            return wv
        }

        func updateUIView(_ uiView: WKWebView, context: Context) {}

        func makeCoordinator() -> WebViewCoordinator { WebViewCoordinator() }
    }
#endif

#Preview {
    ContentView()
}
