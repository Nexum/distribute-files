# distribute-files

### 1. Installation
```
    npm install distribute-files
```

### 2. Usage

###### Configuration
```
   new Distributor({
       debug: Boolean,                      // Show debug messages
       root: String,                        // The root for all local files, leave empty if none should be used, you will have to supply an absolute path later,
       servers: [
           {
               type: "ftp",
               connection: {                // see https://www.npmjs.com/package/ftp for all available options
                   host: "example.com",
                   port: 21,
                   user: "foo",
                   password: "bar"
               },
               root: null                   // if you supply a root, all target paths will be prefixed, ths is to enable different roots on different servers
           }, {
               type: "sftp",
               connection: {                // see https://www.npmjs.com/package/ssh2-sftp-client for all available options
                   host: "example.com",
                   port: 22,
                   user: "foo",             // alias for the original username param, you can use both this is just to keep the api clean(ish)
                   password: "bar"
               },
               root: null                   // if you supply a root, all target paths will be prefixed, ths is to enable different roots on different servers
           },
           function(file) {                 // completely custom transfer function, is expected to return a Promise, if you do something cool, add it to the transfer methods and pull request?
 
           }
       ]
   })
```

###### Single File
```
new Distributor({
    root: process.cwd(),                        
    servers: [
        {
            type: "sftp",
            connection: {
                port: 2222,
                host: "demo.wftpserver.com",
                user: "demo-user",
                password: "demo-user"
            },
            root: "/"
        },
        {
            type: "ftp",
            connection: {
                host: "speedtest.tele2.net"
            },
            root: "/upload"
        }
    ]
}).distributeFile("/file1.txt", "file1.text").then(success, error)
```

###### Multiple Files
```
new Distributor({
    root: process.cwd(),                        
    servers: [
        {
            type: "sftp",
            connection: {
                port: 2222,
                host: "demo.wftpserver.com",
                user: "demo-user",
                password: "demo-user"
            },
            root: "/"
        },
        {
            type: "ftp",
            connection: {
                host: "speedtest.tele2.net"
            },
            root: "/upload"
        }
    ]
}).distributeFile([
    "/file1.txt",
    "/file2.txt"
], [
    "/anotherpath/file1.text"
    "/anotherpath/file2.text"
]).then(success, error)
```

### 3. Features

Distribute/Upload any number of files to any number of servers.

###### Strategies
FTP

SFTP

Custom Function

### 4. Development

###### Run Tests
```
    npm install mocha -g
    npm install
    npm test
```