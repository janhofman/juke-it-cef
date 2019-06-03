#include "app_browser_impl.h"

namespace message_router {
	
	void BrowserApp::OnContextInitialized() {
		// Create the browser window.
		const CefString& startup_url = GetStartupURL();
		shared::CreateBrowser(new Client(startup_url), startup_url, CefBrowserSettings());
	}


	std::string BrowserApp::GetStartupURL() {
#if _DEBUG
		return std::string("http://localhost:3000");
#else
		return std::string("http://localhost:3000");
#endif
	}
}  // namespace message_router