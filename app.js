const main = document.querySelector('main');
const key = 'rota-cnh-v1';
const accountKey = userId => `${key}:user:${userId}`;
const lessons = Object.fromEntries(topics.map(topic => [topic[0], topic]));
const sources = [
  ['Resolução Contran 1.020/2025 · formato da prova','https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao10202025.pdf'],
  ['Portaria Senatran 923/2025 · conteúdo programático','https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2025/Portaria9232025.pdf'],
  ['Código de Trânsito Brasileiro · texto compilado','https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm'],
  ['Ministério dos Transportes · CNH do Brasil','https://www.gov.br/transportes/pt-br/conteudos-cnh-do-brasil'],
  ['Detran-SP · serviços de habilitação','https://www.detran.sp.gov.br/']
];

function emptyProgress() { return { read: [], history: [], active: null }; }

function load(storageKey = key) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.read) && Array.isArray(saved.history)) return saved;
  } catch { /* A sessão atual funciona sem armazenamento. */ }
  return emptyProgress();
}

let data = load();
let storageAvailable = true;
let supabaseClient = null;
let currentSession = null;
let activeUserId = null;
let loadingAccountId = null;
let currentStorageKey = key;
let cloudReady = false;
let syncTimer = null;
let syncStatus = 'Salvo neste navegador';
let accountNotice = '';
let authMode = 'signin';

function mergeProgress(primary, secondary) {
  const first = primary && Array.isArray(primary.read) && Array.isArray(primary.history) ? primary : emptyProgress();
  const second = secondary && Array.isArray(secondary.read) && Array.isArray(secondary.history) ? secondary : emptyProgress();
  const history = new Map();
  [...first.history, ...second.history].forEach(item => { if (item?.id) history.set(item.id, item); });
  const firstActive = first.active;
  const secondActive = second.active;
  let active = firstActive || secondActive || null;
  if (firstActive && secondActive) {
    const firstTime = Number(firstActive.updatedAt || 0);
    const secondTime = Number(secondActive.updatedAt || 0);
    active = secondTime >= firstTime ? secondActive : firstActive;
  }
  return {
    read: [...new Set([...first.read, ...second.read])],
    history: [...history.values()].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))),
    active
  };
}

function setAccountLink() {
  const link = document.querySelector('.account-link');
  if (link) link.textContent = currentSession ? 'Minha conta' : 'Entrar';
}

