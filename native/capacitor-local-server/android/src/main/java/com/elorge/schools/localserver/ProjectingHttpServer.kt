// native/capacitor-local-server/android/src/main/java/com/elorge/schools/localserver/ProjectingHttpServer.kt
package com.elorge.schools.localserver

import android.content.res.AssetManager
import fi.iki.elonen.NanoHTTPD
import org.json.JSONObject
import java.util.concurrent.ConcurrentHashMap

/**
 * Serves exactly two things to any device on the hotspot:
 *   1. The static viewer page (bundled as an Android asset — see
 *      android/app/src/main/assets/present-viewer/, which should be a
 *      direct copy of web/public/present-viewer/).
 *   2. Two tiny JSON endpoints (/api/slides, /api/state) the viewer
 *      page polls — see web/lib/projecting/contract.ts for the shapes.
 *
 * Deliberately NOT using WebSockets: a plain polling GET is trivial to
 * serve correctly from NanoHTTPD and is indistinguishable from a push
 * at a 1.5s interval for slide-following, at a fraction of the
 * complexity and failure surface.
 */
class ProjectingHttpServer(port: Int, private val assets: AssetManager) : NanoHTTPD(port) {

    @Volatile private var slidesJson: String = "[]"
    @Volatile private var slideIndex: Int = 0
    @Volatile private var updatedAt: Long = System.currentTimeMillis()

    // Headcount is best-effort: any device that hit /api/state in the
    // last CONNECTED_WINDOW_MS counts as "connected." No auth, no
    // session tokens — this is a same-room, same-hotspot feature, not
    // a security boundary.
    private val recentClients = ConcurrentHashMap<String, Long>()
    private val connectedWindowMs = 10_000L

    fun setSlides(json: String) {
        slidesJson = json
    }

    fun setSlideIndex(index: Int) {
        slideIndex = index
        updatedAt = System.currentTimeMillis()
    }

    fun connectedCount(): Int {
        val cutoff = System.currentTimeMillis() - connectedWindowMs
        recentClients.entries.removeIf { it.value < cutoff }
        return recentClients.size
    }

    override fun serve(session: IHTTPSession): Response {
        // Record every request's origin as a "connected" signal, not just
        // /api/state polls — a device fetching /api/slides or the viewer
        // page itself is just as much "here" as one mid-poll.
        recentClients[session.remoteIpAddress] = System.currentTimeMillis()

        return when (session.uri) {
            "/api/slides" -> newFixedLengthResponse(Response.Status.OK, "application/json", slidesJson)
            "/api/state" -> {
                val state = JSONObject()
                state.put("slideIndex", slideIndex)
                state.put("updatedAt", updatedAt)
                newFixedLengthResponse(Response.Status.OK, "application/json", state.toString())
            }
            else -> serveStaticAsset(session.uri)
        }
    }

    private fun serveStaticAsset(uri: String): Response {
        val relativePath = if (uri.isEmpty() || uri == "/") "index.html" else uri.trimStart('/')
        val assetPath = "present-viewer/$relativePath"
        return try {
            val stream = assets.open(assetPath)
            newChunkedResponse(Response.Status.OK, mimeTypeFor(relativePath), stream)
        } catch (e: Exception) {
            newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "Not found: $relativePath")
        }
    }

    private fun mimeTypeFor(path: String): String = when {
        path.endsWith(".html") -> "text/html"
        path.endsWith(".css") -> "text/css"
        path.endsWith(".js") -> "application/javascript"
        path.endsWith(".png") -> "image/png"
        path.endsWith(".jpg") || path.endsWith(".jpeg") -> "image/jpeg"
        path.endsWith(".svg") -> "image/svg+xml"
        else -> "application/octet-stream"
    }
}
