import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, get, remove, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDl-bNaeBYGKbkBGrpEfd7sSDu-Aoa5BRg",
  authDomain: "loll-657f3.firebaseapp.com",
  databaseURL: "https://loll-657f3-default-rtdb.firebaseio.com",
  projectId: "loll-657f3",
  storageBucket: "loll-657f3.appspot.com",
  messagingSenderId: "1028823108280",
  appId: "1:1028823108280:web:9b3421a1d777425dacc24d",
  measurementId: "G-4FJLHJ6THR"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
  const signupDiv = document.getElementById('signup');
  const loginDiv = document.getElementById('login');
  const chatDiv = document.getElementById('chat');
  const signupUsername = document.getElementById('signupUsername');
  const signupPassword = document.getElementById('signupPassword');
  const toggleSignupPassword = document.getElementById('toggleSignupPassword');
  const signupBtn = document.getElementById('signupBtn');
  const loginUsername = document.getElementById('loginUsername');
  const loginPassword = document.getElementById('loginPassword');
  const toggleLoginPassword = document.getElementById('toggleLoginPassword');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const displayName = document.getElementById('displayName');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const messagesDiv = document.getElementById('messages');
  const toSignup = document.getElementById('toSignup');
  const toLogin = document.getElementById('toLogin');
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  const menuDiv = document.getElementById('menu');
  const createPartyDiv = document.getElementById('createParty');
  const joinPartyDiv = document.getElementById('joinParty');
  const globalChatBtn = document.getElementById('globalChatBtn');
  const createPartyBtn = document.getElementById('createPartyBtn');
  const joinPartyBtn = document.getElementById('joinPartyBtn');
  const backToMenuFromCreate = document.getElementById('backToMenuFromCreate');
  const backToMenuFromJoin = document.getElementById('backToMenuFromJoin');
  const partyCodeSpan = document.getElementById('partyCode');
  const joinPartyCodeInput = document.getElementById('joinPartyCode');
  const leavePartyBtn = document.getElementById('leavePartyBtn');
  const partyCodeDisplay = document.getElementById('partyCodeDisplay');
  const deletePartyBtn = document.getElementById('deletePartyBtn');
  const notificationToggle = document.getElementById('notificationToggle');
  
  // Notification settings
  let notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
  let notificationSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-simple-notification-tone-3927.mp3');
  let windowFocused = true;
  let lastSeenTimestamp = Date.now();
  
  // Update notification toggle button state
  if (notificationToggle) {
    notificationToggle.checked = notificationsEnabled;
  }

  // Track window focus for notifications
  window.addEventListener('focus', () => {
    windowFocused = true;
    lastSeenTimestamp = Date.now();
  });
  
  window.addEventListener('blur', () => {
    windowFocused = false;
  });

  // Handle notification permission
  function requestNotificationPermission() {
    if (!('Notification' in window)) {
      showToast('This browser does not support notifications');
      return;
    }
    
    if (Notification.permission === 'granted') {
      enableNotifications();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          enableNotifications();
        }
      });
    }
  }
  
  function enableNotifications() {
    notificationsEnabled = true;
    localStorage.setItem('notificationsEnabled', 'true');
    if (notificationToggle) notificationToggle.checked = true;
    showToast('Notifications enabled');
  }
  
  function disableNotifications() {
    notificationsEnabled = false;
    localStorage.setItem('notificationsEnabled', 'false');
    if (notificationToggle) notificationToggle.checked = false;
    showToast('Notifications disabled');
  }
  
  if (notificationToggle) {
    notificationToggle.addEventListener('change', function() {
      if (this.checked) {
        requestNotificationPermission();
      } else {
        disableNotifications();
      }
    });
  }

  const togglePasswordVisibility = (input, toggleBtn) => {
    toggleBtn.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
      } else {
        input.type = 'password';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>'; 
      }
    });
  };

  togglePasswordVisibility(signupPassword, toggleSignupPassword);
  togglePasswordVisibility(loginPassword, toggleLoginPassword);

  toSignup.addEventListener('click', () => {
    loginDiv.style.display = 'none';
    signupDiv.style.display = 'block';
  });

  toLogin.addEventListener('click', () => {
    signupDiv.style.display = 'none';
    loginDiv.style.display = 'block';
  });

  function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 500);
    }, 3000);
  }

  // Format timestamp
  function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    
    if (isToday) {
      return `${hours}:${minutes} ${ampm}`;
    } else {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day} - ${hours}:${minutes} ${ampm}`;
    }
  }

  signupBtn.addEventListener('click', () => {
    const username = signupUsername.value.trim();
    const password = signupPassword.value;

    if (username && password) {
      const userRef = ref(db, `users/${username}`);
      get(userRef)
        .then(snapshot => {
          if (snapshot.exists()) {
            showToast('An account with this username already exists.');
          } else {
            set(userRef, { password })
              .then(() => {
                showToast('Signup successful! Please login.');
                signupDiv.style.display = 'none';
                loginDiv.style.display = 'block';
              })
              .catch(err => showToast('Error during signup: ' + err));
          }
        })
        .catch(err => showToast('Error checking username: ' + err));
    } else {
      showToast('Please enter both username and password.');
    }
  });

  loginBtn.addEventListener('click', () => {
    const username = loginUsername.value.trim();
    const password = loginPassword.value;

    if (username && password) {
      const userRef = ref(db, `users/${username}`);
      get(userRef)
        .then(snapshot => {
          if (snapshot.exists() && snapshot.val().password === password) {
            localStorage.setItem('user', JSON.stringify({ username }));
            set(ref(db, `online/${username}`), true);
            showMenu();
            showToast('Login successful.');
            // Request notification permission on login
            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
              requestNotificationPermission();
            }
          } else {
            showToast('Invalid username or password.');
          }
        })
        .catch(err => showToast('Error during login: ' + err));
    }
  });

  messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();  
      sendBtn.click();  
    }
  });

  // For Signup
  signupUsername.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      signupBtn.click();
    }
  });

  signupPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      signupBtn.click();
    }
  });

  // For Login
  loginUsername.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      loginBtn.click();
    }
  });

  loginPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      loginBtn.click();
    }
  });

  sendBtn.addEventListener('click', () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const text = messageInput.value.trim();
    const partyCode = localStorage.getItem('partyCode');

    if (text) {
      const messagesRef = partyCode ? ref(db, `parties/${partyCode}/messages`) : ref(db, 'messages');
      push(messagesRef, { 
        username: currentUser.username, 
        text,
        timestamp: Date.now() // Add timestamp
      });
      messageInput.value = '';
    }
  });

  logoutBtn.addEventListener('click', () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    set(ref(db, `online/${currentUser.username}`), null);
    localStorage.removeItem('user');
    chatDiv.style.display = 'none';
    loginDiv.style.display = 'block';
  });

  // Adding the delete account functionality
  deleteAccountBtn.addEventListener('click', () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const username = currentUser.username;

    // Confirm the deletion with the user
    if (confirm(`Are you sure you want to delete your account, ${username}? This action is irreversible.`)) {
      // Delete the user data from Firebase (just remove the user from users and online)
      const userRef = ref(db, `users/${username}`);
      const onlineRef = ref(db, `online/${username}`);

      // Remove the user from the users list
      set(userRef, null)
        .then(() => {
          // Remove the user from the online users list
          set(onlineRef, null)
            .then(() => {
              // Clear the local storage
              localStorage.removeItem('user');
              showToast('Your account has been deleted.');
              window.location.reload(); // Reload the page
            })
            .catch(err => showToast('Error removing from online users: ' + err));
        })
        .catch(err => showToast('Error deleting account: ' + err));
    }
  });

  // Function to generate a random party code
  function generatePartyCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  // Function to show the menu
  function showMenu() {
    loginDiv.style.display = 'none';
    signupDiv.style.display = 'none';
    chatDiv.style.display = 'none';
    createPartyDiv.style.display = 'none';
    joinPartyDiv.style.display = 'none';
    menuDiv.style.display = 'block';
    const currentUser = JSON.parse(localStorage.getItem('user'));
    menuDisplayName.textContent = currentUser.username;
  }

  globalChatBtn.addEventListener('click', () => {
    menuDiv.style.display = 'none';
    loadGlobalPartyChat();
  });
  
  function loadGlobalPartyChat() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    // Check if the global party already exists
    const globalPartyCode = "ECLIPSE";  // Set a fixed global party code
    get(ref(db, `parties/${globalPartyCode}`))
      .then(snapshot => {
        if (!snapshot.exists()) {
          // If the global party doesn't exist, create it
          set(ref(db, `parties/${globalPartyCode}`), {
            creator: "System", // Creator is the system for global chat
            messages: {}
          }).then(() => {
            showToast('Global party created.');
            joinGlobalParty(currentUser.username, globalPartyCode);
          }).catch(err => showToast('Error creating global party: ' + err));
        } else {
          // If the global party exists, just join it
          joinGlobalParty(currentUser.username, globalPartyCode);
        }
      })
      .catch(err => showToast('Error checking global party: ' + err));
  }
  
  function joinGlobalParty(username, globalPartyCode) {
    localStorage.setItem('partyCode', globalPartyCode);
    partyCodeDisplay.textContent = globalPartyCode;
    chatDiv.style.display = 'block';
    const currentUser = JSON.parse(localStorage.getItem('user'));
    displayName.textContent = currentUser.username;
    
    const messagesRef = ref(db, `parties/${globalPartyCode}/messages`);
    onValue(messagesRef, (snapshot) => {
      messagesDiv.innerHTML = '';
      const messages = snapshot.val();
      if (messages) {
        // Convert messages object to array and sort by timestamp
        const messageArray = Object.entries(messages).map(([key, msg]) => ({
          key,
          ...msg
        }));
        
        messageArray.sort((a, b) => {
          return (a.timestamp || 0) - (b.timestamp || 0);
        });
        
        messageArray.forEach(msg => {
          const div = document.createElement('div');
          div.className = 'message';
          
          // Check if this is a new message (after last seen)
          if (msg.timestamp && msg.timestamp > lastSeenTimestamp) {
            div.classList.add('new-message');
          }
          
          // Create timestamp element
          const timestampSpan = document.createElement('span');
          timestampSpan.className = 'timestamp';
          timestampSpan.textContent = formatTimestamp(msg.timestamp);
          
          // Create message content
          const contentDiv = document.createElement('div');
          contentDiv.className = 'message-content';
          
          // Create username element
          const usernameSpan = document.createElement('span');
          usernameSpan.className = 'username';
          usernameSpan.textContent = `${msg.username}`;
          
          // Create text element
          const textSpan = document.createElement('span');
          textSpan.className = 'message-text';
          textSpan.textContent = msg.text;
          
          // Assemble message
          contentDiv.appendChild(usernameSpan);
          contentDiv.appendChild(document.createTextNode(': '));
          contentDiv.appendChild(textSpan);
          
          div.appendChild(contentDiv);
          div.appendChild(timestampSpan);
          
          messagesDiv.appendChild(div);
        });
        
        // If window not focused, play notification sound
        if (!windowFocused && messageArray.length > 0) {
          const latestMessage = messageArray[messageArray.length - 1];
          if (latestMessage.timestamp > lastSeenTimestamp) {
            if (notificationsEnabled) {
              notificationSound.play().catch(e => {
                console.log('Sound play error:', e);
              });
            
              // Show browser notification if enabled
              if (Notification.permission === 'granted') {
                const notification = new Notification("New Eclipse Message", {
                  body: `${latestMessage.username}: ${latestMessage.text}`,
                  icon: 'favicon.png'
                });
                
                notification.onclick = function() {
                  window.focus();
                  this.close();
                };
                
                // Auto close after 5 seconds
                setTimeout(() => notification.close(), 10000);
              }
            }
          }
        }
      }
      
      // Scroll to bottom
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
  
    deletePartyBtn.style.display = 'none'; 
  }
  
  sendBtn.addEventListener('click', () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const text = messageInput.value.trim();
    const partyCode = localStorage.getItem('partyCode');
  
    if (text) {
      const messagesRef = ref(db, `parties/${partyCode}/messages`);
      push(messagesRef, { 
        username: currentUser.username, 
        text,
        timestamp: Date.now() // Add timestamp
      });
      messageInput.value = '';
    }
  });  

  createPartyBtn.addEventListener('click', () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const partyCode = generatePartyCode();
    set(ref(db, `parties/${partyCode}`), { creator: currentUser.username, messages: {} });
    partyCodeSpan.textContent = partyCode;
    menuDiv.style.display = 'none';
    createPartyDiv.style.display = 'block';
  });

  joinPartyBtn.addEventListener('click', () => {
    menuDiv.style.display = 'none';
    joinPartyDiv.style.display = 'block';
  });

  backToMenuFromCreate.addEventListener('click', showMenu);
  backToMenuFromJoin.addEventListener('click', showMenu);

  joinPartySubmitBtn.addEventListener('click', () => {
    const partyCode = joinPartyCodeInput.value.trim();
    if (partyCode) {
      get(ref(db, `parties/${partyCode}`))
        .then(snapshot => {
          if (snapshot.exists()) {
            localStorage.setItem('partyCode', partyCode);
            partyCodeDisplay.textContent = partyCode;
            joinPartyDiv.style.display = 'none';
            loadPartyChat(partyCode);
            showToast('Joined party successfully.');
          } else {
            showToast('Invalid party code.');
          }
        })
        .catch(err => showToast('Error joining party: ' + err));
    }
  });

  function loadPartyChat(partyCode) {
    chatDiv.style.display = 'block';
    const currentUser = JSON.parse(localStorage.getItem('user'));
    displayName.textContent = currentUser.username;
    partyCodeDisplay.textContent = partyCode;

    const messagesRef = ref(db, `parties/${partyCode}/messages`);
    onValue(messagesRef, (snapshot) => {
      messagesDiv.innerHTML = '';
      const messages = snapshot.val();
      if (messages) {
        // Convert messages object to array and sort by timestamp
        const messageArray = Object.entries(messages).map(([key, msg]) => ({
          key,
          ...msg
        }));
        
        messageArray.sort((a, b) => {
          return (a.timestamp || 0) - (b.timestamp || 0);
        });
        
        messageArray.forEach(msg => {
          const div = document.createElement('div');
          div.className = 'message';
          
          // Check if this is a new message (after last seen)
          if (msg.timestamp && msg.timestamp > lastSeenTimestamp) {
            div.classList.add('new-message');
          }
          
          // Create timestamp element
          const timestampSpan = document.createElement('span');
          timestampSpan.className = 'timestamp';
          timestampSpan.textContent = formatTimestamp(msg.timestamp);
          
          // Create message content
          const contentDiv = document.createElement('div');
          contentDiv.className = 'message-content';
          
          // Create username element
          const usernameSpan = document.createElement('span');
          usernameSpan.className = 'username';
          usernameSpan.textContent = `${msg.username}`;
          
          // Create text element
          const textSpan = document.createElement('span');
          textSpan.className = 'message-text';
          textSpan.textContent = msg.text;
          
          // Assemble message
          contentDiv.appendChild(usernameSpan);
          contentDiv.appendChild(document.createTextNode(': '));
          contentDiv.appendChild(textSpan);
          
          div.appendChild(contentDiv);
          div.appendChild(timestampSpan);
          
          messagesDiv.appendChild(div);
        });
        
        // If window not focused, play notification sound
        if (!windowFocused && messageArray.length > 0) {
          const latestMessage = messageArray[messageArray.length - 1];
          if (latestMessage.timestamp > lastSeenTimestamp) {
            if (notificationsEnabled) {
              notificationSound.play().catch(e => {
                console.log('Sound play error:', e);
              });
            
              // Show browser notification if enabled
              if (Notification.permission === 'granted') {
                const notification = new Notification("New Message in Eclipse", {
                  body: `${latestMessage.username}: ${latestMessage.text}`,
                  icon: 'favicon.png'
                });
                
                notification.onclick = function() {
                  window.focus();
                  this.close();
                };
                
                // Auto close after 5 seconds
                setTimeout(() => notification.close(), 5000);
              }
            }
          }
        }
      }
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    get(ref(db, `parties/${partyCode}`))
      .then(snapshot => {
        if (snapshot.exists() && snapshot.val().creator === currentUser.username) {
          deletePartyBtn.style.display = 'block';
        } else {
          deletePartyBtn.style.display = 'none';
        }
      })
      .catch(err => console.error('Error checking party creator: ' + err));
  }

  function loadChat() {
    showMenu();
  }

  const currentUser = JSON.parse(localStorage.getItem('user'));
  if (currentUser) showMenu();
  else loginDiv.style.display = 'block';

  if (leavePartyBtn) {
    leavePartyBtn.addEventListener('click', leaveParty);
  } else {
    console.error('leavePartyBtn not found');
  }

  if (deletePartyBtn) {
    deletePartyBtn.addEventListener('click', deleteParty);
  } else {
    console.error('deletePartyBtn not found');
  }

  function leaveParty() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const partyCode = localStorage.getItem('partyCode');

    if (currentUser && partyCode) {
      const userRef = ref(db, `parties/${partyCode}/users/${currentUser.username}`);
      remove(userRef)
        .then(() => {
          showToast('You have left the party.');
          chatDiv.style.display = 'none';
          showMenu();
        })
        .catch(err => showToast('Error leaving party: ' + err));
    } else {
      showToast('No party to leave.');
    }
  }

  function deleteParty() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const partyCode = localStorage.getItem('partyCode');

    if (currentUser && partyCode) {
      const partyRef = ref(db, `parties/${partyCode}`);
      get(partyRef)
        .then(snapshot => {
          if (snapshot.exists() && snapshot.val().creator === currentUser.username) {
            remove(partyRef)
              .then(() => {
                showToast('Party deleted successfully.');
                chatDiv.style.display = 'none';
                showMenu();
              })
              .catch(err => showToast('Error deleting party: ' + err));
          } else {
            showToast('You are not the creator of this party.');
          }
        })
        .catch(err => showToast('Error checking party: ' + err));
    } else {
      showToast('No party to delete.');
    }
  }
});