async function writeCloudProgress() {
  if (!supabaseClient || !currentSession || !cloudReady) return null;
  const { error } = await supabaseClient.from('study_progress').upsert({
    user_id: currentSession.user.id,
    state: data,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' });
  return error || null;
}

async function applySession(session) {
  currentSession = session;
  setAccountLink();
  if (!session) {
    if (activeUserId) {
      currentStorageKey = key;
      data = load(key);
    }
    activeUserId = null;
    loadingAccountId = null;
    cloudReady = false;
    syncStatus = 'Salvo neste navegador';
    if (route() === 'conta') render();
    return;
  }

  const userId = session.user.id;
  if (activeUserId === userId && (cloudReady || loadingAccountId === userId)) return;
  activeUserId = userId;
  loadingAccountId = userId;
  currentStorageKey = accountKey(userId);
  cloudReady = false;
  syncStatus = 'Sincronizando…';
  const localAccount = load(currentStorageKey);
  const guestData = load(key);
  const { data: row, error } = await supabaseClient.from('study_progress')
    .select('state').eq('user_id', userId).maybeSingle();

  if (!currentSession || currentSession.user.id !== userId) return;

  if (error) {
    data = mergeProgress(localAccount, guestData);
    loadingAccountId = null;
    syncStatus = 'Offline: salvo neste aparelho';
    accountNotice = 'Não consegui sincronizar agora. Seu progresso continua salvo neste navegador; confira a conexão e tente novamente.';
    render();
    return;
  }

  data = mergeProgress(row?.state || emptyProgress(), mergeProgress(localAccount, guestData));
  try { localStorage.setItem(currentStorageKey, JSON.stringify(data)); } catch { storageAvailable = false; }
  cloudReady = true;
  const writeError = await writeCloudProgress();
  loadingAccountId = null;
  if (writeError) {
    syncStatus = 'Offline: salvo neste aparelho';
    accountNotice = 'Sua conta entrou, mas a sincronização falhou. Seu progresso está salvo localmente e será sincronizado quando a conexão voltar.';
  } else {
    try { localStorage.removeItem(key); } catch { /* A cópia local pode permanecer como recuperação. */ }
    syncStatus = 'Sincronizado na nuvem';
    accountNotice = 'Progresso sincronizado com sua conta.';
  }
  render();
}

function initializeAuth() {
  const config = window.ROTA_SUPABASE_CONFIG || {};
  const clientFactory = window.supabase?.createClient;
  if (clientFactory && /^https:\/\//.test(config.url || '') && config.publishableKey) {
    try { supabaseClient = clientFactory(config.url, config.publishableKey); }
    catch { supabaseClient = null; }
  }
  if (!supabaseClient) return;
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    setTimeout(() => { void applySession(session); }, 0);
  });
  supabaseClient.auth.getSession().then(({ data: sessionData, error }) => {
    if (error) {
      accountNotice = 'Não foi possível verificar sua sessão. Tente atualizar a página.';
      render();
      return;
    }
    void applySession(sessionData.session);
  });
}

function save() {
  if (data.active) data.active.updatedAt = Date.now();
  try { localStorage.setItem(currentStorageKey, JSON.stringify(data)); }
  catch { storageAvailable = false; }
  if (supabaseClient && currentSession && cloudReady) {
    syncStatus = 'Sincronizando…';
    clearTimeout(syncTimer);
    syncTimer = setTimeout(async () => {
      const error = await writeCloudProgress();
      syncStatus = error ? 'Offline: salvo neste aparelho' : 'Sincronizado na nuvem';
      if (error) accountNotice = 'Não consegui sincronizar agora. Seu progresso continua salvo neste navegador.';
      setAccountLink();
      if (route() === 'conta') render();
    }, 500);
  }
}

const route = () => location.hash.slice(1) || 'inicio';
const percent = (n, total) => total ? Math.round(n / total * 100) : 0;
const button = (label, action, secondary = false) =>
  `<button class="button ${secondary ? 'secondary' : ''}" data-action="${action}">${label}</button>`;
const link = (label, href, secondary = false) =>
  `<a class="button ${secondary ? 'secondary' : ''}" href="#${href}">${label}</a>`;

