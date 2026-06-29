// Entry point — loads the correct screen based on navigation state
// Screens: Home (rules list) → Rule (create/edit) → Log (history)

import HomeScreen from './screens/HomeScreen.js';
import RuleScreen from './screens/RuleScreen.js';
import LogScreen from './screens/LogScreen.js';

let currentScreen = 'home';
let editingRule = null;

function navigate(screen, data = null) {
  currentScreen = screen;
  editingRule = data;
  render();
}

function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  if (currentScreen === 'home') HomeScreen(app, navigate);
  else if (currentScreen === 'rule') RuleScreen(app, navigate, editingRule);
  else if (currentScreen === 'log') LogScreen(app, navigate);
}

document.addEventListener('DOMContentLoaded', render);
