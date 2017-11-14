# juke-it-cef

## Setting up DEV environment
1. **Download and unpack Standard Distribution of CEF for your OS from [here](http://opensource.spotify.com/cefbuilds/index.html), version 3.3202.1683, then copy Debug and Release directories to project root folder**
2. **cd /path/to/cef-project**
3. **Create and enter the build directory.**
    * mkdir build
    * cd build
4. **Follow steps for your OS**
    * To perform a Linux build using a 32-bit CEF binary distribution on a 32-bit Linux platform or a 64-bit CEF binary distribution on a 64-bit Linux platform:
        * cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=Release ..
        * make -j4 cefclient cefsimple
    * To perform a macOS build using a 64-bit CEF binary distribution:
        * cmake -G "Xcode" ..
        * Then, open build\cef.xcodeproj in Xcode and select Product > Build.
    * To perform a Windows build using a 32-bit CEF binary distribution:
        * cmake -G "Visual Studio 14" ..
        * Then, open build\cef.sln in Visual Studio 2015 and select Build > Build Solution.
    * To perform a Windows build using a 64-bit CEF binary distribution:
        * cmake -G "Visual Studio 14 Win64" ..
        * Then, open build\cef.sln in Visual Studio 2015 and select Build > Build Solution.