function shuffled(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function scores(topic) {
  const attempts = data.history.flatMap(item => item.responses).filter(item => !topic || item.topic === topic);
  const right = attempts.filter(item => item.selected === 0).length;
  return { total: attempts.length, right, rate: percent(right, attempts.length) };
}

function weakTopics() {
  return topics.map(([id]) => ({ id, ...scores(id) }))
    .filter(item => item.total >= 2 && item.rate < 70)
    .sort((a, b) => a.rate - b.rate || b.total - a.total);
}

function stats() {
  const overall = scores();
  return `<div class="grid stats">
    <div class="card stat"><strong>${data.read.length}/${topics.length}</strong><span>Temas estudados</span></div>
    <div class="card stat"><strong>${data.history.length}</strong><span>Simulados feitos</span></div>
    <div class="card stat"><strong>${overall.total ? overall.rate + '%' : '—'}</strong><span>Taxa de acerto</span></div>
  </div>`;
}

function heading(label, title, description) {
  return `<div class="eyebrow">${label}</div><h1>${title}</h1><p class="muted">${description}</p>`;
}

function home() {
  return `<section class="hero">
    <div class="hero-copy"><div class="eyebrow">Primeira habilitação · São Paulo</div>
      <h1>Sua rota para a <em>primeira CNH.</em></h1>
      <p>Estude a teoria no seu ritmo, pratique com questões comentadas e revise os assuntos em que tiver mais dificuldade.</p>
      <div class="actions">${link('Começar pela teoria →','teoria')}${link('Ver simulados','simulados',true)}</div>
    </div>
    <div class="art" aria-hidden="true">
      <svg viewBox="0 0 420 330">
        <rect x="58" y="24" width="306" height="280" rx="34" fill="#1c342a" stroke="#3a5547"/>
        <path d="M58 94h306M58 164h306M58 234h306M135 24v280M210 24v280M285 24v280" stroke="#375447" stroke-dasharray="3 5"/>
        <path d="M93 257h45q43 0 43-43v-16q0-35 35-35h26q40 0 40-40V68" fill="none" stroke="#476956" stroke-width="26" stroke-linecap="round"/>
        <path d="M93 257h45q43 0 43-43v-16q0-35 35-35h26q40 0 40-40V68" fill="none" stroke="#cffa67" stroke-width="4" stroke-linecap="round" stroke-dasharray="5 9"/>
        <circle cx="93" cy="257" r="10" fill="#cffa67"/><circle cx="282" cy="68" r="24" fill="#cffa67"/><path d="m271 68 8 8 14-15" fill="none" stroke="#152822" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="art-label">30 questões · Meta de 20</span>
    </div>
  </section>
  <div class="section-head"><h2>Seu progresso</h2><a href="#progresso">Ver histórico →</a></div>
  ${stats()}
  <div class="section-head"><h2>Escolha o próximo passo</h2></div>
  <div class="grid">
    <a class="card card-link" href="#teoria"><span class="tile" aria-hidden="true">≡</span><h3>Teoria por assunto</h3><p>Leia os resumos e marque os temas concluídos.</p></a>
    <a class="card card-link" href="#simulados"><span class="tile" aria-hidden="true">✓</span><h3>Simulado geral</h3><p>Pratique com tempo e confira o gabarito comentado.</p></a>
    <a class="card card-link" href="#simulados"><span class="tile" aria-hidden="true">◎</span><h3>Treino direcionado</h3><p>Pratique um assunto ou revise os erros do seu histórico.</p></a>
  </div>`;
}

function theory(topic) {
  if (topic) {
    const [id, title, , sections] = lessons[topic];
    return `<section class="page">${heading('Teoria', title, 'Revise os conceitos e pratique com questões do assunto.')}
      ${sections.map(([name, copy]) => `<details class="panel lesson" open><summary>${name}</summary><p>${copy}</p></details>`).join('')}
      <div class="actions section-head">${button(data.read.includes(id) ? 'Marcar como pendente' : 'Marcar como estudado', 'read:' + id,true)}
      ${button('Praticar este tema →','start:' + id)}</div>
      <a href="#teoria">← Todos os temas</a>
    </section>`;
  }
  return `<section class="subpage">${heading('Material de estudo','Teoria por assunto','Seis módulos resumem os principais conteúdos da primeira habilitação.')}
    <div class="grid">${topics.map(([id, title, icon, sections]) => `
      <a class="card card-link" href="#teoria/${id}"><span class="tile" aria-hidden="true">${icon}</span><h3>${title}</h3>
      <p>${sections.length} resumos · ${data.read.includes(id) ? 'Estudado' : 'Pendente'}</p></a>`).join('')}</div>
  </section>`;
}

function practice() {
  const weak = weakTopics();
  return `<section class="subpage">${heading('Prática','Simulados de trânsito','Pratique no formato da prova ou escolha um tema para revisar.')}
    ${data.active ? `<div class="panel"><h2>Simulado em andamento</h2><p>Retome de onde parou.</p><p>${link('Continuar simulado','questoes')}</p></div>` : ''}
    <div class="grid">
      <article class="card"><span class="tile" aria-hidden="true">✓</span><h3>Simulado geral</h3><p>30 questões · Meta de 20 acertos</p>
        <fieldset><legend>Tempo de treino</legend><label><input type="radio" name="duration" value="60" checked> 60 min</label>
        <label><input type="radio" name="duration" value="120"> 120 min</label></fieldset>${button('Iniciar simulado','start:geral')}</article>
      <article class="card"><span class="tile" aria-hidden="true">◎</span><h3>Reforço personalizado</h3>
        <p>${weak.length ? 'Prioridade: ' + weak.map(item => lessons[item.id][1]).join(', ') : 'A sugestão aparece após pelo menos duas respostas num tema com aproveitamento abaixo de 70%.'}</p>
        ${weak.length ? button('Treinar pontos fracos','start:reforco') : ''}</article>
    </div>
    <div class="section-head"><h2>Treinar por assunto</h2></div>
    <div class="grid">${topics.map(([id, title, icon]) => `<article class="card"><span class="tile" aria-hidden="true">${icon}</span><h3>${title}</h3><p>${bank[id].length} questões · sem cronômetro</p>${button('Praticar','start:' + id,true)}</article>`).join('')}</div>
  </section>`;
}

function modeLabel(mode) {
  if (mode === 'geral') return 'Simulado geral';
  if (mode === 'reforco') return 'Reforço personalizado';
  return lessons[mode][1];
}

function questionSet(mode) {
  const choices = topics.map(([topic]) => shuffled(bank[topic].map((_, index) => ({topic, index}))));
  if (mode === 'geral') return shuffled(choices.flatMap(items => items.slice(0, 5)));
  if (mode !== 'reforco') return choices.flat().filter(item => item.topic === mode);
  const weak = weakTopics().slice(0, 2);
  const priorErrors = new Set(data.history.flatMap(item => item.responses)
    .filter(item => item.selected !== 0).map(item => item.topic + ':' + item.index));
  return shuffled(weak.flatMap(({id}) => choices.flat().filter(item => item.topic === id)
    .sort((a, b) => Number(priorErrors.has(b.topic + ':' + b.index)) - Number(priorErrors.has(a.topic + ':' + a.index)))
    .slice(0, 5)));
}

function start(mode) {
  const questions = questionSet(mode);
  if (!questions.length) return;
  if (data.active && !confirm('Iniciar outro simulado substituirá a tentativa em andamento. Continuar?')) return;
  const minutes = Number(document.querySelector('[name=duration]:checked')?.value ?? 60);
  data.active = {
    mode, current: 0,
    deadline: mode === 'geral' ? Date.now() + minutes * 60000 : null,
    questions: questions.map(item => ({...item, order: shuffled([0, 1, 2, 3]), selected: null}))
  };
  save();
  if (route() === 'questoes') render(true);
  else location.hash = 'questoes';
}

function quiz() {
  const active = data.active;
  if (!active) return `<div class="panel"><h1>Escolha um simulado</h1><p>${link('Ver opções','simulados')}</p></div>`;
  const { current, questions } = active;
  const { topic, index, order, selected } = questions[current];
  const item = bank[topic][index];
  const answered = questions.filter(question => question.selected !== null).length;
  return `<section class="page quiz">
    ${heading('Questões', modeLabel(active.mode), answered + ' de ' + questions.length + ' respondidas')}
    <div class="panel">
      <div class="quiz-head"><strong>Questão ${current + 1} / ${questions.length}</strong>${active.deadline ? '<strong id="timer" aria-label="Tempo restante"></strong>' : ''}</div>
      <progress value="${answered}" max="${questions.length}" aria-label="Questões respondidas"></progress>
      <fieldset><legend>${item[0]}</legend>
      ${order.map((option, i) => `<label class="answer"><input type="radio" name="answer" value="${option}" ${selected === option ? 'checked' : ''}><span>${'ABCD'[i]}. ${item[option + 1]}</span></label>`).join('')}</fieldset>
      <div class="actions">
        ${current ? button('← Anterior','go:' + (current - 1),true) : ''}
        ${current < questions.length - 1 ? button('Próxima →','go:' + (current + 1)) : ''}
        ${button('Finalizar','finish',current < questions.length - 1)}
      </div>
      <div class="numbers" aria-label="Navegar entre questões">${questions.map((q, i) => `<button data-action="go:${i}" aria-label="Questão ${i + 1}, ${q.selected === null ? 'pendente' : 'respondida'}" ${current === i ? 'aria-current="step"' : ''} class="${q.selected === null ? '' : 'done'}">${i + 1}</button>`).join('')}</div>
      <p><a href="#simulados">Salvar e sair</a></p>
    </div></section>`;
}

function finish(expired = false) {
  const active = data.active;
  if (!active) return;
  const missing = active.questions.filter(item => item.selected === null).length;
  if (!expired && missing && !confirm(`Você ainda tem ${missing} questão(ões) sem resposta. Finalizar?`)) return;
  const id = Date.now().toString(36);
  data.history.unshift({id, date: new Date().toISOString(), mode: active.mode, expired, responses: active.questions});
  data.active = null;
  save();
  location.hash = 'resultado/' + id;
}

function result(id) {
  const record = data.history.find(item => item.id === id);
  if (!record) return progressPage();
  const right = record.responses.filter(item => item.selected === 0).length;
  const total = record.responses.length;
  const weak = weakTopics();
  return `<section class="page">${heading('Resultado', right + ' de ' + total + ' acertos',
      (record.expired ? 'Tempo encerrado. ' : '') + (record.mode === 'geral' ? (right >= 20 ? 'Meta de 20 acertos atingida.' : 'Meta de 20 acertos ainda não atingida.') : 'Treino concluído.'))}
    <div class="actions section-head">${weak.length ? button('Treinar pontos fracos','start:reforco') : ''}${link('Ver progresso','progresso',true)}${link('Mais simulados','simulados',true)}</div>
    <h2>Gabarito comentado</h2>
    ${record.responses.map(({topic, index, selected}, i) => {
      const [question, correct, ...rest] = bank[topic][index];
      return `<details class="panel review ${selected === 0 ? 'correct' : ''}" ${selected !== 0 ? 'open' : ''}>
        <summary>${i + 1}. ${selected === 0 ? 'Acerto' : selected === null ? 'Sem resposta' : 'Erro'} · ${question}</summary>
        ${selected > 0 ? `<p><strong>Sua resposta</strong> · ${rest[selected - 1]}</p>` : ''}
        <p><strong>Resposta correta</strong> · ${correct}</p><p>${rest[3]}</p>
        <p><a href="#teoria/${topic}">Revisar ${lessons[topic][1]} →</a></p></details>`;
    }).join('')}
  </section>`;
}

function progressPage() {
  const weak = weakTopics();
  const description = currentSession ? 'Consulte seus resultados. Seu progresso é sincronizado com sua conta.' : 'Consulte seus resultados. Por enquanto, seus dados ficam neste navegador; entre para sincronizar entre dispositivos.';
  return `<section class="subpage">${heading('Acompanhamento','Meu progresso',description)}
    <div class="section-head"><h2>Visão geral</h2></div>${stats()}
    <div class="panel"><h2>Desempenho por tema</h2>
    ${topics.map(([id, title]) => { const {rate, total, right} = scores(id);
      return `<div class="topic-stat"><a href="#teoria/${id}">${title}</a><progress value="${rate}" max="100" aria-label="Acertos em ${title}"></progress><span>${total ? right + '/' + total : '—'}</span></div>`;
    }).join('')}
    ${weak.length ? `<p>Revisar primeiro · ${weak.map(item => lessons[item.id][1]).join(', ')}</p><p>${button('Iniciar reforço','start:reforco')}</p>` : ''}
    </div>
    <div class="panel"><h2>Histórico de simulados</h2>${data.history.length ? data.history.map(item =>
      `<div class="row"><div><strong>${modeLabel(item.mode)}</strong><br><small>${new Date(item.date).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}</small></div>
      <span>${item.responses.filter(q => q.selected === 0).length}/${item.responses.length}</span>
      <a href="#resultado/${item.id}">Ver correção</a></div>`).join('') : '<p>Após concluir seu primeiro simulado, o resultado aparece aqui.</p>'}</div>
  </section>`;
}

function accountPage() {
  if (currentSession) {
    const email = String(currentSession.user.email || 'Conta conectada').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    const badgeClass = syncStatus.startsWith('Offline') ? 'error' : syncStatus.startsWith('Sincronizando') ? 'pending' : '';
    return `<section class="page">${heading('Conta','Seu progresso acompanha você','Entre com esta conta em outro aparelho para continuar seus estudos.')}
      <div class="panel account-card"><span class="sync-badge ${badgeClass}">${syncStatus}</span><h2 style="margin-top:18px">Conta conectada</h2><p><strong>${email}</strong></p>
      <p class="auth-status" role="status" aria-live="polite">${accountNotice}</p>
      <div class="auth-actions">${button('Sair da conta','signout',true)}${link('Ver meu progresso','progresso')}</div></div>
    </section>`;
  }
  if (!supabaseClient) {
    return `<section class="page">${heading('Conta','Salvar seu progresso','A conta vai permitir continuar seus simulados em outro celular ou computador.')}
      <div class="panel account-card"><span class="sync-badge">Modo visitante</span><h2 style="margin-top:18px">Login em configuração</h2>
      <p>O site ainda salva seu progresso neste navegador. A sincronização por conta será ativada depois de conectar o banco online.</p>
      <p class="hint">Enquanto isso, evite limpar os dados do navegador para manter seus simulados e temas estudados.</p>
      <p class="auth-status" role="status" aria-live="polite">${accountNotice}</p></div></section>`;
  }
  const signup = authMode === 'signup';
  return `<section class="page">${heading('Conta',signup ? 'Criar conta' : 'Entrar','Seu progresso fica salvo na nuvem e acompanha você entre dispositivos.')}
    <div class="panel account-card"><form id="auth-form" class="auth-form">
      <label for="account-email">E-mail<input id="account-email" name="email" type="email" autocomplete="email" required></label>
      <label for="account-password">Senha<input id="account-password" name="password" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" minlength="8" required></label>
      ${signup ? '<p class="hint">Use pelo menos 8 caracteres. Talvez seja necessário confirmar o e-mail antes do primeiro acesso.</p>' : ''}
      <button class="button" type="submit" ${authBusy ? 'disabled' : ''}>${authBusy ? 'Aguarde…' : signup ? 'Criar conta' : 'Entrar e sincronizar'}</button>
    </form><p class="auth-status" role="status" aria-live="polite">${accountNotice}</p>
    <div class="auth-actions">${signup ? button('Já tenho conta','auth:signin',true) : button('Criar uma conta','auth:signup',true)}
    ${signup ? '' : '<button class="button secondary" type="button" data-action="auth:reset">Esqueci minha senha</button>'}</div>
    <p class="hint">O progresso que já está neste navegador será combinado com o da conta no primeiro acesso.</p></div></section>`;
}

function render(focus = false) {
  const [page, detail] = route().split('/');
  const navPage = ['questoes','resultado'].includes(page) ? 'simulados' : page;
  document.querySelectorAll('nav a').forEach(item => {
    if (item.hash === '#' + navPage) item.setAttribute('aria-current','page');
    else item.removeAttribute('aria-current');
  });
  const pages = {
    inicio: home, teoria: () => theory(Object.hasOwn(lessons, detail) ? detail : null),
    simulados: practice, questoes: quiz, resultado: () => result(detail), progresso: progressPage, conta: accountPage,
    fontes: () => `<section class="page">${heading('Referências','Fontes oficiais','Material independente, com resumos e questões autorais. Revisão de referência em 21/11/2026.')}
      <div class="panel"><ul>${sources.map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join('')}</ul></div></section>`
  };
  main.innerHTML = (Object.hasOwn(pages, page) ? pages[page] : home)() +
    (storageAvailable ? '' : '<p role="status">O navegador bloqueou o armazenamento. O progresso ficará disponível só nesta sessão.</p>');
  setAccountLink();
  updateTimer();
  if (focus) main.focus();
}

function updateTimer() {
  if (!data.active?.deadline) return;
  const seconds = Math.max(0, Math.ceil((data.active.deadline - Date.now()) / 1000));
  if (!seconds) { finish(true); return; }
  const timer = document.querySelector('#timer');
  if (timer) timer.textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2,'0');
}

