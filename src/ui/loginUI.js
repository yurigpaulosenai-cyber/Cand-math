import { G } from '../state/gameState.js';
import { saveState } from '../storage/persistence.js';
import { showScreen } from './screenManager.js';
import { $ } from '../utils/dom.js';
import { showToast } from './toastManager.js';

export function setupLogin() {
  const form = $('loginForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const childName = $('childName').value.trim();
    const childAge = parseInt($('childAge').value);
    const guardianName = $('guardianName').value.trim();
    const guardianEmail = $('guardianEmail').value.trim();
    
    if (!childName || !childAge || !guardianName || !guardianEmail) {
      showToast('Por favor, preencha todos os campos!');
      return;
    }
    
    G.profile = {
      childName,
      childAge,
      guardianName,
      guardianEmail
    };
    
    // Futura integração com o Supabase pode ser inserida aqui:
    /*
    try {
      await supabase.from('profiles').insert([G.profile]);
    } catch(err) {
      console.warn('Erro ao salvar no Supabase', err);
    }
    */
    
    await saveState();
    
    showToast('Perfil criado com sucesso! Divirta-se!');
    
    // Ir para tela de splash
    document.querySelector('.splash-koala-bubble').textContent = `Olá, ${childName}! Sou Juju Candy!`;
    showScreen('screenSplash');
  });
}
