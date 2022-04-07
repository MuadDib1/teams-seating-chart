const { app, BrowserWindow, BrowserView, ipcMain, Menu, Tray } = require('electron');
const path = require('path');
const ElectronPreferences = require('electron-preferences');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const url = 'https://teams.microsoft.com/_?lm=deeplink&lmsrc=NeutralHomePageWeb&cmpid=WebSignIn&culture=ja-jp&country=jp#/conversations/?ctx=chat';

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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
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
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('openTeams', () => {
  teamsWindow = new BrowserWindow({
    parent: mainWindow,
    width: 300,
    height: 300,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      partition: 'part1',
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const wc = teamsWindow.webContents;
  wc.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.158 Safari/537.36';
  wc.loadURL(url);

  processLogin(wc);
  getPeople(wc);

  if (isDebug()) {
    wc.openDevTools({ mode: 'bottom' });
    logEvent(wc, 'did-stop-loading');
  }

  teamsWindow.on('closed', () => {
    clearInterval(getPeopleIntervalId);
    mainWindow.webContents.send('update-window-closed');
  })
})

const processLogin = (webContents) => {
  webContents.on('did-stop-loading', () => {
    const title = webContents.getTitle();
    if (title === 'アカウントにサインイン' || title === 'サインイン') {
      webContents.executeJavaScript('window.mainAPI.processLogin()');
    }
  })
}

let getPeopleIntervalId;
const getPeople = (webContents) => {
  const handler = () => {
    if (webContents.getURL().endsWith('?ctx=chat')) {
      getPeopleIntervalId = setInterval(() => {
        webContents.executeJavaScript('window.mainAPI.getPeople()');
      }, 3000);
      webContents.removeListener('did-stop-loading', handler);
    }
  }
  webContents.on('did-stop-loading', handler);
}

ipcMain.on('people-extracted', (event, people) => {
  console.log(people);
  teamsWindow.webContents.session.clearStorageData({
    storages: ['serviceworkers']
  });
  teamsWindow.close();
  mainWindow.webContents.send('update-people', people);
  mainWindow.setTitle(`Teams 座席表 (${new Date().toLocaleString()} 時点)`)
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

const logEvent = (webcontens, name) => {
  webcontens.on(name, (e) => {
    console.log(name + '-----------')
    console.log('title: ' + webcontens.getTitle())
    console.log('url: ' + webcontens.getURL())
    console.log();
  })
}
