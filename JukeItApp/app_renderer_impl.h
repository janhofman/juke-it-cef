#ifndef CEF_APP_RENDERER_IMPL_H_
#define CEF_APP_RENDERER_IMPL_H_

#include "app_factory.h"
#include "include/wrapper/cef_message_router.h"

namespace message_router {

	// Implementation of CefApp for the renderer process.
	class RendererApp : public CefApp, public CefRenderProcessHandler {
	public:
		RendererApp() {}

		// CefApp methods:
		inline CefRefPtr<CefRenderProcessHandler> GetRenderProcessHandler() OVERRIDE { return this; }

		// CefRenderProcessHandler methods:
		void OnWebKitInitialized() OVERRIDE;
		void OnContextCreated(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefV8Context> context) OVERRIDE;
		void OnContextReleased(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefV8Context> context) OVERRIDE;
		bool OnProcessMessageReceived(CefRefPtr<CefBrowser> browser, CefProcessId source_process, CefRefPtr<CefProcessMessage> message) OVERRIDE;

	private:
		// Handles the renderer side of query routing.
		CefRefPtr<CefMessageRouterRendererSide> message_router_;

		IMPLEMENT_REFCOUNTING(RendererApp);
		DISALLOW_COPY_AND_ASSIGN(RendererApp);
	};

}  // namespace message_router

namespace shared {

	inline CefRefPtr<CefApp> CreateRendererProcessApp() {
		return new message_router::RendererApp();
	}

}  // namespace shared

#endif