
const {app, BrowserWindow} = require('electron');
const ipc = require('electron').ipcMain;
const execFile = require('child_process').execFile;
const path = require('path');
const fixPath = require('fix-path')

const scriptsPath = path.join(__dirname, 'dist');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
  // Create the browser window.
  // Due to many 'Not allowed to load local resource' like this one: https://github.com/electron/electron/issues/5107
  // If wanna package with asar, then must set web-security=false or you even can't load index.html
  win = new BrowserWindow({
      width: 800,
      height: 600,
      "web-preferences": {
          "web-security": false
      }
  });

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

let script = {
    darwin: path.join(scriptsPath, 'ezkey.sh'),
    win32: path.join(scriptsPath, 'ezkey.bat')
};

let fileName = script.darwin;

ipc.on('InvokeAction', function(event, data){
    console.log('Received adb request');
    let name = data[0];
    let pwd = data[1];
    keyin(name, pwd)
    .then((result)=>{
        event.sender.send('traceBug', result);
    });

});

ipc.on('SwitchOS', (event, flag)=>{
    fileName = flag ? script.win32:script.darwin;
    console.log('Received switchOS request: ' + fileName);
});

function keyin(name, pwd){
    fixPath();
    return new Promise((resolve, reject)=>{
        execFile(fileName, [name, pwd], {}, (err, stdout, stderr)=> {
            if(err){
                console.log(err);
                resolve({err, stdout, stderr, path: process.env.PATH});
                // throw err;
            }
            console.log(stdout);
            resolve({err, stdout, stderr, path: process.env.PATH});
        });
    });
}
