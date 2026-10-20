const setupNotice = document.getElementById('setupNotice');
const loginPanel = document.getElementById('loginPanel');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginButton = document.getElementById('loginButton');
const articleForm = document.getElementById('articleForm');
const publishButton = document.getElementById('publishButton');
const adminStatus = document.getElementById('adminStatus');
const articleList = document.getElementById('adminArticleList');
const config = window.ZEVRYNT_SUPABASE_CONFIG;
let supabaseClient = null;
let currentSession = null;

function showSetupNotice(message) {
  setupNotice.textContent = message;
  setupNotice.classList.remove('hidden');
}

function showStatus(message, kind = 'success') {
  adminStatus.textContent = message;
  adminStatus.className = `mb-6 rounded-lg border p-4 text-sm ${kind === 'error'
    ? 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300'
    : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}`;
}

function showLogin() {
  currentSession = null;
  dashboard.classList.add('hidden');
  loginPanel.classList.remove('hidden');
}

function setBusy(button, isBusy, busyText, idleText) {
  button.disabled = isBusy;
  button.textContent = isBusy ? busyText : idleText;
}

function readError(error, context) {
  console.error(context, error);
  showStatus(`${context} ${error.message || 'Inténtalo de nuevo.'}`, 'error');
}

async function verifyAdministrator(session) {
  const { data, error } = await supabaseClient
    .from('news_admins')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    await supabaseClient.auth.signOut();
    showLogin();
    showStatus('Esta cuenta no tiene permisos para administrar el sitio. Pide al propietario que la autorice.', 'error');
    return false;
  }

  currentSession = session;
  document.getElementById('signedInAs').textContent = session.user.email;
  loginPanel.classList.add('hidden');
  dashboard.classList.remove('hidden');
  await loadAdminArticles();
  return true;
}

async function loadAdminArticles() {
  const { data, error } = await supabaseClient
    .from('news_articles')
    .select('id, title, category, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    readError(error, 'No se pudieron cargar las noticias.');
    return;
  }

  articleList.replaceChildren();
  if (!data.length) {
    const empty = document.createElement('p');
    empty.className = 'rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500 dark:border-[#30363d] dark:text-[#8b949e]';
    empty.textContent = 'Todavía no hay noticias publicadas.';
    articleList.append(empty);
    return;
  }

  for (const article of data) {
    const row = document.createElement('article');
    row.className = 'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-[#30363d] dark:bg-[#161b22]';
    const details = document.createElement('div');
    details.className = 'min-w-0';
    const title = document.createElement('h3');
    title.className = 'font-semibold text-gray-900 dark:text-white';
    title.textContent = article.title;
    const category = document.createElement('p');
    category.className = 'mt-1 text-xs text-gray-500 dark:text-[#8b949e]';
    category.textContent = `${article.category} · ${new Date(article.created_at).toLocaleDateString('es')}`;
    details.append(title, category);

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-600 transition hover:bg-red-500/10 dark:text-red-400';
    removeButton.textContent = 'Eliminar';
    removeButton.addEventListener('click', () => deleteArticle(article.id, article.title, removeButton));
    row.append(details, removeButton);
    articleList.append(row);
  }
}

async function deleteArticle(articleId, title, button) {
  if (!window.confirm(`¿Seguro que quieres eliminar “${title}”?`)) return;

  button.disabled = true;
  const { data: article, error: readErrorResult } = await supabaseClient
    .from('news_articles')
    .select('image_path')
    .eq('id', articleId)
    .single();

  if (readErrorResult) {
    button.disabled = false;
    readError(readErrorResult, 'No se pudo preparar la eliminación de la noticia.');
    return;
  }

  const { error } = await supabaseClient.from('news_articles').delete().eq('id', articleId);
  if (error) {
    button.disabled = false;
    readError(error, 'No se pudo eliminar la noticia.');
    return;
  }

  if (article.image_path) {
    const { error: storageError } = await supabaseClient.storage.from('news-images').remove([article.image_path]);
    if (storageError) {
      console.error('La noticia fue eliminada, pero no se pudo borrar su imagen.', storageError);
      showStatus('La noticia se eliminó, pero su imagen quedó en el almacenamiento y requiere limpieza manual.', 'error');
    } else {
      showStatus('La noticia y su imagen se eliminaron.');
    }
  } else {
    showStatus('La noticia se eliminó.');
  }

  await loadAdminArticles();
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!supabaseClient) return;

  setBusy(loginButton, true, 'Iniciando sesión...', 'Iniciar sesión');
  const formData = new FormData(loginForm);
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: formData.get('email'),
    password: formData.get('password')
  });
  setBusy(loginButton, false, '', 'Iniciar sesión');

  if (error) {
    readError(error, 'No se pudo iniciar sesión.');
    return;
  }

  try {
    if (await verifyAdministrator(data.session)) showStatus('Sesión iniciada correctamente.');
  } catch (verificationError) {
    readError(verificationError, 'No se pudo verificar el permiso de administrador.');
  }
});

articleForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!supabaseClient || !currentSession) return;

  const formData = new FormData(articleForm);
  const image = formData.get('image');
  const paragraphs = String(formData.get('body'))
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const mimeExtensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };

  if (!(image instanceof File) || !mimeExtensions[image.type] || image.size > 5 * 1024 * 1024) {
    showStatus('Elige una imagen PNG, JPG o WebP de máximo 5 MB.', 'error');
    return;
  }

  if (!paragraphs.length) {
    showStatus('Escribe al menos un párrafo en el contenido completo.', 'error');
    return;
  }

  setBusy(publishButton, true, 'Publicando...', 'Publicar noticia');
  const imagePath = `${crypto.randomUUID()}.${mimeExtensions[image.type]}`;
  const { error: uploadError } = await supabaseClient.storage
    .from('news-images')
    .upload(imagePath, image, { contentType: image.type, upsert: false });

  if (uploadError) {
    setBusy(publishButton, false, '', 'Publicar noticia');
    readError(uploadError, 'No se pudo subir la imagen.');
    return;
  }

  const { data: imageData } = supabaseClient.storage.from('news-images').getPublicUrl(imagePath);
  const article = {
    title: String(formData.get('title')).trim(),
    category: formData.get('category'),
    description: String(formData.get('description')).trim(),
    body: paragraphs,
    image_url: imageData.publicUrl,
    image_path: imagePath,
    image_alt: String(formData.get('imageAlt')).trim(),
    read_time: `${formData.get('readTime')} min de lectura`,
    date_label: 'Reciente',
    is_published: true
  };

  const { error: insertError } = await supabaseClient.from('news_articles').insert(article);
  if (insertError) {
    const { error: cleanupError } = await supabaseClient.storage.from('news-images').remove([imagePath]);
    setBusy(publishButton, false, '', 'Publicar noticia');
    readError(insertError, cleanupError
      ? 'No se pudo publicar la noticia y tampoco se pudo limpiar la imagen subida.'
      : 'No se pudo publicar la noticia; la imagen temporal se limpió.');
    if (cleanupError) console.error('No se pudo limpiar una imagen sin noticia asociada.', cleanupError);
    return;
  }

  articleForm.reset();
  setBusy(publishButton, false, '', 'Publicar noticia');
  showStatus('Noticia publicada. Ya aparece en la página principal.');
  await loadAdminArticles();
});

document.getElementById('logoutButton').addEventListener('click', async () => {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    readError(error, 'No se pudo cerrar la sesión.');
    return;
  }

  showLogin();
  adminStatus.classList.add('hidden');
});

async function initializeAdmin() {
  if (!config?.url || !config?.anonKey) {
    loginButton.disabled = true;
    showSetupNotice('Falta configurar Supabase. Sigue los pasos de SUPABASE_SETUP.md y vuelve a desplegar el sitio. El inicio de sesión está desactivado hasta completar esa configuración.');
    return;
  }

  if (!window.supabase?.createClient) {
    loginButton.disabled = true;
    showSetupNotice('No se pudo cargar la biblioteca de autenticación. Comprueba tu conexión a internet e inténtalo de nuevo.');
    console.error('No se pudo cargar @supabase/supabase-js.');
    return;
  }

  supabaseClient = window.supabase.createClient(config.url, config.anonKey);
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    showSetupNotice(`No se pudo comprobar la sesión: ${error.message}`);
    console.error('Error al comprobar la sesión de Supabase.', error);
    return;
  }

  if (data.session) {
    try {
      await verifyAdministrator(data.session);
    } catch (verificationError) {
      showStatus(`No se pudo verificar el permiso de administrador: ${verificationError.message}`, 'error');
      console.error('Error al verificar la sesión guardada.', verificationError);
    }
  }
}

initializeAdmin().catch((error) => {
  showSetupNotice(`No se pudo inicializar el panel: ${error.message}`);
  console.error('Error al inicializar el panel de administración.', error);
});
