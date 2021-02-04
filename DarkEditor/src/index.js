const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const url = require('url');



app.on('ready', async () => {
  // Name the protocol whatever you want
  const protocolName = 'file'

  protocol.registerFileProtocol(protocolName, (request, callback) => {
    const url = request.url.replace(`${protocolName}://`, '')
    try {
      return callback(decodeURIComponent(url))
    }
    catch (error) {
      // Handle the error as needed
      console.error(error)
    }
  })
})


if (require('electron-squirrel-startup')) { 
  app.quit();
}

const createWindow = () => {
  
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences:
    {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


