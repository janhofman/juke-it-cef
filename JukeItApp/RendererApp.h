#ifndef JUKEIT_RENDER_PROCESS_HANDLER_H_
#define JUKEIT_RENDER_PROCESS_HANDLER_H_

#include "include/cef_render_process_handler.h"
#include "include/cef_app.h"
#include "include/wrapper/cef_message_router.h"

// Implementation of CefApp for the renderer process.
class RendererApp : public CefApp, public CefRenderProcessHandler {
public:
	RendererApp() : message_router_(CefMessageRouterRendererSide::Create(CefMessageRouterConfig())) {}

	// CefApp methods:
	CefRefPtr<CefRenderProcessHandler> GetRenderProcessHandler() OVERRIDE {
		return this;
	}

	// CefRenderProcessHandler methods:
	void OnWebKitInitialized() OVERRIDE;

	void OnContextCreated(CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		CefRefPtr<CefV8Context> context) OVERRIDE;

	void OnContextReleased(CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		CefRefPtr<CefV8Context> context) OVERRIDE;

	bool OnProcessMessageReceived(CefRefPtr<CefBrowser> browser,
		CefProcessId source_process,
		CefRefPtr<CefProcessMessage> message) OVERRIDE;

private:
	// Handles the renderer side of query routing.
	CefRefPtr<CefMessageRouterRendererSide> message_router_;

	IMPLEMENT_REFCOUNTING(RendererApp);
	DISALLOW_COPY_AND_ASSIGN(RendererApp);
};

#endif  // JUKEIT_RENDER_PROCESS_HANDLER_H_