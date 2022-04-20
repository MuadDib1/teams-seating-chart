const path = require('path');
const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const ElectronPreferences = require('electron-preferences');

const TeamsUtils = require('./teams.js');

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
  if (isDebug()) {
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
        preferences.show();
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
  teamsWindow = await TeamsUtils.createStatusUpdateWindow(mainWindow, isDebug());
});

ipcMain.on('people-extracted', (event, people) => {
  teamsWindow.close();
  mainWindow.webContents.send('update-people', people);
  mainWindow.setTitle(`Teams 座席表 (${new Date().toLocaleString()} 時点)`)
});

ipcMain.on('open-chat', (event, email) => {
  TeamsUtils.openChat(email, useTeamsApp());
});

const green = '#92c353'
const red = '#c4314b'
const orange = '#fcb80e'
const gray = '#dcdcdc'
const defaultStatusColors = [
  ['連絡可能', green],
  ['取り込み中', red],
  ['応答不可', red],
  ['通話中', red],
  ['発表中', red],
  ['会議中', red],
  ['一時退席中', orange],
  ['退席中', orange],
  ['オフライン', gray],
]

const preferences = new ElectronPreferences({
  'dataStore': path.join(app.getPath('userData'), 'preferences.json'),
  'defaults': {
    'setting': {
      'input_delay': '1000',
      'use_teams_app': ['on'],
    },
    'data': {
      'layout': '[]',
      'status_colors': JSON.stringify(defaultStatusColors),
    },
  },
  // 'debug': true,
  sections: [
    {
      id: 'setting',
      label: '設定',
      icon: 'settings-gear-63',
      form: {
        groups: [
          {
            'label': 'ログイン設定',
            'fields': [
              {
                label: 'メールアドレス',
                key: 'email',
                type: 'text',
                help: 'Teamsへログインするメールアドレス'
              },
              {
                label: 'パスワード',
                key: 'password',
                type: 'text',
                inputType: 'password',
              },
            ]
          },
          {
            'label': '詳細設定',
            'fields': [
              {
                label: '入力待ち[ms]',
                key: 'input_delay',
                type: 'text',
              },
              {
                label: 'Teamsアプリでチャットを開く',
                key: 'use_teams_app',
                type: 'checkbox',
                options: [
                  { label: '有効', value: 'on' }
                ]
              },
              {
                label: 'デバッグモード',
                key: 'debug',
                type: 'checkbox',
                options: [
                  { label: '有効', value: 'on' }
                ]
              },
            ]
          },
        ]
      }
    },
    {
      id: 'data',
      label: '内部データ',
      icon: 'lock',
      form: {
        groups: [
          {
            'label': 'ツール内部で使用するデータです ※編集しないでください',
            'fields': [
              {
                label: 'レイアウト',
                key: 'layout',
                type: 'text',
              },
              {
                label: 'ステータスごとの色',
                key: 'status_colors',
                type: 'text',
              },
            ]
          },
        ]
      }
    },
  ]
});

const isDebug = () => {
  const debug = preferences.value('setting.debug');
  return !!debug && debug.includes('on');
}

const useTeamsApp = () => {
  const setting = preferences.value('setting.use_teams_app');
  return !!setting && setting.includes('on');
}
