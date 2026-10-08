const exercises = {
  'Back Squat': { category: 'Squats', discipline: ['Force', 'Lourd'], unit: 'kg', description: 'Le mouvement de référence pour suivre ta force des jambes.' },
  Deadlift: { category: 'Deadlifts', discipline: ['Force', 'Lourd'], unit: 'kg', description: 'La force totale et la capacité à déplacer lourd depuis le sol.' },
  'Bench Press': { category: 'Presses', discipline: ['Force', 'Lourd'], unit: 'kg', description: 'Le mouvement de poussée horizontal pour suivre ta force du haut du corps.' }
};
const categoryColors = {
  Squats: '#ff7068',
  Cleans: '#3182ce',
  Presses: '#e49a27',
  Jerks: '#2fbd87',
  Snatches: '#3182ce',
  Deadlifts: '#ed2399',
  'Olympic Lifts': '#f04444',
  Run: '#ff7068',
  Row: '#3182ce',
  'Ski Erg': '#e49a27',
  'Assault Bike': '#2fbd87',
  Burpees: '#3182ce'
};
const exerciseInfo = {
  'Back Squat': {
    intro: 'Un mouvement de force pour les jambes et le gainage.',
    muscles: [['Quadriceps', '#ff6685'], ['Fessiers', '#ffbd53'], ['Tronc', '#65d8b5']],
    steps: ['Pieds sous la barre, poitrine haute', 'Descends en contrôlant, genoux dans l’axe des pieds', 'Pousse le sol et verrouille debout'],
    photos: ['Photos/back-squat-standing.png', 'Photos/back-squat-bottom.png']
  },
  Deadlift: {
    intro: 'Un mouvement de chaîne postérieure réalisé depuis le sol.',
    muscles: [['Fessiers', '#ffbd53'], ['Ischio-jambiers', '#ff6685'], ['Dos', '#7d91ff']],
    steps: ['Barre au-dessus du milieu du pied', 'Hanches en arrière, dos neutre', 'Pousse le sol puis termine debout'],
    photos: []
  },
  'Bench Press': {
    intro: 'Un mouvement de poussée horizontal pour le haut du corps.',
    muscles: [['Pectoraux', '#ff6685'], ['Triceps', '#7d91ff'], ['Épaules', '#ffbd53']],
    steps: ['Omoplates serrées, pieds ancrés au sol', 'Descends la barre vers le bas des pectoraux', 'Pousse verticalement sans décoller les épaules'],
    photos: []
  }
};
const seed = [
  { name: 'Back Squat', value: 90, unit: 'kg', date: '2025-05-23' },
  { name: 'Deadlift', value: 120, unit: 'kg', date: '2025-02-26' },
  { name: 'Bench Press', value: 62.5, unit: 'kg', date: '2025-01-15' },
  { name: 'Back Squat', value: 78, unit: 'kg', date: '2024-11-08' },
  { name: 'Deadlift', value: 107, unit: 'kg', date: '2025-02-20' },
  { name: 'Bench Press', value: 55, unit: 'kg', date: '2024-09-18' }
];
const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60, 50, 40, 30];
const rmMultipliers = { 1: 1, 2: .95, 3: .93, 5: .87, 8: .8 };
let records = JSON.parse(localStorage.getItem('forge-records') || 'null') || seed;
seed.forEach(record => {
  if (!records.some(existing => existing.name === record.name && existing.value === record.value && existing.date === record.date)) records.push(record);
});
localStorage.setItem('forge-records', JSON.stringify(records));
let profile = JSON.parse(localStorage.getItem('forge-profile') || 'null') || { name: 'Emilie Conte', birthDate: '', weight: '', height: '', bodyFat: '' };
let currentView = 'prs';
let selectedExercise = null;
let selectedRm = 1;
const content = document.querySelector('#app-content');
const title = document.querySelector('#page-title');
const formatDate = value => new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const exerciseList = () => Object.keys(exercises);
const recordsFor = name => records.filter(record => record.name === name);
const recordRm = record => Number(record.rm) || 1;
const bestForRm = (name, rm) => {
  const matching = recordsFor(name).filter(record => record.unit === 'kg' && recordRm(record) === rm);
  return matching.length ? Math.max(...matching.map(record => record.value)) : 0;
};
const bestFor = name => Math.max(...recordsFor(name).filter(record => record.unit === 'kg').map(record => record.value / (rmMultipliers[recordRm(record)] || 1)), 0);
const categoryHasWeight = names => names.some(name => recordsFor(name).some(record => record.unit === 'kg' && record.value > 0));
const groupByCategory = () => exerciseList().reduce((groups, name) => { const category = exercises[name].category; (groups[category] ||= []).push(name); return groups; }, {});
const colorForCategory = category => categoryColors[category] || '#96999f';
const infoFor = name => exerciseInfo[name] || { intro: 'Les principaux muscles sollicités par ce mouvement.', muscles: [['Muscles principaux', colorForCategory(exercises[name].category)]], steps: ['Position de départ', 'Réalisation contrôlée', 'Retour en position stable'], photos: [] };
const age = () => profile.birthDate ? Math.floor((Date.now() - new Date(profile.birthDate).getTime()) / 31557600000) : '—';
const bmi = () => profile.weight && profile.height ? (Number(profile.weight) / ((Number(profile.height) / 100) ** 2)).toFixed(1) : '—';
const fitIcon = name => {
  const icons = {
    Haltéro: '<path d="M50 38h100M65 30v16M135 30v16M100 43v55M100 58L72 78M100 58l28 20M100 98l-22 42M100 98l22 42" />',
    Force: '<path d="M48 44h104M62 34v20M138 34v20M100 48v48M100 60L72 82M100 60l28 22M100 96l-25 43M100 96l25 43M83 139h-18M117 139h18" />',
    Vitesse: '<path d="M100 38a9 9 0 1 0 0 18a9 9 0 0 0 0-18M100 57v42M100 65L72 82M100 65l28 8M100 99l-30 30M100 99l25 20M53 129h35M61 143h70" />',
    Endurance: '<circle cx="100" cy="37" r="9"/><path d="M100 47v56M100 61L76 77M100 61l24 16M100 103l-20 37M100 103l20 37M65 143h70" />',
    Long: '<circle cx="100" cy="37" r="9"/><path d="M100 47v58M100 60L76 78M100 60l24 18M100 105l-20 36M100 105l20 36M64 145h72" />',
    Bodyweight: '<circle cx="100" cy="37" r="9"/><path d="M100 47v57M100 60L76 78M100 60l24 18M100 104l-20 36M100 104l20 36M55 31h90M55 31v18M145 31v18" />',
    Lourd: '<path d="M45 47h110M58 36v22M142 36v22M100 51v52M100 64L74 82M100 64l26 18M100 103l-21 37M100 103l21 37M68 140h-18M132 140h18" />',
    Léger: '<circle cx="100" cy="38" r="9"/><path d="M100 48v56M100 62L78 78M100 62l22 16M100 104l-18 36M100 104l18 36M69 141h62" />'
  };
  return `<svg viewBox="0 0 200 170" aria-hidden="true">${icons[name] || icons.Endurance}</svg>`;
};
const mediaDb = (() => {
  let connection;
  const open = () => connection || (connection = new Promise((resolve, reject) => {
    const request = indexedDB.open('forge-media', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('attachments', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }));
  return {
    save: async file => {
      const db = await open();
      const id = crypto.randomUUID();
      await new Promise((resolve, reject) => {
        const transaction = db.transaction('attachments', 'readwrite');
        transaction.objectStore('attachments').put({ id, blob: file, type: file.type });
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
      });
      return id;
    },
    get: async id => {
      const db = await open();
      return new Promise((resolve, reject) => {
        const request = db.transaction('attachments').objectStore('attachments').get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
  };
})();

function render() {
  const labels = { prs: 'Mes performances / Mes PRs', fit: 'Fit level', general: 'Vue générale', profile: 'Mon profil', detail: selectedExercise };
  title.textContent = labels[currentView];
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === currentView));
  content.innerHTML = ({ prs: renderPrs, fit: renderFit, general: renderGeneral, profile: renderProfile, detail: renderDetail })[currentView]();
  if (currentView === 'profile') renderGallery();
}
function renderPrs() {
  return `<section class="view"><div class="section-heading prs-heading"><p>${exerciseList().length} mouvements suivis</p></div>${Object.entries(groupByCategory()).map(([category, names]) => `<section class="category" style="--category-color:${colorForCategory(category)}"><div class="category-title"><h3>${category}</h3>${categoryHasWeight(names) ? '<span class="dot"></span>' : ''}</div>${names.map(name => `<div class="exercise-row"><button class="exercise-main" data-exercise="${name}"><span><strong class="exercise-name">${name}</strong><small>${exercises[name].discipline.join(' · ')}</small></span><span class="exercise-value">${bestFor(name) ? `${bestFor(name)} kg` : ''}</span></button><button class="exercise-info" data-info="${name}" aria-label="Informations sur ${name}">i</button></div>`).join('')}</section>`).join('')}</section>`;
}
function showExerciseInfo(name) {
  const info = infoFor(name);
  const photos = info.photos || [];
  document.querySelector('#exercise-info-dialog').innerHTML = `<div class="exercise-info-modal" style="--info-color:${colorForCategory(exercises[name].category)}"><div class="dialog-head"><div><p class="eyebrow">GUIDE DU MOUVEMENT</p><h2>${name}</h2></div><button type="button" class="close-button close-info" aria-label="Fermer">×</button></div><p class="info-intro">${info.intro}</p>${photos.length ? `<div class="movement-carousel">${photos.map((photo, step) => `<figure class="movement-slide movement-slide-${step + 1}"><img src="${photo}" alt="${name}, étape ${step + 1}" loading="${step ? 'lazy' : 'eager'}"><figcaption>Étape ${step + 1}</figcaption></figure>`).join('')}</div><div class="carousel-dots">${photos.map(() => '<span></span>').join('')}</div>` : '<div class="movement-placeholder">Illustrations anatomiques à venir pour cet exercice.</div>'}<h3>Muscles sollicités</h3><div class="muscle-list">${info.muscles.map(([muscle, color]) => `<span><i style="background:${color}"></i>${muscle}</span>`).join('')}</div><h3>Étapes clés</h3><ol class="movement-steps">${info.steps.map(step => `<li>${step}</li>`).join('')}</ol></div>`;
  const dialog = document.querySelector('#exercise-info-dialog');
  dialog.showModal();
  const carousel = dialog.querySelector('.movement-carousel');
  let slide = 0;
  const timer = photos.length > 1 ? setInterval(() => { if (!dialog.open) { clearInterval(timer); return; } slide = (slide + 1) % photos.length; carousel.scrollTo({ left: carousel.clientWidth * slide, behavior: 'smooth' }); }, 2800) : null;
}
function renderDetail() {
  const movement = exercises[selectedExercise];
  const best = bestFor(selectedExercise);
  const rmValues = { 1: best, 3: Math.round((bestForRm(selectedExercise, 3) || best * .87) * 2) / 2, 5: Math.round((bestForRm(selectedExercise, 5) || best * .8) * 2) / 2, 8: Math.round((bestForRm(selectedExercise, 8) || best * .72) * 2) / 2 };
  const selectedBase = rmValues[selectedRm];
  const latest = recordsFor(selectedExercise).sort((a, b) => b.date.localeCompare(a.date))[0];
  const history = recordsFor(selectedExercise).sort((a, b) => b.date.localeCompare(a.date)).map(record => `<div class="rm-history-row"><span class="rm-badge">${record.unit === 'kg' ? `${recordRm(record)} RM` : record.unit}</span><span>${formatDate(record.date)}</span><strong>${record.value} ${record.unit}</strong></div>`).join('');
  const chart = `<div class="chart-card"><div class="chart-title"><span>Progression</span><strong>${best} kg</strong></div><div class="line-chart">${recordsFor(selectedExercise).sort((a, b) => a.date.localeCompare(b.date)).map(record => `<div class="chart-point" style="left:${Math.max(4, Math.min(96, record.value / best * 92))}%;bottom:${Math.max(8, record.value / best * 75)}%" title="${record.value} kg"></div>`).join('')}<div class="chart-line"></div></div><div class="chart-axis"><span>Historique</span><span>Aujourd'hui</span></div></div>`;
  const analytics = `<div class="analytics-panel"><div class="section-heading"><h3>Analytics</h3><p>${selectedRm}RM · charges de travail</p></div><div class="percentage-grid">${percentages.map(percent => `<button class="percentage-card" data-percent="${percent}" data-exercise="${selectedExercise}"><strong>${percent}%</strong><span>${Math.round(selectedBase * percent / 100 * 2) / 2} kg</span></button>`).join('')}</div></div>`;
  return `<section class="view detail-view"><button class="back-link" data-view="prs">← Toutes mes PRs</button><div class="detail-heading"><div><p class="eyebrow" style="color:${colorForCategory(movement.category)}">${movement.category.toUpperCase()}</p><h2>${selectedExercise}</h2><p>${movement.description}</p></div><span class="detail-dot" style="background:${colorForCategory(movement.category)}"></span></div><div class="rm-selector">${[1, 3, 5, 8].map(rm => `<button class="rm-option ${selectedRm === rm ? 'selected' : ''}" data-rm="${rm}"><strong>${rm}RM</strong><span>${rmValues[rm]} kg</span></button>`).join('')}</div>${analytics}<div class="record-highlight"><span>${selectedRm}RM</span><strong>${selectedBase} kg</strong><small>Dernière mise à jour · ${formatDate(latest.date)}</small></div>${chart}<div class="section-heading history-heading"><h3>Historique</h3><p>Tous les RM confondus</p></div><div class="rm-history">${history}</div></section>`;
}
function renderFit() {
  const dimensions = [{ name: 'Haltéro', value: 0, color: '#efae52' }, { name: 'Force', value: Math.min(100, Math.round((bestFor('Back Squat') + bestFor('Deadlift') + bestFor('Bench Press')) / 3)), color: '#efae52' }, { name: 'Vitesse', value: 0, color: '#4c9cff' }, { name: 'Endurance', value: 0, color: '#efae52' }, { name: 'Long', value: 0, color: '#aaa' }, { name: 'Bodyweight', value: 0, color: '#aaa' }, { name: 'Lourd', value: bestFor('Deadlift') ? 79 : 0, color: '#5ac3aa' }, { name: 'Léger', value: 0, color: '#aaa' }];
  const known = dimensions.filter(item => item.value); const overall = known.length ? Math.round(known.reduce((total, item) => total + item.value, 0) / known.length) : 0;
  return `<section class="view fit-view"><div class="fit-heading"><span class="fit-mark">✦</span><h2>FIT LEVEL</h2></div><div class="fit-score"><div class="fit-ring" style="--score:${overall * 3.6}deg"><strong>${overall}</strong><span>%</span></div></div><div class="fit-grid">${dimensions.map(item => `<div class="fit-metric"><strong style="color:${item.value ? item.color : 'var(--muted)'}">${item.value || 'NA'}<small>${item.value ? '%' : ''}</small></strong><div class="metric-bar"><i style="height:${Math.max(0, item.value)}%;background:${item.color}"></i></div><span class="metric-icon">${fitIcon(item.name)}</span><label>${item.name}</label></div>`).join('')}</div><div class="fit-insight"><div><p class="insight-label">Point fort</p><strong>${known.sort((a, b) => b.value - a.value)[0]?.name || 'À construire'}</strong><span>Continue à nourrir tes mouvements lourds</span></div><div><p class="insight-label">À développer</p><strong>${dimensions.find(item => !item.value).name}</strong><span>Ajoute des performances pour le mesurer</span></div></div></section>`;
}
function renderGeneral() {
  return `<section class="view"><p class="eyebrow">TABLEAU DE BORD</p><h2>Vue générale</h2><div class="general-score"><div><span>FIT LEVEL</span><strong>${Math.round((bestFor('Back Squat') + bestFor('Deadlift')) / 4)}</strong><small>/ 100</small></div><div class="general-note">Ton suivi commence par trois mouvements clés. Les autres disciplines seront ajoutées ensuite.</div></div><div class="section-heading"><h3>Records principaux</h3><p>1RM</p></div><div class="general-prs">${exerciseList().map(name => `<button data-exercise="${name}"><span>${name}</span><strong>${bestFor(name)} kg</strong></button>`).join('')}</div><div class="stat-grid"><div class="stat-card"><strong>${records.length}</strong><span>ENTRÉES</span></div><div class="stat-card"><strong>${new Set(records.map(record => record.date.slice(0, 7))).size}</strong><span>MOIS ACTIFS</span></div></div></section>`;
}
function renderProfile() {
  return `<section class="view"><div class="profile-cover"><div class="profile-avatar">EC</div><div><p class="eyebrow">ATHLETE PROFILE</p><h2>${profile.name}</h2><p>Compte personnel</p></div></div><form id="profile-form" class="profile-form"><div class="form-section-title">Informations personnelles</div><label>Nom<input name="name" value="${profile.name}"></label><label>Date de naissance<input name="birthDate" type="date" value="${profile.birthDate}"></label><div class="profile-data-grid"><label>Poids (kg)<input name="weight" type="number" step="0.1" value="${profile.weight}"></label><label>Taille (cm)<input name="height" type="number" value="${profile.height}"></label><label>Taux de graisse (%)<input name="bodyFat" type="number" step="0.1" value="${profile.bodyFat}"></label><div class="profile-readonly"><span>Âge</span><strong>${age()} ans</strong></div><div class="profile-readonly"><span>IMC</span><strong>${bmi()}</strong></div></div><button class="primary-button">Enregistrer mon profil</button></form><section class="gallery-section"><div class="section-heading"><h2>Galerie</h2><p>Souvenirs de séances</p></div><div id="gallery-grid" class="gallery-grid"><p class="empty">Aucun souvenir pour le moment.</p></div></section></section>`;
}
async function renderGallery() {
  const gallery = document.querySelector('#gallery-grid');
  if (!gallery) return;
  const items = await Promise.all(records.filter(record => record.mediaId).slice().reverse().map(async record => ({ record, media: await mediaDb.get(record.mediaId) })));
  gallery.innerHTML = items.length ? items.filter(item => item.media).map(({ record, media }) => {
    const url = URL.createObjectURL(media.blob);
    const visual = media.type.startsWith('video/') ? `<video src="${url}" controls preload="metadata"></video>` : `<img src="${url}" alt="Souvenir ${record.name}">`;
    return `<article class="gallery-card">${visual}<div><strong>${record.name}</strong><span>${formatDate(record.date)} · ${record.value} ${record.unit}${record.unit === 'kg' ? ` · ${recordRm(record)}RM` : ''}</span></div></article>`;
  }).join('') : '<p class="empty">Aucun souvenir pour le moment.</p>';
}
function openForm() { const dialog = document.querySelector('#performance-dialog'); document.querySelector('#exercise-input').innerHTML = exerciseList().map(name => `<option>${name}</option>`).join(''); document.querySelector('#date-input').value = new Date().toISOString().slice(0, 10); document.querySelector('#unit-input').dispatchEvent(new Event('change')); dialog.showModal(); }
document.addEventListener('click', event => { const navigation = event.target.closest('[data-view]'); const movement = event.target.closest('[data-exercise]'); const info = event.target.closest('[data-info]'); const percentage = event.target.closest('[data-percent]'); const rm = event.target.closest('[data-rm]'); if (navigation) { currentView = navigation.dataset.view; render(); } if (movement) { selectedExercise = movement.dataset.exercise; selectedRm = 1; currentView = 'detail'; render(); } if (info) showExerciseInfo(info.dataset.info); if (percentage) showPlates(Number(percentage.dataset.percent), percentage.dataset.exercise, selectedRm); if (rm) { selectedRm = Number(rm.dataset.rm); render(); } if (event.target.closest('#open-form')) openForm(); if (event.target.closest('#close-performance-dialog')) document.querySelector('#performance-dialog').close(); if (event.target.closest('.close-info')) document.querySelector('#exercise-info-dialog').close(); });
document.addEventListener('change', event => { if (event.target.id === 'unit-input') document.querySelector('#rm-input').disabled = event.target.value !== 'kg'; });
document.addEventListener('submit', async event => { if (event.target.id === 'profile-form') { event.preventDefault(); const data = new FormData(event.target); profile = Object.fromEntries(data.entries()); localStorage.setItem('forge-profile', JSON.stringify(profile)); render(); renderGallery(); } if (event.target.id === 'performance-form') { event.preventDefault(); const name = document.querySelector('#exercise-input').value; const unit = document.querySelector('#unit-input').value; const file = document.querySelector('#media-input').files[0]; const mediaId = file ? await mediaDb.save(file) : null; records.push({ name, value: Number(document.querySelector('#value-input').value), rm: unit === 'kg' ? Number(document.querySelector('#rm-input').value) : null, unit, date: document.querySelector('#date-input').value, mediaId }); localStorage.setItem('forge-records', JSON.stringify(records)); event.target.closest('dialog').close(); currentView = 'prs'; render(); } });
function showPlates(percent, name, rm) { const rmMultiplier = { 1: 1, 3: .87, 5: .8, 8: .72 }; const selectedBase = bestFor(name) * rmMultiplier[rm]; const total = Math.round(selectedBase * percent / 100 * 2) / 2; const perSide = Math.max(0, (total - 15) / 2); const available = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5]; let remainder = perSide; const plates = []; available.forEach(weight => { while (remainder >= weight) { plates.push(weight); remainder = Math.round((remainder - weight) * 100) / 100; } }); const leftPlates = [...plates].reverse(); const loadedPerSide = plates.reduce((sum, weight) => sum + weight, 0); const formatWeight = weight => String(weight).replace('.', ','); document.querySelector('#plates-dialog').innerHTML = `<div class="plates-modal"><button class="close-button" data-close-plates>×</button><p class="eyebrow">${name.toUpperCase()}</p><h2>${rm}RM · ${percent}% · ${total} kg</h2><div class="barbell"><div class="bar-sleeve"></div><div class="plates">${leftPlates.map(weight => `<i class="plate plate-${String(weight).replace('.', '-')}">${weight}</i>`).join('')}</div><div class="bar-center">BARRE<br><strong>15 kg</strong></div><div class="plates mirror">${plates.map(weight => `<i class="plate plate-${String(weight).replace('.', '-')}">${weight}</i>`).join('')}</div></div><p class="plate-note">${plates.length ? `${plates.map(formatWeight).join(' + ')} kg = ${formatWeight(loadedPerSide)} kg de chaque côté` : 'Barre seule'}</p><button class="primary-button" data-close-plates>Fermer</button></div>`; document.querySelector('#plates-dialog').showModal(); }
document.querySelector('#plates-dialog').addEventListener('click', event => { if (event.target.closest('[data-close-plates]')) event.currentTarget.close(); });
render();
renderGallery();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');