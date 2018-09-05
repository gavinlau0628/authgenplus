const socket = io();
const client = feathers();

client.configure(feathers.socketio(socket));
client.configure(feathers.authentication({
  storage: window.localStorage
}));

socket.on('auth_generated', authOutout => {
	document.getElementById('authOut').innerText = authOutout;
});

socket.on('username_generated', authOutput => {
  document.getElementById('username').value = authOutput;
});

socket.on('password_generated', authOutput => {
  document.getElementById('password').value = authOutput;
});

var user;

client.authenticate().then(response => {
    client.service('users').find(queryObj = { query: { id: response.user.id }}).then(response => {
      user = response.data[0]._id;
    });
    loggedInInfo();
  }).catch(error => {
		console.log('No user logged in yet');
	});

document.addEventListener('click', async ev => {
	switch(ev.target.id) {
		case 'gen_auth': {
      genAuth();
			break;
		}
		case 'sign_up_sub': {
      signUp();
			break;
		}
    case 'sign_in_sub': {
      signIn();
      break;
    }
    case 'gen_auth_account': {
      genAuthAccount();
      break;
    }
    case 'sub_auth_info': {
      subAuthInfo();
      break;
    }
	}
});

function genAuth() {
  if(document.getElementById('minput').value < 6 || document.getElementById('minput').value > 30 || document.getElementById('maxput').value < 6 || document.getElementById('maxput').value > 30) {
    alert('Minimum length must be greater than 5 and maximum length must be less than 31');
  } else {
    console.log('here');
    var capChecked = 0;
    var numsChecked = 0;
    var specCharsChecked = 0;
    if(document.getElementById('capitalize').checked) {
      capChecked = 1;
    }
    if(document.getElementById('nums').checked) {
      numsChecked = 1;
    }
    if(document.getElementById('specChars').checked) {
      specCharsChecked = 1;
    }
    var authinput = {
      'stringput': document.getElementById('stringput').value,
      'capitalize': capChecked,
      'nums': numsChecked,
      'specChars': specCharsChecked,
      'minput': document.getElementById('minput').value,
      'maxput': document.getElementById('maxput').value
    };
    generateAuth(authinput);
  }
}

function genAuthAccount() {
  if(document.getElementById('minput').value < 6 || document.getElementById('minput').value > 30 || document.getElementById('maxput').value < 6 || document.getElementById('maxput').value > 30) {
    alert('Minimum length must be greater than 5 and maximum length must be less than 31');
  } else {
    var capChecked = 0;
    var numsChecked = 0;
    var specCharsChecked = 0;
    var username = 0;
    var password = 0;
    if(document.getElementById('capitalize').checked) {
      capChecked = 1;
    }
    if(document.getElementById('nums').checked) {
      numsChecked = 1;
    }
    if(document.getElementById('specChars').checked) {
      specCharsChecked = 1;
    }
    if(document.getElementById('uname').checked) {
      username = 1;
    }
    if(document.getElementById('pass').checked) {
      password = 1;
    }
    var authinput = {
      'stringput': document.getElementById('stringput').value,
      'capitalize': capChecked,
      'nums': numsChecked,
      'specChars': specCharsChecked,
      'minput': document.getElementById('minput').value,
      'maxput': document.getElementById('maxput').value,
      'username': username,
      'password': password
    };
    generateAuthAccount(authinput);
  }
}

function subAuthInfo() {
  if(document.getElementById('appsite').value && document.getElementById('username').value && document.getElementById('password').value) {
    let payload = {
      userId: user.id,
      appsite: document.getElementById('appsite').value,
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    }

    client.service('userdata').create(payload).then(response => {
      location.reload();
    });
  } else {
    alert('Please fill in all fields before submitting.');
  }
}

async function signUp() {
  let creds = getSignUpCreds();
  if(creds != 'REDO') {
    await client.service('users').create(creds);
    await signIn(creds);
  }
}

