const categories = [
  { name: 'Petróleo', id: 'petroleo', heading: 'Petróleo & Energía', color: 'emerald' },
  { name: 'IA', id: 'ia', heading: 'Inteligencia Artificial', color: 'blue' },
  { name: 'Cripto', id: 'cripto', heading: 'Mercado Cripto', color: 'amber' },
  { name: 'Economía', id: 'economia', heading: 'Economía Global', color: 'purple' }
];

const articles = [
  {
    id: 'fmi-inversion-ia',
    category: 'IA',
    title: 'El FMI prevé que la inversión en IA sostendrá el crecimiento mundial',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop',
    imageAlt: 'Representación de redes neuronales e inteligencia artificial',
    description: 'Según las últimas proyecciones, el impulso del sector tecnológico actuará como amortiguador ante tensiones geopolíticas e incertidumbres financieras.',
    readTime: '4 min de lectura',
    date: 'Reciente',
    body: [
      'El Fondo Monetario Internacional destacó el papel que la inteligencia artificial está desempeñando en la economía global.',
      'A pesar de las tensiones geopolíticas y las presiones sobre las cadenas de suministro, la inversión privada y corporativa en infraestructura de IA y automatización puede ayudar a amortiguar el impacto en el crecimiento mundial.'
    ]
  },
  {
    id: 'bitcoin-consolidacion',
    category: 'Cripto',
    title: 'Bitcoin consolida su precio alrededor de los $81,900',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
    imageAlt: 'Circuito electrónico que representa el mercado cripto',
    description: 'Tras alcanzar máximos previos, el mercado cripto evalúa los flujos en los fondos cotizados (ETF) y se prepara para el último trimestre.',
    readTime: '3 min de lectura',
    date: 'Reciente',
    body: [
      'El mercado de criptomonedas registra un periodo de consolidación estratégica.',
      'Los flujos de capital institucional a través de los ETF spot continúan siendo un indicador que los participantes siguen mientras evalúan los movimientos del mercado.'
    ]
  },
  {
    id: 'opep-proyecciones',
    category: 'Petróleo',
    title: 'OPEP+ mantiene sus proyecciones de extracción para productores externos',
    image: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=800&auto=format&fit=crop',
    imageAlt: 'Instalación industrial de refinación de petróleo',
    description: 'El organismo reafirma la estabilidad en el volumen de bombeo independiente, monitoreando el equilibrio entre oferta y demanda global.',
    readTime: '5 min de lectura',
    date: 'Hace 4 días',
    body: [
      'La OPEP+ mantiene sus proyecciones de extracción para los productores externos.',
      'La publicación destaca el seguimiento del volumen de bombeo y del equilibrio entre la oferta y la demanda global.'
    ]
  },
  {
    id: 'anthropic-agentes',
    category: 'IA',
    title: 'Anthropic prepara su debut en Wall Street acelerando el desarrollo de agentes',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop',
    imageAlt: 'Ilustración abstracta sobre tecnología e inteligencia artificial',
    description: 'La firma detrás de Claude alinea su salida a bolsa mientras los modelos autónomos redefinen la automatización en el desarrollo de software.',
    readTime: '4 min de lectura',
    date: 'Reciente',
    body: [
      'Anthropic, la firma detrás de Claude, prepara su debut en Wall Street mientras acelera el desarrollo de agentes.',
      'La noticia pone el foco en los modelos autónomos y en cómo la automatización puede transformar el desarrollo de software.'
    ]
  },
  {
    id: 'fmi-pib-global',
    category: 'Economía',
    title: 'El FMI eleva la previsión del PIB global hasta el 3,1%',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop',
    imageAlt: 'Gráficos financieros y datos de mercado',
    description: 'Pese al impacto en precios de energía y suministros, el ajuste al alza refleja resistencia en las principales economías emergentes y desarrolladas.',
    readTime: '5 min de lectura',
    date: 'Hace 5 días',
    body: [
      'El FMI elevó su previsión del PIB global hasta el 3,1%.',
      'El ajuste considera el impacto de los precios de energía y suministros, junto con la resistencia observada en economías emergentes y desarrolladas.'
    ]
  }
];

const categoryStyles = {
  emerald: {
    badge: 'border-emerald-500/30 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    hover: 'hover:border-emerald-500',
    marker: 'bg-emerald-500'
  },
  blue: {
    badge: 'border-blue-500/30 bg-blue-500/20 text-blue-600 dark:text-blue-400',
    hover: 'hover:border-blue-500',
    marker: 'bg-blue-500'
  },
  amber: {
    badge: 'border-amber-500/30 bg-amber-500/20 text-amber-600 dark:text-amber-400',
    hover: 'hover:border-amber-500',
    marker: 'bg-amber-500'
  },
  purple: {
    badge: 'border-purple-500/30 bg-purple-500/20 text-purple-600 dark:text-purple-400',
    hover: 'hover:border-purple-500',
    marker: 'bg-purple-500'
  }
};

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[character]);

const articleCard = (article) => {
  const category = categories.find((item) => item.name === article.category);
  const style = categoryStyles[category.color];

  return `
    <article class="news-card ${style.hover}">
      <button class="news-card-button" type="button" data-article-id="${escapeHtml(article.id)}" aria-label="Leer noticia: ${escapeHtml(article.title)}">
        <div class="relative h-48">
          <img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.imageAlt)}" class="h-full w-full object-cover" loading="lazy">
          <span class="absolute left-3 top-3 rounded-md border px-2.5 py-1 text-xs font-semibold ${style.badge}">${escapeHtml(article.category)}</span>
        </div>
        <div class="p-5">
          <h3 class="mb-2 text-lg font-bold leading-snug text-gray-900 transition dark:text-white">${escapeHtml(article.title)}</h3>
          <p class="mb-4 text-sm leading-relaxed text-gray-600 dark:text-[#8b949e]">${escapeHtml(article.description)}</p>
          <div class="flex justify-between text-xs text-gray-500 dark:text-[#787880]">
            <span>${escapeHtml(article.readTime)}</span>
            <span>${escapeHtml(article.date)}</span>
          </div>
        </div>
      </button>
    </article>`;
};

