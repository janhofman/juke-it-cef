#include "app_browser_impl.h"
#include <experimental/filesystem>
#include <algorithm>

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
		auto current = std::experimental::filesystem::current_path();
		auto index = current.append("app").append("index.html").string();
		std::replace(index.begin(), index.end(), '\\', '/');
		return std::string("file:///") + index;
#endif
	}
}  // namespace message_router