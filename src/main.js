const path = require('path');
const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');

const TeamsUtils = require('./teams.js');
const Settings = require('./settings.js');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

let mainWindow = null;
let teamsWindow = null;
let tray = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // skipTaskbar: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  if (Settings.isDebug()) {
    mainWindow.webContents.openDevTools();
  }
};

const setUpTray = () => {
  tray = new Tray(path.join(__dirname, 'assets/icon_white_256.png'));
  tray.setToolTip(app.getName());
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  })
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '設定',
      click: () => {
        Settings.show();
      }
    },
    {
      label: '終了',
      click: app.quit
    }
  ])
  tray.setContextMenu(contextMenu);
};

app.on('ready', () => {
  createWindow();
  setUpTray();
});

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

ipcMain.on('openTeams', async () => {
  teamsWindow = await TeamsUtils.createStatusUpdateWindow(mainWindow, Settings.isDebug());
});

ipcMain.on('people-extracted', (event, people) => {
  teamsWindow.close();
  mainWindow.webContents.send('update-people', people);
  mainWindow.setTitle(`Teams 座席表 (${new Date().toLocaleString()} 時点)`)
});

ipcMain.on('open-chat', (event, email) => {
  TeamsUtils.openChat(email, Settings.useTeamsApp());
});

