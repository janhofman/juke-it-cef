#ifndef CEF_APP_BROWSER_IMPL_H_
#define CEF_APP_BROWSER_IMPL_H_

#include "client_impl.h"
#include "app_factory.h"
#include "browser_util.h"

namespace message_router {
	// Implementation of CefApp for the browser process.
	class BrowserApp : public CefApp, public CefBrowserProcessHandler {
	public:
		BrowserApp() {}

		// CefApp methods:
		inline CefRefPtr<CefBrowserProcessHandler> GetBrowserProcessHandler() OVERRIDE {
			return this;
		}

		// CefBrowserProcessHandler methods:
		void OnContextInitialized() OVERRIDE;

	private:
		std::string GetStartupURL();

		IMPLEMENT_REFCOUNTING(BrowserApp);
		DISALLOW_COPY_AND_ASSIGN(BrowserApp);
	};

}  // namespace message_router

namespace shared {

	inline CefRefPtr<CefApp> CreateBrowserProcessApp() {
		return new message_router::BrowserApp();
	}

}  // namespace shared

#endif