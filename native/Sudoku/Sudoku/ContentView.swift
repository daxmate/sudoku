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
            // 注入捕获 JS 错误的脚本
            let errScript = WKUserScript(source: """
window.onerror = function(msg) { window.webkit.messageHandlers.jsError.postMessage(msg) };
""", injectionTime: .atDocumentStart, forMainFrameOnly: true)

            let config = WKWebViewConfiguration()
            config.userContentController.addUserScript(errScript)
            config.userContentController.add(context.coordinator, name: "jsError")

            let wv = WKWebView(frame: .zero, configuration: config)
            wv.navigationDelegate = context.coordinator

            let fm = FileManager.default
            let docs = fm.urls(for: .documentDirectory, in: .userDomainMask).first!
            let distTarget = docs.appendingPathComponent("dist")

            if !fm.fileExists(atPath: distTarget.path) {
                if let src = Bundle.main.url(forResource: "dist", withExtension: nil) {
                    try? fm.copyItem(at: src, to: distTarget)
                }
            }

            let indexUrl = distTarget.appendingPathComponent("index.html")
            if fm.fileExists(atPath: indexUrl.path) {
                // 从 Documents 加载——这是 app 自己的沙盒，WKWebView 应该能访问
                wv.loadFileURL(indexUrl, allowingReadAccessTo: distTarget)
            }
            return wv
        }

        func updateUIView(_ uiView: WKWebView, context: Context) {}

        func makeCoordinator() -> Coordinator { Coordinator() }

        class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
            func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
                if message.name == "jsError" {
                    print("❌ JS Error:", message.body)
                }
            }
            func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
                print("❌ Navigation failed:", error.localizedDescription)
            }
            func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
                print("❌ Provisional nav failed:", error.localizedDescription)
            }
            func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
                print("✅ Page loaded successfully")
            }
        }
    }
#endif

#Preview {
    ContentView()
}
