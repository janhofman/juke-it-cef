#include "RendererApp.h"

void RendererApp::OnWebKitInitialized() {
	// Create the renderer-side router for query handling.
	CefMessageRouterConfig config;
	message_router_ = CefMessageRouterRendererSide::Create(config);
}

void RendererApp::OnContextCreated(CefRefPtr<CefBrowser> browser,
	CefRefPtr<CefFrame> frame,
	CefRefPtr<CefV8Context> context) {
	message_router_->OnContextCreated(browser, frame, context);

	/*CefRefPtr<CefV8Value> object = context->GetGlobal();
	object->SetValue("cef", CefV8Value::CreateString("Got here from C++!"), V8_PROPERTY_ATTRIBUTE_NONE);*/
}

void RendererApp::OnContextReleased(CefRefPtr<CefBrowser> browser,
	CefRefPtr<CefFrame> frame,
	CefRefPtr<CefV8Context> context) {
	message_router_->OnContextReleased(browser, frame, context);
}

bool RendererApp::OnProcessMessageReceived(CefRefPtr<CefBrowser> browser,
	CefProcessId source_process,
	CefRefPtr<CefProcessMessage> message) {
	return message_router_->OnProcessMessageReceived(browser, source_process, message);
}