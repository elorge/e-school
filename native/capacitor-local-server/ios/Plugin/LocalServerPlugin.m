// native/capacitor-local-server/ios/Plugin/LocalServerPlugin.m
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(LocalServerPlugin, "LocalServer",
    CAP_PLUGIN_METHOD(start, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(setSlideIndex, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getConnectedCount, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stop, CAPPluginReturnPromise);
)
