# Website for Community Network

Build naming:

`<Y>.<D><M>.<H><M>`

Example: **v20.1118.1235**

## Order of releasing

1. Commit all changes to /dev/
2. Pull request /dev/ -> /build/
3. Auto Build
4. On success, merge
5. Prepare build release info, make docs changing and commit to /build/
5. Pull request & Merge /build/ -> /main/