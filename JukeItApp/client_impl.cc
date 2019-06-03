#include "client_impl.h"

#include "include/wrapper/cef_helpers.h"

#include "client_util.h"
#include "resource_util.h"

namespace message_router {

	Client::Client(const CefString& startup_url)
		: startup_url_(startup_url), browser_ct_(0) {}

	void Client::OnTitleChange(CefRefPtr<CefBrowser> browser,
		const CefString& title) {
		// Call the default shared implementation.
		shared::OnTitleChange(browser, title);
	}

	bool Client::OnProcessMessageReceived(CefRefPtr<CefBrowser> browser,
		CefProcessId source_process,
		CefRefPtr<CefProcessMessage> message) {
		CEF_REQUIRE_UI_THREAD();

		return message_router_->OnProcessMessageReceived(browser, source_process,
			message);
	}

	void Client::OnAfterCreated(CefRefPtr<CefBrowser> browser) {
		CEF_REQUIRE_UI_THREAD();

		if (!message_router_) {
			// Create the browser-side router for query handling.
			CefMessageRouterConfig config;
			message_router_ = CefMessageRouterBrowserSide::Create(config);

			//// Register handlers with the router.
			fileserver_handler.reset(new MsgHandler_FileServer(startup_url_));
			message_router_->AddHandler(fileserver_handler.get(), false);

			musicplayer_handler.reset(new MsgHandler_MusicPlayer(startup_url_));
			message_router_->AddHandler(musicplayer_handler.get(), false);
		}

		browser_ct_++;

		// Call the default shared implementation.
		shared::OnAfterCreated(browser);
	}

	bool Client::DoClose(CefRefPtr<CefBrowser> browser) {
		// Call the default shared implementation.
		return shared::DoClose(browser);
	}

	void Client::OnBeforeClose(CefRefPtr<CefBrowser> browser) {
		CEF_REQUIRE_UI_THREAD();

		if (--browser_ct_ == 0) {
			// Free the router when the last browser is closed.
			message_router_->RemoveHandler(fileserver_handler.get());
			message_router_->RemoveHandler(musicplayer_handler.get());
			 
			fileserver_handler.reset();
			musicplayer_handler.reset();
			message_router_ = NULL;
		}

		// Call the default shared implementation.
		shared::OnBeforeClose(browser);
	}

	bool Client::OnBeforeBrowse(CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		CefRefPtr<CefRequest> request,
		bool is_redirect) {
		CEF_REQUIRE_UI_THREAD();

		message_router_->OnBeforeBrowse(browser, frame);
		return false;
	}

	CefRefPtr<CefResourceHandler> Client::GetResourceHandler(
		CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		CefRefPtr<CefRequest> request) {
		CEF_REQUIRE_IO_THREAD();

		const std::string& url = request->GetURL();

		// This is a minimal implementation of resource loading. For more complex
		// usage (multiple files, zip archives, custom handlers, etc.) you might want
		// to use CefResourceManager. See the "resource_manager" target for an
		// example implementation.
		const std::string& resource_path = shared::GetResourcePath(url);
		if (!resource_path.empty())
			return shared::GetResourceHandler(resource_path);

		return NULL;
	}

	void Client::OnRenderProcessTerminated(CefRefPtr<CefBrowser> browser,
		TerminationStatus status) {
		CEF_REQUIRE_UI_THREAD();

		message_router_->OnRenderProcessTerminated(browser);
	}

	// Disable context menu
	void Client::OnBeforeContextMenu(
		CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		CefRefPtr<CefContextMenuParams> params,
		CefRefPtr<CefMenuModel> model) {
		CEF_REQUIRE_UI_THREAD();

		model->Clear();
	}

	bool Client::OnContextMenuCommand(
		CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		CefRefPtr<CefContextMenuParams> params,
		int command_id,
		EventFlags event_flags) {
		CEF_REQUIRE_UI_THREAD();

		//MessageBox(browser->GetHost()->GetWindowHandle(), L"The requested action is not supported", L"Unsupported Action", MB_OK | MB_ICONINFORMATION);
		return false;
	}
}  // namespace message_router