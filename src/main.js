const path = require('path');
const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const windowStateKeeper = require('electron-window-state');

const TeamsUtils = require('./teams.js');
const Settings = require('./settings.js');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const APP_TITLE = `Teams 座席表 ${app.getVersion()}`

let mainWindow = null;
let teamsWindow = null;
let tray = null;

const createWindow = () => {
  const winState = windowStateKeeper({
    defaultWidth: 800,
    defaultHeight: 600
  });
  mainWindow = new BrowserWindow({
    x: winState.x,
    y: winState.y,
    width: winState.width,
    height: winState.height,
    title: APP_TITLE,
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
  winState.manage(mainWindow);
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

ipcMain.on('scrape-people-from-teams', async () => {
  teamsWindow = await TeamsUtils.createWindowAndScrapePeople(mainWindow, Settings.isDebug());
});

ipcMain.on('people-scraped', (event, people) => {
  teamsWindow.close();
  mainWindow.webContents.send('people-scraped', people);
  mainWindow.setTitle(`${APP_TITLE} (${new Date().toLocaleString()} 時点)`)
});

ipcMain.on('open-chat', (event, email) => {
  TeamsUtils.openChat(email, Settings.useTeamsApp());
});
