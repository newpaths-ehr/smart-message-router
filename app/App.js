import HomeScreen from './screens/HomeScreen.js';
import RuleScreen from './screens/RuleScreen.js';
import LogScreen from './screens/LogScreen.js';
import LoginScreen from './screens/LoginScreen.js';
import SignupScreen from './screens/SignupScreen.js';

let currentScreen = 'login';
let editingRule = null;

function navigate(screen, data = null) {
  currentScreen = screen;
  editingRule = data;
  render();
}

function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  if (currentScreen === 'login') LoginScreen(app, navigate);
  else if (currentScreen === 'signup') SignupScreen(app, navigate);
  else if (currentScreen === 'home') HomeScreen(app, navigate);
  else if (currentScreen === 'rule') RuleScreen(app, navigate, editingRule);
  else if (currentScreen === 'log') LogScreen(app, navigate);
}

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, go straight to home
  const token = localStorage.getItem('session_token');
  if (token) currentScreen = 'home';
  render();
});
