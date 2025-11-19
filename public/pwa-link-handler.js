// Handler para capturar links de autenticação e abrir no PWA
(function() {
  'use strict';
  
  // Detectar se está rodando como PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                window.navigator.standalone === true;
  
  if (!isPWA) return;
  
  console.log('PWA Link Handler: Inicializado');
  
  // Capturar cliques em links e forçar navegação interna
  document.addEventListener('click', function(e) {
    const target = e.target.closest('a');
    
    if (!target) return;
    
    const href = target.getAttribute('href');
    
    // Se for um link externo que aponta para o próprio domínio
    if (href && href.startsWith('http')) {
      const url = new URL(href);
      const currentUrl = new URL(window.location.href);
      
      // Se for o mesmo domínio ou subdomínio do app
      if (url.hostname === currentUrl.hostname || 
          url.hostname.includes('lovableproject.com') ||
          url.hostname.includes('creativebox.com.br')) {
        
        e.preventDefault();
        
        // Navegar internamente usando history API
        console.log('PWA Link Handler: Navegando para', href);
        
        // Redirecionar para a rota interna
        const path = url.pathname + url.search + url.hash;
        window.history.pushState({}, '', path);
        
        // Disparar evento de navegação para o React Router capturar
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
  }, true);
  
  // Handler para quando o PWA é aberto por um link externo
  window.addEventListener('load', function() {
    // Se tiver parâmetros de auth na URL, processar
    const urlParams = new URLSearchParams(window.location.search);
    const hasAuthParams = urlParams.has('token') || 
                         urlParams.has('type') || 
                         urlParams.has('access_token');
    
    if (hasAuthParams) {
      console.log('PWA Link Handler: Processando autenticação via deep link');
    }
  });
})();