main.addEventListener('click', event => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const [action, value] = target.dataset.action.split(':');
  if (action === 'start') start(value);
  if (action === 'finish') finish();
  if (action === 'auth' && value !== 'reset') { authMode = value; accountNotice = ''; render(); }
  if (action === 'signout' && supabaseClient) {
    accountNotice = 'Saindo da conta…';
    supabaseClient.auth.signOut().then(({ error }) => {
      if (error) { accountNotice = 'Não foi possível sair agora. Tente novamente.'; render(); }
    });
  }
  if (action === 'auth' && value === 'reset') {
    const email = main.querySelector('#account-email')?.value.trim();
    if (!email) { accountNotice = 'Digite seu e-mail para receber o link de redefinição.'; render(); return; }
    supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname + '#conta' })
      .then(({ error }) => { accountNotice = error ? 'Não consegui enviar o link. Confira o e-mail e tente novamente.' : 'Se este e-mail estiver cadastrado, enviaremos um link para redefinir sua senha.'; render(); });
  }
  if (action === 'go' && data.active) {
    data.active.current = Number(value);
    save();
    render(true);
  }
  if (action === 'read') {
    data.read = data.read.includes(value) ? data.read.filter(id => id !== value) : [...data.read, value];
    save();
    render();
    main.querySelector('[data-action="read:' + value + '"]')?.focus();
  }
});

