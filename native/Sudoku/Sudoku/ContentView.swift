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
        WebViewContainer()
            .frame(minWidth: 500, minHeight: 700)
    }
}

#if os(macOS)
    struct WebViewContainer: NSViewRepresentable {
        func makeNSView(context: Context) -> WKWebView {
            // 关键：必须用 WKWebViewConfiguration 设置文件访问权限
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
            let wv = WKWebView()
            if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "dist") {
                wv.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
            }
            return wv
        }

        func updateUIView(_ uiView: WKWebView, context: Context) {}
    }

#endif

#Preview {
    ContentView()
}
