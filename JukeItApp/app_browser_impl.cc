#include "client_impl.h"
#include "app_factory.h"
#include "browser_util.h"
#include "resource_util.h"

namespace message_router {

	namespace {

		std::string GetStartupURL() {
#if _DEBUG
			return std::string("http://localhost:3000");
#else
			return std::string("http://localhost:3000");
#endif
		}

	}  // namespace

	   // Implementation of CefApp for the browser process.
	class BrowserApp : public CefApp, public CefBrowserProcessHandler {
	public:
		BrowserApp() {}

		// CefApp methods:
		CefRefPtr<CefBrowserProcessHandler> GetBrowserProcessHandler() OVERRIDE {
			return this;
		}

		// CefBrowserProcessHandler methods:
		void OnContextInitialized() OVERRIDE {

			// Create the browser window.
			const CefString& startup_url = GetStartupURL();
			shared::CreateBrowser(new Client(startup_url), startup_url,
				CefBrowserSettings());
		}

	private:
		IMPLEMENT_REFCOUNTING(BrowserApp);
		DISALLOW_COPY_AND_ASSIGN(BrowserApp);
	};

}  // namespace message_router

namespace shared {

	CefRefPtr<CefApp> CreateBrowserProcessApp() {
		return new message_router::BrowserApp();
	}

}  // namespace shared