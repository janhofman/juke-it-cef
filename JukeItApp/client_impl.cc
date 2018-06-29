// Copyright (c) 2017 The Chromium Embedded Framework Authors. All rights
// reserved. Use of this source code is governed by a BSD-style license that
// can be found in the LICENSE file.

#include "client_impl.h"
#include "sqlite_handler.h"
#include "music_handler.h"

#include "include/wrapper/cef_helpers.h"

#include "client_util.h"
#include "resource_util.h"

namespace message_router {

	namespace {

		const char kTestMessageName[] = "MessageRouterTest";

		// Handle messages in the browser process.
		class MessageHandler : public CefMessageRouterBrowserSide::Handler {
		public:
			explicit MessageHandler(const CefString& startup_url)
				: startup_url_(startup_url) {}

			// Called due to cefQuery execution in message_router.html.
			bool OnQuery(CefRefPtr<CefBrowser> browser,
				CefRefPtr<CefFrame> frame,
				int64 query_id,
				const CefString& request,
				bool persistent,
				CefRefPtr<Callback> callback) OVERRIDE {
				// Only handle messages from the startup URL.
				const std::string& url = frame->GetURL();
				if (url.find(startup_url_) != 0)
					return false;

				const std::string& message_name = request;
				if (message_name.find(kTestMessageName) == 0) {
					// Reverse the string and return.
					std::string result = message_name.substr(sizeof(kTestMessageName));
					std::reverse(result.begin(), result.end());
					callback->Success(result);
					return true;
				}

				return false;
			}

		private:
			const CefString startup_url_;

			DISALLOW_COPY_AND_ASSIGN(MessageHandler);
		};

	}  // namespace

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

			// Register handlers with the router.
			message_handler_.reset(new MessageHandler(startup_url_));
			message_router_->AddHandler(message_handler_.get(), false);

			sqlite_handler_.reset(new SqliteHandler(startup_url_));
			message_router_->AddHandler(sqlite_handler_.get(), false);

			music_handler_.reset(new MusicHandler(startup_url_));
			message_router_->AddHandler(music_handler_.get(), false);

			sqliteAPI_.reset(new SqliteAPI());
			fileserver_handler_.reset(new FileServerHandler(sqliteAPI_.get()));


			CefString address = "http://localhost";
			auto aaa = address.ToWString();
			std::string a;
			web::json::value response;
			fileserver_handler_->v1_Songs(100, 1, a, true, a, response);
			fileserver_.reset(new FileServerAPI(aaa, fileserver_handler_.get()));
			fileserver_->open().wait();
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
			message_router_->RemoveHandler(message_handler_.get());
			message_router_->RemoveHandler(sqlite_handler_.get());
			message_router_->RemoveHandler(music_handler_.get());

			message_handler_.reset();
			sqlite_handler_.reset();
			music_handler_.reset();
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