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
