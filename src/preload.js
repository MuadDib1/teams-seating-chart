const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('mainAPI', {
  openTeams: () => { 
    ipcRenderer.send('openTeams')
  },
  onPeopleUpdated: (callback) => {
    ipcRenderer.on('update-people', callback);
  },
  getPeople: () => {
    console.log('[getPeople] triggered !!!!!!!!!!');

    const result = Array.from(document.querySelectorAll('.recipient-group-list-item'), item => {
      const name = item.querySelector('.cle-title').innerText;
      const statusSpan = item.querySelector('.ts-skype-status');
      const status = statusSpan ? statusSpan.title : null;
      return { name, status }
    }).filter(person => person.status);

    if (!result.length) {
      return
    }

    if (result.some(person => person.status === '状態不明')) {
      console.log('状態不明が含まれるのでスキップします');
      console.log(result);
      return
    }

    ipcRenderer.send('people-extracted', result);
  },
  processLogin: () => {
    console.log('[processLogin] triggered !!!!!!!!!!');

    const preferences = ipcRenderer.sendSync('getPreferences');
    if (!preferences.setting.mail || !preferences.setting.password) {
      return
    }

    setTimeout(() => {
      const submitButton = document.querySelector('input[type="submit"]') || document.querySelector('#submitButton');

      // メールアドレスの場合
      const email = document.querySelector('input[type="email"]');
      if (email && !email.value) {
        console.log('[processLogin] email input...')
        email.value = preferences.setting.mail;
        email.blur();
        submitButton.click();
        return
      }

      // アカウント選択の場合
      const aadTile = document.querySelector('#aadTile'); // 職場または学校アカウント
      if (aadTile) {
        aadTile.click();
        return
      }

      // パスワードの場合
      const password = document.querySelector('input[type="password"]');
      if (password) {
        password.value = preferences.setting.password;
        password.blur();
        submitButton.click();
        return
      }

      // 状態維持オプションの場合
      const rememberForm = document.querySelector('form[action="/kmsi"]');
      if (rememberForm) {
        submitButton.click();  
        return
      }
    }, preferences.setting.input_delay);
  }
})