const path = require('path');
const { BrowserWindow } = require('electron');

module.exports.createStatusUpdateWindow = async function(parentWindow, debug) {
  const teamsWindow = new BrowserWindow({
    parent: parentWindow,
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
  await wc.session.clearStorageData({
    storages: ['serviceworkers']
  });
  wc.loadURL('https://teams.microsoft.com/_?lm=deeplink&lmsrc=NeutralHomePageWeb&cmpid=WebSignIn&culture=ja-jp&country=jp#/conversations/?ctx=chat');

  processLogin(wc);
  getPeople(wc);

  if (debug) {
    wc.openDevTools({ mode: 'bottom' });
    logEvent(wc, 'did-stop-loading');
  }

  teamsWindow.on('closed', () => {
    clearInterval(getPeopleIntervalId);
    parentWindow.webContents.send('update-window-closed');
  })

  return teamsWindow;
}

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

const logEvent = (webcontens, name) => {
  webcontens.on(name, (e) => {
    console.log(name + '-----------')
    console.log('title: ' + webcontens.getTitle())
    console.log('url: ' + webcontens.getURL())
    console.log();
  })
}
