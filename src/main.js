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
    // x: 1200,
    // y: 500,
    // skipTaskbar: true,
    // alwaysOnTop: true,
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
  tray = new Tray(path.join(__dirname, 'icon_256.png'));
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
    // x: 1200,
    // y: 500,
    webPreferences: {
      contextIsolation: true,
      partition: 'part' + new Date().getTime(),
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const wc = teamsWindow.webContents;
  wc.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.158 Safari/537.36';
  wc.loadURL(url);

  processLogin(wc);
  getPeople(wc);

  if (isDebug()) {
    wc.openDevTools();
    logEvent(wc, 'did-stop-loading');
  }

  teamsWindow.on('closed', () => {
    mainWindow.webContents.send('update-window-closed')
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

const getPeople = (webContents) => {
  webContents.on('did-stop-loading', () => {
    if (webContents.getURL().endsWith('?ctx=chat')) {
      webContents.executeJavaScript('window.mainAPI.getPeople()');
    }
  })
}

ipcMain.on('people-extracted', (event, people) => {
  console.log(people);
  teamsWindow.close();
  mainWindow.webContents.send('update-people', people);
});

const preferences = new ElectronPreferences({
  'dataStore': path.join(app.getPath('userData'), 'preferences.json'),
  'defaults': {
    'setting': {
      'input_delay': '1000',
    },
    'data': {
      'layout': '[]',
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
