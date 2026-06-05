const searchInput = document.querySelector('#siteSearch');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const termo = searchInput.value.toLowerCase().trim();
    document.querySelectorAll('[data-search]').forEach(card => {
      const texto = card.dataset.search.toLowerCase();
      card.style.display = texto.includes(termo) ? '' : 'none';
    });
  });
}


/* Contador local de acessos
   Observação: este contador funciona apenas no navegador do visitante.
   Para contador global real, é necessário serviço externo/servidor. */
(function(){
  const badge = document.querySelector('.local-counter');
  const span = document.querySelector('#localVisitCount');
  if(!badge || !span) return;
  const page = badge.dataset.counterPage || location.pathname;
  const key = 'bioguaraLocalCounter_' + page;
  const count = (parseInt(localStorage.getItem(key) || '0', 10) + 1);
  localStorage.setItem(key, String(count));
  span.textContent = count;
})();