const allNewsGrid = document.getElementById('allNewsGrid');
const categorySections = document.getElementById('categorySections');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const resultCount = document.getElementById('resultCount');
const emptyState = document.getElementById('emptyState');
const modal = document.getElementById('newsModal');
const modalDialog = modal.querySelector('[role="dialog"]');
const closeModalButton = document.getElementById('closeModal');
let previouslyFocusedElement = null;
let previousBodyOverflow = '';

document.getElementById('currentYear').textContent = new Date().getFullYear();

function renderNews() {
  const query = searchInput.value.trim().toLocaleLowerCase('es');
  const selectedCategory = categoryFilter.value;
  const matchingArticles = articles.filter((article) => {
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    const searchableText = `${article.title} ${article.description} ${article.category}`.toLocaleLowerCase('es');
    return matchesCategory && searchableText.includes(query);
  });

  allNewsGrid.innerHTML = matchingArticles.map(articleCard).join('');
  resultCount.textContent = `${matchingArticles.length} ${matchingArticles.length === 1 ? 'noticia encontrada' : 'noticias encontradas'}`;
  emptyState.classList.toggle('hidden', matchingArticles.length > 0);

  categorySections.innerHTML = categories
    .filter((category) => !selectedCategory || category.name === selectedCategory)
    .map((category) => {
      const categoryArticles = matchingArticles.filter((article) => article.category === category.name);
      if (!categoryArticles.length) return '';

      const style = categoryStyles[category.color];
      return `
        <section id="${category.id}" class="scroll-mt-36 border-t border-gray-200 pt-8 dark:border-[#30363d]" aria-labelledby="${category.id}Heading">
          <div class="mb-6 flex items-center gap-2">
            <span class="inline-block h-6 w-2 rounded-full ${style.marker}" aria-hidden="true"></span>
            <h2 id="${category.id}Heading" class="text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">${escapeHtml(category.heading)}</h2>
          </div>
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">${categoryArticles.map(articleCard).join('')}</div>
        </section>`;
    })
    .join('');
}

function renderMarketTicker() {
  const prices = [
    ['BTC', 81913],
    ['ETH', 2678],
    ['SOL', 185.5],
    ['OIL', 78.5],
    ['XAU', 2318.5]
  ];
  const priceItems = prices.map(([symbol, price]) => `
    <span class="px-6 text-sm font-medium text-gray-600 dark:text-[#8b949e]">${symbol} $${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
  `).join('');

  document.getElementById('marqueeContent').innerHTML = `
    <div class="marquee-group" role="presentation">${priceItems}</div>
    <div class="marquee-group" role="presentation" aria-hidden="true">${priceItems}</div>`;
}

function syncThemeButton() {
  const isDark = document.documentElement.classList.contains('dark');
  document.getElementById('moonIcon').classList.toggle('hidden', !isDark);
  document.getElementById('sunIcon').classList.toggle('hidden', isDark);
  document.getElementById('themeToggle').setAttribute('aria-label', `Activar modo ${isDark ? 'claro' : 'oscuro'}`);
}

document.getElementById('themeToggle').addEventListener('click', () => {
  const isDark = document.documentElement.classList.toggle('dark');
  syncThemeButton();
  try {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  } catch (error) {
    console.warn('No se pudo guardar la preferencia de tema.', error);
  }
});

document.getElementById('newsFilters').addEventListener('submit', (event) => {
  event.preventDefault();
});
searchInput.addEventListener('input', renderNews);
categoryFilter.addEventListener('change', renderNews);

function openArticle(article, trigger) {
  previouslyFocusedElement = trigger;
  previousBodyOverflow = document.body.style.overflow;

  const category = categories.find((item) => item.name === article.category);
  const style = categoryStyles[category.color];
  const categoryBadge = document.getElementById('modalCategory');
  categoryBadge.className = `rounded-md border px-2.5 py-1 text-xs font-semibold uppercase ${style.badge}`;
  categoryBadge.textContent = article.category;
  document.getElementById('modalTitle').textContent = article.title;
  document.getElementById('modalReadTime').textContent = article.readTime;
  document.getElementById('modalDate').textContent = article.date;

  const modalImage = document.getElementById('modalImage');
  modalImage.src = article.image;
  modalImage.alt = article.imageAlt;

  const body = document.getElementById('modalBody');
  body.replaceChildren(...article.body.map((paragraph) => {
    const element = document.createElement('p');
    element.textContent = paragraph;
    return element;
  }));

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  closeModalButton.focus();
}

function hideModal() {
  if (modal.classList.contains('hidden')) return;

  modal.classList.add('hidden');
  modal.classList.remove('flex');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = previousBodyOverflow;
  if (previouslyFocusedElement?.isConnected) previouslyFocusedElement.focus();
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-article-id]');
  if (!trigger) return;

  const article = articles.find((item) => item.id === trigger.dataset.articleId);
  if (article) openArticle(article, trigger);
});

closeModalButton.addEventListener('click', hideModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) hideModal();
});
document.addEventListener('keydown', (event) => {
  if (modal.classList.contains('hidden')) return;

  if (event.key === 'Escape') {
    hideModal();
    return;
  }

  if (event.key === 'Tab') {
    const focusableElements = modalDialog.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
});

syncThemeButton();
renderMarketTicker();
renderNews();
