# juke-it-cef

## Setting up DEV environment

### Prerequisities
1. CMake 3.14 or higher ([download](https://cmake.org/download/))
2. NodeJS 8.0 or higher ([download](https://nodejs.org/en/download/))
3. Visual Studio 2017 or newer ([download](https://visualstudio.microsoft.com/downloads/))
4. Boost v 1.67 with pre-built binaries ([link](https://www.boost.org/doc/libs/1_67_0/more/getting_started/windows.html))

To build boost libraries, follow these steps
1. Download boost v 1.67 from the Boost link above
2. Unpack, then place unpacked folder (boost_1_67_0) on desired location (e.g., C:\Program Files\Boost)
3. Create a temporary folder for intermediate boost build files
4. Open command line (if you use Visual Studio, open [Developer Command Prompt for Visual Studio](https://docs.microsoft.com/en-us/dotnet/framework/tools/developer-command-prompt-for-vs) as Administrator) and navigate to boost (boost_1_67_0) folder
5. From the command line, navigate to unpacked directory and run following commands:
    * `bootstrap`
    * `.\b2 --build-dir=build-directory toolset=toolset-name --build-type=complete stage --with-system --with-date_time`, where build-directory is a temporary directory for intermediate build files you've created earlier and toolset-name is name of build tool (use msvc-14.1 for building with Visual Studio 2017/2019)
6. Add two environment variables to help CMake find Boost libraries:
    * `BOOST_ROOT` variable should contain path to root folder (e.g., C:\Program Files\Boost\boost_1_67_0)
    * `BOOST_LIBRARYDIR` variable should contain path to pre-built libraries in stage\lib folder (e.g., C:\Program Files\Boost\boost_1_67_0\stage\lib)

Refer to the Get started manual available via Boost link in case of additional questions.

### Cloning and setting up working directory
1. Clone the repository
2. Download and unpack Standard Distribution of CEF for your OS from [here](http://opensource.spotify.com/cefbuilds/index.html), **version 3.3202.1683** (use version filter), then copy **Debug** and **Release** directories to project root folder
3. Download and unpack additional external libraries from [here](https://www.dropbox.com/s/13az32lsxirskrf/libraries.zip?dl=0), copy the libraries folder to project root folder
4. On command line, navigate to root folder of your working directory
    * `cd /path/to/project-root-folder`
5. Create and enter the build directory.
    * `mkdir build`
    * `cd build`
6. Follow steps for your OS
    * ~~To perform a Linux build using a 32-bit CEF binary distribution on a 32-bit Linux platform or a 64-bit CEF binary distribution on a 64-bit Linux platform:~~
        * ~~`cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=Release ..`~~
        * ~~`make -j4 cefclient cefsimple`~~
    * ~~To perform a macOS build using a 64-bit CEF binary distribution:~~
        * ~~`cmake -G "Xcode" ..`~~
        * ~~Then, open build\cef.xcodeproj in Xcode and select Product > Build.~~
    * To perform a Windows build using a 32-bit CEF binary distribution:
        * Visual Studio 2017:
            * `cmake -G "Visual Studio 15" ..`
            * Then, open build\JukeIt.sln in Visual Studio 2017 and select Build > Build Solution.
        * Visual Studio 2019:
            * `cmake -G "Visual Studio 16 2019" -A Win32 ..`
            * Then, open build\JukeIt.sln in Visual Studio 2019 and select Build > Build Solution.
    * To perform a Windows build using a 64-bit CEF binary distribution:
        * Visual Studio 2017:
            * `cmake -G "Visual Studio 15 Win64" ..`
            * Then, open build\JukeIt.sln in Visual Studio 2017 and select Build > Build Solution.
        * Visual Studio 2019:
            * `cmake -G "Visual Studio 16 2019" -A x64 ..`
            * Then, open build\JukeIt.sln in Visual Studio 2019 and select Build > Build Solution.
    * Note: sometimes CMake fails to read environment variables to locate Boost directories. If that is the case, the path to Boost directory can be supplied as a parameter to cmake command
            * `-DBOOST_ROOT="path_to _boost_root_directory"` specifies location of Boost root directory
            * `-DBOOST_LIBRARYDIR="path_to_boost_lib_directory"` specifies loaction of directory containing Boost libraries
            * `cmake -G "Visual Studio 16 2019" -A x64 -DBOOST_ROOT="C:\Program Files\Boost\boost_1_67_0" -DBOOST_LIBRARYDIR="C:\Program Files\Boost\boost_1_67_0\stage\lib" ..` is an example of a command containing these parameters



### Building and using web app:

Desktop application uses web application as GUI. In Debug configuration, application accesses localhost:3000 and supports hot reloading, i.e. on code changes in web app, it is reloaded without the need for rebuilding. In Release configuration it accesses built web application in 'app' folder.

1. From command line, go to JukeItWeb directory
    * `cd path/to/project/JukeItWeb`
2. First time, you will need to install packages - run `npm install` command
3. In Debug environment, to run hot reloading server for debugging, run `npm start`.
4. To build the web application in Release environment,  run `npm run build`. After that, copy 'build' directory into root directory of built Release version of JukeIt App and rename it to 'app'
    * `xcopy build ..\build\JukeItApp\Release\app\ /E /Q`


---------------
Linux
apt-get build-essential //gcc
install openssh // https://cloudwafer.com/blog/installing-openssl-on-ubuntu-16-04-18-04/
download cmake, 
run ./bootstrap -- -DCMAKE_BUILD_TYPE:STRING=Release -DOPENSSL_ROOT_DIR=/usr/local/ssl -DOPENSSL_LIBRARIES=/usr/local/ssl/lib
    make
    sudo make install
sudo ./b2 install --build-dir=~/Downloads/boost_build toolset=gcc --build-type=complete stage --with-system --with-date_time --layout=versioned --prefix=/usr/

