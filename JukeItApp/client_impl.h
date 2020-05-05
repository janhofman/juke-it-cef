#ifndef CEF_MESSAGE_ROUTER_CLIENT_IMPL_H_
#define CEF_MESSAGE_ROUTER_CLIENT_IMPL_H_

#define _TURN_OFF_PLATFORM_STRING // we need to turn this off, because the U() macro from cpprest it messes up some boost templates

#include <string>

#include "include/cef_client.h"
#include "include/wrapper/cef_message_router.h"

#include "MsgHandler_FileServer.h"
#include "MsgHandler_MusicPlayer.h"
#include "MsgHandler_Configuration.h"
#include "MsgHandler_WebLogger.h"

namespace message_router {

	// Implementation of client handlers.
	class Client : public CefClient,
		public CefContextMenuHandler,
		public CefDisplayHandler,
		public CefLifeSpanHandler,
		public CefRequestHandler {
	public:
		explicit Client(const CefString& startup_url);

		// CefClient methods:
		CefRefPtr<CefContextMenuHandler> GetContextMenuHandler() OVERRIDE { return this; }
		CefRefPtr<CefDisplayHandler> GetDisplayHandler() OVERRIDE { return this; }
		CefRefPtr<CefLifeSpanHandler> GetLifeSpanHandler() OVERRIDE { return this; }
		CefRefPtr<CefRequestHandler> GetRequestHandler() OVERRIDE { return this; }
		bool OnProcessMessageReceived(CefRefPtr<CefBrowser> browser,
			CefProcessId source_process,
			CefRefPtr<CefProcessMessage> message) OVERRIDE;

		// CefContextMenuHandler methods: 
		void OnBeforeContextMenu(CefRefPtr<CefBrowser> browser,
			CefRefPtr<CefFrame> frame,
			CefRefPtr<CefContextMenuParams> params,
			CefRefPtr<CefMenuModel> model) OVERRIDE;

		bool OnContextMenuCommand(CefRefPtr<CefBrowser> browser,
			CefRefPtr<CefFrame> frame,
			CefRefPtr<CefContextMenuParams> params,
			int command_id,
			EventFlags event_flags) OVERRIDE;

		// CefDisplayHandler methods:
		void OnTitleChange(CefRefPtr<CefBrowser> browser, const CefString& title) OVERRIDE;

		// CefLifeSpanHandler methods:
		void OnAfterCreated(CefRefPtr<CefBrowser> browser) OVERRIDE;
		bool DoClose(CefRefPtr<CefBrowser> browser) OVERRIDE;
		void OnBeforeClose(CefRefPtr<CefBrowser> browser) OVERRIDE;

		// CefRequestHandler methods:
		bool OnBeforeBrowse(CefRefPtr<CefBrowser> browser,
			CefRefPtr<CefFrame> frame,
			CefRefPtr<CefRequest> request,
			bool is_redirect) OVERRIDE;

		CefRefPtr<CefResourceHandler> GetResourceHandler(
			CefRefPtr<CefBrowser> browser,
			CefRefPtr<CefFrame> frame,
			CefRefPtr<CefRequest> request) OVERRIDE;

		void OnRenderProcessTerminated(CefRefPtr<CefBrowser> browser, TerminationStatus status) OVERRIDE;

	private:
		CefRefPtr<CefMessageRouterBrowserSide> message_router_;
		scoped_ptr<CefMessageRouterBrowserSide::Handler> fileserver_handler;
		scoped_ptr<CefMessageRouterBrowserSide::Handler> musicplayer_handler;
		scoped_ptr<CefMessageRouterBrowserSide::Handler> config_handler;
		scoped_ptr<CefMessageRouterBrowserSide::Handler> webLogger_handler;

		const CefString startup_url_;

		// Track the number of browsers using this Client.
		int browser_ct_;

		IMPLEMENT_REFCOUNTING(Client);
		DISALLOW_COPY_AND_ASSIGN(Client);
	};
}
#endif