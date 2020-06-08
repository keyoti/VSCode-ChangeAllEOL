# Change All End Of Line Sequence

This extension uses the built-in command 'Change End Of Line Sequence' to change the line ending (LF or CRLF) of all files of a specified type(s) in the Visual Studio Code workspace.


## Usage


* WARNING: Currently there is NO WAY to abort the process (besides killing it), it won't actually save any changes automatically but it can take some time, sorry, please check the number of files first.
* Open the command pallette (CTRL+SHIFT+P) and type "Change All End Of Line Sequence".
* You will be asked for the file types that should have their line endings changed (directories starting with '.' are ignored).
* You will be asked to specify an optional whitelist and/or blacklist of file names to work on.  Eg. enter !node_modules to have it ignore the node_modules directory.
* You will be asked what line ending you want for those files.
* It will open and change all the files but they are NOT automatically saved (so confirm the changes and then Save All).



## New Features and Changes

Please fork it and send me a pull request!