let authBusy = false;
main.addEventListener('submit', async event => {
  if (event.target.id !== 'auth-form' || !supabaseClient) return;
  event.preventDefault();
  const form = event.target;
  const email = form.elements.email.value.trim();
  const password = form.elements.password.value;
  authBusy = true;
  accountNotice = '';
  render();
  const result = authMode === 'signup'
    ? await supabaseClient.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname + '#conta' } })
    : await supabaseClient.auth.signInWithPassword({ email, password });
  authBusy = false;
  if (result.error) {
    accountNotice = authMode === 'signup'
      ? 'Não consegui criar sua conta. Confira o e-mail, a senha e tente novamente.'
      : 'E-mail ou senha não conferem. Confira os dados e tente novamente.';
    render();
    return;
  }
  if (authMode === 'signup' && !result.data.session) {
    accountNotice = 'Conta criada. Confira seu e-mail e confirme o cadastro para entrar.';
    render();
    return;
  }
  if (result.data.session) void applySession(result.data.session);
});

main.addEventListener('change', event => {
  if (event.target.name !== 'answer' || !data.active) return;
  data.active.questions[data.active.current].selected = Number(event.target.value);
  save();
  render();
  main.querySelector('input[name="answer"]:checked')?.focus();
});

window.addEventListener('hashchange', () => {
  if (route() === 'main') return;
  window.scrollTo(0, 0);
  render(true);
});
setInterval(updateTimer, 1000);
save();
render();
initializeAuth();
