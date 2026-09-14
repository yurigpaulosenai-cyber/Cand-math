import { $ } from '../utils/dom.js';
import { updateHubUI, startIdleMessages } from './hubUI.js';

export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
}

export function goHub() {
  showScreen('screenHub');
  updateHubUI();
  startIdleMessages();
}
