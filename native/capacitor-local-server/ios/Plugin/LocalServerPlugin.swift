// native/capacitor-local-server/ios/Plugin/LocalServerPlugin.swift
import Foundation
import Capacitor
import GCDWebServer

/**
 * iOS counterpart to the Android LocalServerPlugin — same contract,
 * same two endpoints, same static viewer page. See
 * android/.../LocalServerPlugin.kt for the fuller design notes; only
 * iOS-specific caveats are called out here.
 *
 * SETUP THIS FILE ASSUMES (see NATIVE_INTEGRATION.md for the full list):
 *  - GCDWebServer added via CocoaPods (see the podspec at the plugin root)
 *  - web/public/present-viewer/ added to the Xcode project as a
 *    FOLDER REFERENCE (blue folder icon), not a group, named
 *    "present-viewer" — folder references copy their contents as-is
 *    into the app bundle, which Bundle.main.path(forResource:) below
 *    depends on.
 *  - Info.plist allows plain HTTP to the local network (see
 *    NATIVE_INTEGRATION.md's ATS exception note) and, depending on iOS
 *    version behavior in real testing, may need
 *    NSLocalNetworkUsageDescription set even though this plugin only
 *    ever listens for inbound connections rather than initiating them.
 */
@objc(LocalServerPlugin)
public class LocalServerPlugin: CAPPlugin {
    private var webServer: GCDWebServer?
    private var slidesJson: String = "[]"
    private var slideIndex: Int = 0
    private var updatedAtMs: Double = Date().timeIntervalSince1970 * 1000

    private var recentClients: [String: Double] = [:]
    private let connectedWindowMs: Double = 10_000
    private let port: UInt = 8080

    @objc func start(_ call: CAPPluginCall) {
        if let slidesArray = call.getArray("slides") {
            if let data = try? JSONSerialization.data(withJSONObject: slidesArray, options: []),
               let json = String(data: data, encoding: .utf8) {
                slidesJson = json
            }
        }

        webServer?.stop()
        let server = GCDWebServer()

        server.addHandler(forMethod: "GET", path: "/api/slides", request: GCDWebServerRequest.self) { [weak self] request in
            self?.recordClient(request)
            return GCDWebServerDataResponse(text: self?.slidesJson ?? "[]")
        }

        server.addHandler(forMethod: "GET", path: "/api/state", request: GCDWebServerRequest.self) { [weak self] request in
            guard let self = self else { return GCDWebServerDataResponse(text: "{}") }
            self.recordClient(request)
            let state: [String: Any] = ["slideIndex": self.slideIndex, "updatedAt": self.updatedAtMs]
            return GCDWebServerDataResponse(jsonObject: state) ?? GCDWebServerDataResponse(text: "{}")
        }

        // Serves the bundled viewer page — see the folder-reference note
        // in the file header. indexFilename makes "/" resolve to index.html.
        if let viewerPath = Bundle.main.path(forResource: "present-viewer", ofType: nil) {
            server.addGETHandler(forBasePath: "/", directoryPath: viewerPath, indexFilename: "index.html", cacheAge: 0, allowRangeRequests: true)
        } else {
            call.reject("present-viewer folder not found in the app bundle — see LocalServerPlugin.swift setup notes")
            return
        }

        do {
            try server.start(options: [
                GCDWebServerOption_Port: port,
                GCDWebServerOption_BindToLocalhost: false,
            ])
            webServer = server

            guard let ip = getLocalIPAddress() else {
                call.reject("Could not determine this device's local IP address — is Personal Hotspot actually on?")
                return
            }
            call.resolve(["viewerUrl": "http://\(ip):\(port)/"])
        } catch {
            call.reject("Could not start local server: \(error.localizedDescription)")
        }
    }

    @objc func setSlideIndex(_ call: CAPPluginCall) {
        guard let index = call.getInt("index") else {
            call.reject("Missing required 'index' argument")
            return
        }
        slideIndex = index
        updatedAtMs = Date().timeIntervalSince1970 * 1000
        call.resolve()
    }

    @objc func getConnectedCount(_ call: CAPPluginCall) {
        let cutoff = Date().timeIntervalSince1970 * 1000 - connectedWindowMs
        recentClients = recentClients.filter { $0.value >= cutoff }
        call.resolve(["count": recentClients.count])
    }

    @objc func stop(_ call: CAPPluginCall) {
        webServer?.stop()
        webServer = nil
        call.resolve()
    }

    private func recordClient(_ request: GCDWebServerRequest) {
        recentClients[request.remoteAddressData?.description ?? UUID().uuidString] = Date().timeIntervalSince1970 * 1000
    }

    /// CAVEAT — verify against real target devices/iOS versions before
    /// shipping. Personal Hotspot's host-side interface is conventionally
    /// named "bridge100" and the host typically self-assigns 172.20.10.1,
    /// but neither is a documented, guaranteed-stable API contract.
    private func getLocalIPAddress() -> String? {
        var address: String?
        var ifaddrPtr: UnsafeMutablePointer<ifaddrs>?
        guard getifaddrs(&ifaddrPtr) == 0, let firstAddr = ifaddrPtr else { return nil }
        defer { freeifaddrs(ifaddrPtr) }

        for ptr in sequence(first: firstAddr, next: { $0.pointee.ifa_next }) {
            let interface = ptr.pointee
            guard interface.ifa_addr.pointee.sa_family == UInt8(AF_INET) else { continue }
            let name = String(cString: interface.ifa_name)
            if name == "bridge100" {
                var addr = interface.ifa_addr.pointee
                var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
                getnameinfo(&addr, socklen_t(interface.ifa_addr.pointee.sa_len), &hostname, socklen_t(hostname.count), nil, 0, NI_NUMERICHOST)
                address = String(cString: hostname)
                break
            }
        }
        return address
    }
}
