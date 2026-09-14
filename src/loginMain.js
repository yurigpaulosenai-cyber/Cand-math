import { G } from './state/gameState.js';
import { loadState, saveState } from './storage/persistence.js';
import { showToast } from './ui/toastManager.js';
import { $ } from './utils/dom.js';

document.addEventListener('DOMContentLoaded', () => {
  const btnEntrar = $('btnEntrar');
  const btnCriar = $('btnCriar');
  const btnVisitante = $('btnVisitante');
  const btnVoltar = $('btnVoltar');
  const viewMenu = $('viewMenu');
  const viewForm = $('viewForm');
  const loginForm = $('loginForm');

  // Ação: Entrar (Carregar Perfil Existente)
  btnEntrar.addEventListener('click', async () => {
    await loadState(); // Tenta ler do IndexedDB
    if (G.profile && G.profile.childName) {
      // Perfil encontrado!
      sessionStorage.removeItem('guest');
      window.location.href = '/index.html';
    } else {
      showToast('Nenhum perfil encontrado! Crie uma conta primeiro.');
    }
  });

  // Ação: Jogar Sem Conta (Visitante)
  btnVisitante.addEventListener('click', () => {
    sessionStorage.setItem('guest', 'true');
    window.location.href = '/index.html';
  });

  // Ação: Mostrar Formulário de Criação
  btnCriar.addEventListener('click', () => {
    viewMenu.style.display = 'none';
    viewForm.style.display = 'block';
  });

  // Ação: Voltar para o Menu
  btnVoltar.addEventListener('click', () => {
    viewForm.style.display = 'none';
    viewMenu.style.display = 'flex';
  });

  // Ação: Salvar Formulário
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const childName = $('childName').value.trim();
    const childAge = parseInt($('childAge').value);
    const guardianName = $('guardianName').value.trim();
    const guardianEmail = $('guardianEmail').value.trim();
    
    if (!childName || !childAge || !guardianName || !guardianEmail) {
      showToast('Por favor, preencha todos os campos!');
      return;
    }
    
    G.profile = { childName, childAge, guardianName, guardianEmail };
    
    // Future Supabase integration...
    /*
    try {
      await supabase.from('profiles').insert([G.profile]);
    } catch(err) {
      console.warn('Erro ao salvar no Supabase', err);
    }
    */
    
    await saveState(); // Salva no IndexedDB
    sessionStorage.removeItem('guest');
    
    showToast('Perfil criado! Carregando o jogo...');
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1000);
  });
});