function getSignUpCreds() {
  let uname = document.getElementById('sign_up_uname').value;
  let pass = document.getElementById('sign_up_pass').value;
  let repass = document.getElementById('sign_up_repass').value;
  if(repass == pass) {
    const credentials = {
      username: document.getElementById('sign_up_uname').value,
      password: document.getElementById('sign_up_pass').value
    }
    return credentials;
  } else {
    alert('Password re-entered does not match');
    return 'REDO'
  }
}

async function signIn(credentials) {
  try {
    if(credentials) {
      const payload = Object.assign({ strategy: 'local' }, credentials);
      await client.authenticate(payload);
      await goHome();
    } else {
      const payload = Object.assign({ strategy: 'local' }, {
        username: document.getElementById('sign_in_uname').value,
        password: document.getElementById('sign_in_pass').value
      });
      await client.authenticate(payload);
      await goHome();
    }
  } catch(error) {
    console.log(error);
    alert(error);
  }
}

async function goHome() {
  console.log('go home');
  window.location.href = 'http://localhost:3031';
}

async function generateAuth(authinput) {
	socket.emit('gen_auth_info', authinput);
}

async function generateAuthAccount(authinput) {
	socket.emit('gen_auth_info_account', authinput);
}

async function loggedInInfo() {
  try {
    let authButton = document.getElementById('loginButton');
    authButton.innerHTML =  `<i class="fa fa-user-circle-o"></i> LOGOUT`;
    authButton.href = 'http://localhost:3031';
    authButton.addEventListener('click', () => {
      client.logout();
    });

    if(document.getElementById('afterThis')) {
      let accountLink = document.createElement('a');
      accountLink.href = './account.html';
      accountLink.classList.add('w3-bar-item');
      accountLink.classList.add('w3-button');
      accountLink.classList.add('w3-hide-small');
      accountLink.classList.add('w3-right');
      accountLink.classList.add('w3-hover-blue');
      accountLink.innerHTML = `<i class="fa fa-file-text-o"></i> ACCOUNT`;

      let afterThis = document.getElementById('afterThis');
      afterThis.after(accountLink);
    }

    if(document.getElementById('accounts')) {
      let table = document.getElementById('accounts');
      getAllUserAuthInfo().then(authInfos => {
        for(let i = 0; i < authInfos.length; i++) {
          let authInfo = authInfos[i];
          let trow = document.createElement('tr');

          let tdAppsite = document.createElement('td');
          tdAppsite.innerHTML = authInfo.appsite;
          trow.appendChild(tdAppsite);

          let tdUsername = document.createElement('td');
          tdUsername.innerHTML = authInfo.username;
          trow.appendChild(tdUsername);

          let tdPassword = document.createElement('td');
          tdPassword.innerHTML = authInfo.password;
          trow.appendChild(tdPassword);

          let tdDelete = document.createElement('td');
          let deleteButton = document.createElement('button');
          deleteButton.type = 'button';
          deleteButton.innerHTML = 'Delete';
          deleteButton.addEventListener('click', event => {
            client.service('userdata').remove(authInfo._id).then(response => {
              location.reload();
            });
          });
          deleteButton.classList.add('w3-button');
          deleteButton.classList.add('w3-black');
          deleteButton.classList.add('w3-button');
          deleteButton.classList.add('w3-hover-blue');
          deleteButton.classList.add('w3-border');
          deleteButton.classList.add('w3-round-large');
          deleteButton.classList.add('w3-center');
          tdDelete.appendChild(deleteButton);
          trow.appendChild(tdDelete);

          accounts.appendChild(trow);
        }
      });
    }
  } catch(error) {
    console.log(error);
  }
}

function getAllUserAuthInfo() {
  return new Promise(function(fulfill, reject) {
    client.service('userdata').find(queryData = {query: { userId: user }}).then(response => {
      fulfill(response.data);
    });
  });
}
