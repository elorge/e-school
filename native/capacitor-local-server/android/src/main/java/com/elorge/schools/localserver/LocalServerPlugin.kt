// native/capacitor-local-server/android/src/main/java/com/elorge/schools/localserver/LocalServerPlugin.kt
package com.elorge.schools.localserver

import android.util.Log
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.net.NetworkInterface
import java.util.Collections

private const val TAG = "LocalServerPlugin"
private const val PORT = 8080

@CapacitorPlugin(name = "LocalServer")
class LocalServerPlugin : Plugin() {

    private var server: ProjectingHttpServer? = null

    @PluginMethod
    fun start(call: PluginCall) {
        val slides: JSArray = call.getArray("slides") ?: JSArray()

        try {
            server?.stop()

            val srv = ProjectingHttpServer(PORT, context.assets)
            srv.setSlides(slides.toString())
            srv.start(fi.iki.elonen.NanoHTTPD.SOCKET_READ_TIMEOUT, false)
            server = srv

            val ip = findLocalIpAddress()
            if (ip == null) {
                call.reject("Could not determine this device's local IP address — is the hotspot actually on?")
                return
            }

            val result = JSObject()
            result.put("viewerUrl", "http://$ip:$PORT/")
            call.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start local server", e)
            call.reject("Could not start local server: ${e.message}", e)
        }
    }

    @PluginMethod
    fun setSlideIndex(call: PluginCall) {
        val index = call.getInt("index")
        if (index == null) {
            call.reject("Missing required 'index' argument")
            return
        }
        server?.setSlideIndex(index)
        call.resolve()
    }

    @PluginMethod
    fun getConnectedCount(call: PluginCall) {
        val result = JSObject()
        result.put("count", server?.connectedCount() ?: 0)
        call.resolve(result)
    }

    @PluginMethod
    fun stop(call: PluginCall) {
        server?.stop()
        server = null
        call.resolve()
    }

    override fun handleOnDestroy() {
        server?.stop()
        server = null
        super.handleOnDestroy()
    }

    /**
     * CAVEAT — this is the single most likely thing to need adjustment
     * per device/OEM. There is no official Android API for "give me my
     * hotspot's own IP." Common ranges: 192.168.43.1 (stock/Pixel),
     * but Samsung, Xiaomi, and others have shipped different defaults
     * over the years. This scans all non-loopback IPv4 interfaces and
     * returns the first match — verify this actually resolves to the
     * hotspot interface (not, say, a stray VPN or USB-tethering
     * interface) on your actual target devices before shipping.
     */
    private fun findLocalIpAddress(): String? {
        return try {
            val interfaces = Collections.list(NetworkInterface.getNetworkInterfaces())
            for (intf in interfaces) {
                if (!intf.isUp || intf.isLoopback) continue
                val addresses = Collections.list(intf.inetAddresses)
                for (addr in addresses) {
                    val host = addr.hostAddress
                    if (host != null && !addr.isLoopbackAddress && host.indexOf(':') < 0) {
                        return host
                    }
                }
            }
            null
        } catch (e: Exception) {
            Log.e(TAG, "Failed to enumerate network interfaces", e)
            null
        }
    }
}
