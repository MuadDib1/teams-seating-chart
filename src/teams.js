const path = require('path');
const { BrowserWindow, shell } = require('electron');

module.exports.openChat = function(email, inTeamsApp) {
  const url = `${inTeamsApp ? 'msteams:' : 'https://teams.microsoft.com'}/l/chat/0/0?users=${email}`
  shell.openExternal(url);
}

module.exports.createWindowAndScrapePeople = async function(parentWindow, debug) {
  const width = 300;
  const height = 300;
  const x = parseInt(parentWindow.getPosition()[0] + parentWindow.getSize()[0] / 2 - width / 2);
  const y = parseInt(parentWindow.getPosition()[1] + parentWindow.getSize()[1] / 2 - height / 2);
  const teamsWindow = new BrowserWindow({
    parent: parentWindow,
    x, y, width, height,
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
  scrapePeople(wc);

  if (debug) {
    wc.openDevTools({ mode: 'bottom' });
    logEvent(wc, 'did-stop-loading');
  }

  teamsWindow.on('closed', () => {
    clearInterval(scrapePeopleIntervalId);
    parentWindow.webContents.send('scraping-window-closed');
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

let scrapePeopleIntervalId;
const scrapePeople = (webContents) => {
  const handler = () => {
    if (webContents.getURL().endsWith('?ctx=chat')) {
      scrapePeopleIntervalId = setInterval(() => {
        webContents.executeJavaScript('window.mainAPI.scrapePeople()');
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
