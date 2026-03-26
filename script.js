const STORAGE_KEY = 'rojosoft-control-v1';

const config = {
  types: [
    'Nuevo',
    'Nuevo (Alta Prioridad)',
    'Incidente Crítico',
    'Incidente No Crítico',
    'Incidente Implementación',
    'Incidente Usuario',
    'Consulta Usuarios',
    'Configuración',
    'Nueva Configuración',
    'Nueva Configuración con Prueba',
    'Capacitación Externa',
    'Capacitación Interna',
    'Asignación Interna',
    'Evaluación',
    'Documento Funcional',
    'Oportunidad de Mejora',
    'Tipo a Definir'
  ],
  statuses: ['Pendiente', 'En curso', 'Esperando', 'Prueba', 'Implementado', 'Validado', 'Cancelado'],
  stages: ['Datos Generales', 'Evaluación', 'Aprobación', 'Ejecución', 'Prueba', 'Implementación', 'Validación'],
  shifts: {
    '9-18': { label: '9 a 18', checkIn: '09:00', checkOut: '18:00', lunch: '01:00', goal: '07:00' },
    '8-17': { label: '8 a 17', checkIn: '08:00', checkOut: '17:00', lunch: '01:00', goal: '07:00' },
    '8-16': { label: '8 a 16', checkIn: '08:00', checkOut: '16:00', lunch: '00:30', goal: '07:00' },
    '11-19': { label: '11 a 19', checkIn: '11:00', checkOut: '19:00', lunch: '00:30', goal: '07:00' }
  }
};

const defaultState = () => ({
  requirements: [
    {
      id: 'REQ-410280',
      client: 'Molino Victoria',
      description: 'Validar acuerdo de crédito y saldo pendiente en cuenta corriente',
      type: 'Incidente Implementación',
      status: 'En curso',
      stage: 'Ejecución',
      priority: 'Alta',
      team: 'Soporte',
      originDate: todayISO(),
      lastResponseDate: daysAgoISO(1),
      hours: '01:40',
      notes: 'Pendiente feedback del usuario y revisar validación final.',
      noReply: true,
      waitingConfig: false
    },
    {
      id: 'REQ-410281',
      client: 'Molino Matilde',
      description: 'Configurar circuito de retiro disponible para neteo con ticket de ingreso',
      type: 'Configuración',
      status: 'Esperando',
      stage: 'Implementación',
      priority: 'Alta',
      team: 'Implementación',
      originDate: daysAgoISO(2),
      lastResponseDate: daysAgoISO(2),
      hours: '02:20',
      notes: 'Quedó a la espera de confirmar parametrización final.',
      noReply: false,
      waitingConfig: true
    },
    {
      id: 'REQ-410282',
      client: 'Rojosoft',
      description: 'Documentar categorías de tickets y criterios de atención',
      type: 'Documento Funcional',
      status: 'Pendiente',
      stage: 'Evaluación',
      priority: 'Media',
      team: 'Soporte',
      originDate: daysAgoISO(3),
      lastResponseDate: daysAgoISO(1),
      hours: '00:45',
      notes: 'Armar instructivo interno con ejemplos.',
      noReply: false,
      waitingConfig: false
    },
    {
      id: 'REQ-410283',
      client: 'Agrícola Richetta',
      description: 'Seguimiento de facturas en rojo y respuesta al cliente',
      type: 'Consulta Usuarios',
      status: 'Pendiente',
      stage: 'Validación',
      priority: 'Alta',
      team: 'Soporte',
      originDate: daysAgoISO(4),
      lastResponseDate: daysAgoISO(4),
      hours: '00:55',
      notes: 'Enviar revalidación y confirmar si ya visualiza comprobantes.',
      noReply: true,
      waitingConfig: false
    }
  ],
  journey: {
    date: todayISO(),
    shift: '9-18',
    checkIn: '09:00',
    checkOut: '18:00',
    lunch: '01:00',
    goal: '07:00'
  },
  timeEntries: [
    { id: uid(), reqId: 'REQ-410280', task: 'Análisis de saldo pendiente', duration: '00:50', category: 'productivo', date: todayISO() },
    { id: uid(), reqId: 'REQ-410281', task: 'Revisión configuración REO', duration: '00:35', category: 'productivo', date: todayISO() },
    { id: uid(), reqId: 'GENERAL', task: 'Almuerzo', duration: '00:30', category: 'almuerzo', date: todayISO() }
  ],
  activeTimer: null
});

let state = loadState();
let timerInterval = null;

const els = {
  navLinks: document.querySelectorAll('.nav-link'),
  sections: {
    dashboard: document.getElementById('dashboardSection'),
    requerimientos: document.getElementById('requerimientosSection'),
    kanban: document.getElementById('kanbanSection'),
    jornada: document.getElementById('jornadaSection'),
    reportes: document.getElementById('reportesSection')
  },
  sectionTitle: document.getElementById('sectionTitle'),
  sectionSubtitle: document.getElementById('sectionSubtitle'),
  requirementsTable: document.getElementById('requirementsTable'),
  priorityList: document.getElementById('priorityList'),
  kanbanBoard: document.getElementById('kanbanBoard'),
  timeEntriesList: document.getElementById('timeEntriesList'),
  statusReport: document.getElementById('statusReport'),
  typeReport: document.getElementById('typeReport'),
  alertsList: document.getElementById('alertsList'),
  todayTimeline: document.getElementById('todayTimeline'),
  progressCircle: document.getElementById('progressCircle'),
  productivePercent: document.getElementById('productivePercent'),
  currentShiftBadge: document.getElementById('currentShiftBadge'),
  statActive: document.getElementById('statActive'),
  statNoReply: document.getElementById('statNoReply'),
  statWaitingConfig: document.getElementById('statWaitingConfig'),
  statProductiveToday: document.getElementById('statProductiveToday'),
  sidePending: document.getElementById('sidePending'),
  sideNoReply: document.getElementById('sideNoReply'),
  sideWaitingConfig: document.getElementById('sideWaitingConfig'),
  resumeCheckIn: document.getElementById('resumeCheckIn'),
  resumeEstimatedEnd: document.getElementById('resumeEstimatedEnd'),
  resumeLunch: document.getElementById('resumeLunch'),
  resumeDifference: document.getElementById('resumeDifference'),
  searchInput: document.getElementById('searchInput'),
  statusFilter: document.getElementById('statusFilter'),
  typeFilter: document.getElementById('typeFilter'),
  teamFilter: document.getElementById('teamFilter'),
  modal: document.getElementById('requirementModal'),
  modalTitle: document.getElementById('modalTitle'),
  requirementForm: document.getElementById('requirementForm'),
  reqIdField: document.getElementById('reqIdField'),
  reqClient: document.getElementById('reqClient'),
  reqDescription: document.getElementById('reqDescription'),
  reqType: document.getElementById('reqType'),
  reqStatus: document.getElementById('reqStatus'),
  reqStage: document.getElementById('reqStage'),
  reqPriority: document.getElementById('reqPriority'),
  reqTeam: document.getElementById('reqTeam'),
  reqOriginDate: document.getElementById('reqOriginDate'),
  reqLastResponseDate: document.getElementById('reqLastResponseDate'),
  reqHours: document.getElementById('reqHours'),
  reqNotes: document.getElementById('reqNotes'),
  reqNoReply: document.getElementById('reqNoReply'),
  reqWaitingConfig: document.getElementById('reqWaitingConfig'),
  shiftSelect: document.getElementById('shiftSelect'),
  workDateInput: document.getElementById('workDateInput'),
  checkInInput: document.getElementById('checkInInput'),
  checkOutInput: document.getElementById('checkOutInput'),
  lunchInput: document.getElementById('lunchInput'),
  goalInput: document.getElementById('goalInput'),
  timeReqSelect: document.getElementById('timeReqSelect'),
  timeTaskInput: document.getElementById('timeTaskInput'),
  timeDurationInput: document.getElementById('timeDurationInput'),
  timeCategorySelect: document.getElementById('timeCategorySelect'),
  liveTimer: document.getElementById('liveTimer'),
  openCreateBtn: document.getElementById('openCreateBtn'),
  openCreateFromDashboard: document.getElementById('openCreateFromDashboard'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelModalBtn: document.getElementById('cancelModalBtn'),
  saveJourneyBtn: document.getElementById('saveJourneyBtn'),
  fillShiftBtn: document.getElementById('fillShiftBtn'),
  addTimeBtn: document.getElementById('addTimeBtn'),
  startTimerBtn: document.getElementById('startTimerBtn'),
  stopTimerBtn: document.getElementById('stopTimerBtn'),
  exportBtn: document.getElementById('exportBtn'),
  importInput: document.getElementById('importInput'),
  resetDemoBtn: document.getElementById('resetDemoBtn')
};

init();

function init() {
  fillSelects();
  bindEvents();
  renderAll();
  restoreTimerIfNeeded();
}

function fillSelects() {
  fillOptions(els.reqType, config.types);
  fillOptions(els.reqStatus, config.statuses);
  fillOptions(els.reqStage, config.stages);
  fillOptions(els.statusFilter, ['all', ...config.statuses], { keepFirst: true, labelMap: { all: 'Todos los estados' } });
  fillOptions(els.typeFilter, ['all', ...config.types], { keepFirst: true, labelMap: { all: 'Todos los tipos' } });
  fillOptions(els.shiftSelect, Object.entries(config.shifts).map(([value, item]) => ({ value, label: `Turno ${item.label}` })));
}

function bindEvents() {
  els.navLinks.forEach((btn) => btn.addEventListener('click', () => switchSection(btn.dataset.section)));
  els.openCreateBtn.addEventListener('click', () => openModal());
  els.openCreateFromDashboard.addEventListener('click', () => openModal());
  els.closeModalBtn.addEventListener('click', closeModal);
  els.cancelModalBtn.addEventListener('click', closeModal);
  els.requirementForm.addEventListener('submit', saveRequirement);
  els.searchInput.addEventListener('input', renderRequirements);
  els.statusFilter.addEventListener('change', renderRequirements);
  els.typeFilter.addEventListener('change', renderRequirements);
  els.teamFilter.addEventListener('change', renderRequirements);
  els.fillShiftBtn.addEventListener('click', applySelectedShift);
  els.saveJourneyBtn.addEventListener('click', saveJourney);
  els.addTimeBtn.addEventListener('click', addTimeEntry);
  els.startTimerBtn.addEventListener('click', startTimer);
  els.stopTimerBtn.addEventListener('click', stopTimer);
  els.exportBtn.addEventListener('click', exportData);
  els.importInput.addEventListener('change', importData);
  els.resetDemoBtn.addEventListener('click', () => {
    state = defaultState();
    persist();
    renderAll();
    restoreTimerIfNeeded();
  });
  window.addEventListener('click', (e) => {
    if (e.target === els.modal) closeModal();
  });
}

function switchSection(sectionKey) {
  const titles = {
    dashboard: ['Dashboard operativo', 'Control diario de tareas, tiempos y seguimiento de tickets'],
    requerimientos: ['Gestión de requerimientos', 'Altas, filtros, edición y control de estados'],
    kanban: ['Seguimiento por etapas', 'Vista rápida del flujo de trabajo del CRM'],
    jornada: ['Control de jornada', 'Horas productivas, almuerzo y carga diaria de tiempos'],
    reportes: ['Reportes y alertas', 'Panorama general para decidir prioridades']
  };

  Object.entries(els.sections).forEach(([key, section]) => section.classList.toggle('active', key === sectionKey));
  els.navLinks.forEach((btn) => btn.classList.toggle('active', btn.dataset.section === sectionKey));
  els.sectionTitle.textContent = titles[sectionKey][0];
  els.sectionSubtitle.textContent = titles[sectionKey][1];
}

function renderAll() {
  syncJourneyForm();
  renderRequirements();
  renderDashboard();
  renderKanban();
  renderTimeEntries();
  renderReports();
  renderReqSelect();
  persist();
}

function renderRequirements() {
  const rows = getFilteredRequirements();
  if (!rows.length) {
    els.requirementsTable.innerHTML = `<tr><td colspan="10"><div class="empty-state">No hay requerimientos con esos filtros.</div></td></tr>`;
    return;
  }

  els.requirementsTable.innerHTML = rows.map((req) => `
    <tr>
      <td><strong>${req.id}</strong></td>
      <td>${req.client}</td>
      <td>${req.description}</td>
      <td>${req.type}</td>
      <td>${badge(req.status)}</td>
      <td>${req.stage}</td>
      <td>${badge(req.priority, priorityTone(req.priority))}</td>
      <td>${formatDate(req.lastResponseDate) || '—'}</td>
      <td>${req.hours}</td>
      <td>
        <div class="action-group">
          <button class="action-mini" onclick="editRequirement('${req.id}')">Editar</button>
          <button class="action-mini" onclick="advanceRequirement('${req.id}')">Avanzar</button>
          <button class="action-mini" onclick="deleteRequirement('${req.id}')">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderDashboard() {
  const active = state.requirements.filter((r) => !['Validado', 'Cancelado'].includes(r.status));
  const noReply = state.requirements.filter((r) => r.noReply).length;
  const waitingConfig = state.requirements.filter((r) => r.waitingConfig).length;
  const productive = getTodayMinutesByCategory('productivo');
  const goal = timeToMinutes(state.journey.goal);
  const diff = productive - goal;

  els.statActive.textContent = active.length;
  els.statNoReply.textContent = noReply;
  els.statWaitingConfig.textContent = waitingConfig;
  els.statProductiveToday.textContent = minutesToTime(productive);
  els.sidePending.textContent = state.requirements.filter((r) => ['Pendiente', 'En curso', 'Esperando', 'Prueba', 'Implementado'].includes(r.status)).length;
  els.sideNoReply.textContent = noReply;
  els.sideWaitingConfig.textContent = waitingConfig;
  els.currentShiftBadge.textContent = `Turno ${config.shifts[state.journey.shift].label}`;
  els.resumeCheckIn.textContent = state.journey.checkIn;
  els.resumeEstimatedEnd.textContent = state.journey.checkOut;
  els.resumeLunch.textContent = state.journey.lunch;
  els.resumeDifference.textContent = `${diff >= 0 ? '+' : '-'}${minutesToTime(Math.abs(diff))}`;

  const ratio = goal ? Math.min(productive / goal, 1) : 0;
  const circumference = 301.59;
  els.progressCircle.style.strokeDashoffset = circumference - (circumference * ratio);
  els.productivePercent.textContent = `${Math.round((productive / Math.max(goal, 1)) * 100)}%`;

  const priorityItems = [...state.requirements]
    .sort((a, b) => {
      const aScore = priorityScore(a.priority) + (a.noReply ? 3 : 0) + (a.waitingConfig ? 2 : 0);
      const bScore = priorityScore(b.priority) + (b.noReply ? 3 : 0) + (b.waitingConfig ? 2 : 0);
      return bScore - aScore;
    })
    .slice(0, 5);

  els.priorityList.innerHTML = priorityItems.length ? priorityItems.map((req) => `
    <div class="priority-item">
      <div class="priority-item-top">
        <strong>${req.id} · ${req.client}</strong>
        ${badge(req.priority, priorityTone(req.priority))}
      </div>
      <div>${req.description}</div>
      <div class="meta-row">
        ${badge(req.status)}
        ${req.noReply ? badge('Sin respuesta', 'red') : ''}
        ${req.waitingConfig ? badge('Espera config.', 'yellow') : ''}
        ${badge(req.stage, 'gray')}
      </div>
    </div>
  `).join('') : `<div class="empty-state">No hay requerimientos cargados.</div>`;

  const todayEntries = state.timeEntries.filter((entry) => entry.date === state.journey.date);
  els.todayTimeline.innerHTML = todayEntries.length ? todayEntries.map((entry) => `
    <div class="timeline-item">
      <div class="entry-top">
        <strong>${entry.task}</strong>
        ${badge(minutesToTime(timeToMinutes(entry.duration)), categoryTone(entry.category))}
      </div>
      <div class="meta-row">
        ${badge(entry.reqId === 'GENERAL' ? 'General' : entry.reqId, 'blue')}
        ${badge(categoryLabel(entry.category), categoryTone(entry.category))}
      </div>
    </div>
  `).join('') : `<div class="empty-state">Todavía no cargaste tiempos para hoy.</div>`;
}

function renderKanban() {
  els.kanbanBoard.innerHTML = config.statuses.slice(0, 6).map((status) => {
    const items = state.requirements.filter((req) => req.status === status);
    return `
      <div class="kanban-column">
        <h3>${status} <span class="badge gray">${items.length}</span></h3>
        <div class="kanban-list">
          ${items.length ? items.map((req) => `
            <div class="kanban-card">
              <strong>${req.id}</strong>
              <p>${req.client}</p>
              <p>${req.description}</p>
              <div class="meta-row">
                ${badge(req.priority, priorityTone(req.priority))}
                ${req.noReply ? badge('Sin respuesta', 'red') : ''}
              </div>
            </div>
          `).join('') : `<div class="empty-state">Sin elementos</div>`}
        </div>
      </div>
    `;
  }).join('');
}

function renderTimeEntries() {
  const entries = state.timeEntries.filter((entry) => entry.date === state.journey.date);
  els.timeEntriesList.innerHTML = entries.length ? entries.map((entry) => `
    <div class="entry-item">
      <div class="entry-top">
        <strong>${entry.task}</strong>
        <div class="action-group">
          ${badge(entry.duration, 'blue')}
          <button class="action-mini" onclick="deleteTimeEntry('${entry.id}')">Eliminar</button>
        </div>
      </div>
      <div class="meta-row">
        ${badge(entry.reqId === 'GENERAL' ? 'General' : entry.reqId, 'gray')}
        ${badge(categoryLabel(entry.category), categoryTone(entry.category))}
        ${badge(formatDate(entry.date), 'dark')}
      </div>
    </div>
  `).join('') : `<div class="empty-state">No hay tiempos cargados para esta fecha.</div>`;
}

function renderReports() {
  renderCountList(els.statusReport, countBy(state.requirements, 'status'));
  renderCountList(els.typeReport, countBy(state.requirements, 'type'));

  const alerts = [];
  const noReplyReqs = state.requirements.filter((r) => r.noReply);
  const waitingReqs = state.requirements.filter((r) => r.waitingConfig);
  const dueDiff = getTodayMinutesByCategory('productivo') - timeToMinutes(state.journey.goal);

  if (noReplyReqs.length) alerts.push(`${noReplyReqs.length} requerimiento(s) sin respuesta del cliente o del área.`);
  if (waitingReqs.length) alerts.push(`${waitingReqs.length} requerimiento(s) están esperando configuración.`);
  if (dueDiff < 0) alerts.push(`Hoy te faltan ${minutesToTime(Math.abs(dueDiff))} para completar las 7 horas productivas.`);
  if (!alerts.length) alerts.push('No hay alertas operativas en este momento.');

  els.alertsList.innerHTML = alerts.map((text) => `<div class="alert-item">${text}</div>`).join('');
}

function renderReqSelect() {
  const options = [{ value: 'GENERAL', label: 'General / sin requerimiento' }, ...state.requirements.map((req) => ({ value: req.id, label: `${req.id} · ${req.client}` }))];
  els.timeReqSelect.innerHTML = options.map((opt) => `<option value="${opt.value}">${opt.label}</option>`).join('');
}

function openModal(req = null) {
  els.modal.classList.remove('hidden');
  if (req) {
    els.modalTitle.textContent = `Editar ${req.id}`;
    els.reqIdField.value = req.id;
    els.reqClient.value = req.client;
    els.reqDescription.value = req.description;
    els.reqType.value = req.type;
    els.reqStatus.value = req.status;
    els.reqStage.value = req.stage;
    els.reqPriority.value = req.priority;
    els.reqTeam.value = req.team;
    els.reqOriginDate.value = req.originDate;
    els.reqLastResponseDate.value = req.lastResponseDate || '';
    els.reqHours.value = req.hours;
    els.reqNotes.value = req.notes || '';
    els.reqNoReply.value = String(req.noReply);
    els.reqWaitingConfig.value = String(req.waitingConfig);
  } else {
    els.modalTitle.textContent = 'Nuevo requerimiento';
    els.requirementForm.reset();
    els.reqIdField.value = '';
    els.reqOriginDate.value = todayISO();
    els.reqHours.value = '00:00';
    els.reqNoReply.value = 'false';
    els.reqWaitingConfig.value = 'false';
  }
}

function closeModal() {
  els.modal.classList.add('hidden');
}

function saveRequirement(event) {
  event.preventDefault();
  const existingId = els.reqIdField.value;

  const payload = {
    id: existingId || createReqId(),
    client: els.reqClient.value.trim(),
    description: els.reqDescription.value.trim(),
    type: els.reqType.value,
    status: els.reqStatus.value,
    stage: els.reqStage.value,
    priority: els.reqPriority.value,
    team: els.reqTeam.value,
    originDate: els.reqOriginDate.value,
    lastResponseDate: els.reqLastResponseDate.value,
    hours: els.reqHours.value || '00:00',
    notes: els.reqNotes.value.trim(),
    noReply: els.reqNoReply.value === 'true',
    waitingConfig: els.reqWaitingConfig.value === 'true'
  };

  if (existingId) {
    state.requirements = state.requirements.map((req) => req.id === existingId ? payload : req);
  } else {
    state.requirements.unshift(payload);
  }

  closeModal();
  renderAll();
}

window.editRequirement = function(id) {
  const req = state.requirements.find((item) => item.id === id);
  if (req) openModal(req);
};

window.deleteRequirement = function(id) {
  state.requirements = state.requirements.filter((item) => item.id !== id);
  state.timeEntries = state.timeEntries.filter((item) => item.reqId !== id);
  renderAll();
};

window.advanceRequirement = function(id) {
  state.requirements = state.requirements.map((req) => {
    if (req.id !== id) return req;
    const nextStatusIndex = Math.min(config.statuses.indexOf(req.status) + 1, config.statuses.length - 2);
    const nextStageIndex = Math.min(config.stages.indexOf(req.stage) + 1, config.stages.length - 1);
    return { ...req, status: config.statuses[nextStatusIndex], stage: config.stages[nextStageIndex], lastResponseDate: todayISO(), noReply: false };
  });
  renderAll();
};

function syncJourneyForm() {
  els.shiftSelect.value = state.journey.shift;
  els.workDateInput.value = state.journey.date;
  els.checkInInput.value = state.journey.checkIn;
  els.checkOutInput.value = state.journey.checkOut;
  els.lunchInput.value = state.journey.lunch;
  els.goalInput.value = state.journey.goal;
}

function applySelectedShift() {
  const selected = config.shifts[els.shiftSelect.value];
  els.checkInInput.value = selected.checkIn;
  els.checkOutInput.value = selected.checkOut;
  els.lunchInput.value = selected.lunch;
  els.goalInput.value = selected.goal;
}

function saveJourney() {
  state.journey = {
    date: els.workDateInput.value,
    shift: els.shiftSelect.value,
    checkIn: els.checkInInput.value,
    checkOut: els.checkOutInput.value,
    lunch: els.lunchInput.value,
    goal: els.goalInput.value
  };
  renderAll();
}

function addTimeEntry() {
  if (!els.timeTaskInput.value.trim()) return;
  state.timeEntries.unshift({
    id: uid(),
    reqId: els.timeReqSelect.value,
    task: els.timeTaskInput.value.trim(),
    duration: els.timeDurationInput.value || '00:00',
    category: els.timeCategorySelect.value,
    date: state.journey.date
  });
  els.timeTaskInput.value = '';
  els.timeDurationInput.value = '00:30';
  els.timeCategorySelect.value = 'productivo';
  renderAll();
}

window.deleteTimeEntry = function(id) {
  state.timeEntries = state.timeEntries.filter((entry) => entry.id !== id);
  renderAll();
};

function startTimer() {
  if (state.activeTimer) return;
  state.activeTimer = {
    reqId: els.timeReqSelect.value,
    task: els.timeTaskInput.value.trim() || 'Tarea sin nombre',
    category: els.timeCategorySelect.value,
    startedAt: Date.now(),
    date: state.journey.date
  };
  persist();
  restoreTimerIfNeeded();
}

function stopTimer() {
  if (!state.activeTimer) return;
  const minutes = Math.max(1, Math.round((Date.now() - state.activeTimer.startedAt) / 60000));
  state.timeEntries.unshift({
    id: uid(),
    reqId: state.activeTimer.reqId,
    task: state.activeTimer.task,
    duration: minutesToTime(minutes),
    category: state.activeTimer.category,
    date: state.activeTimer.date
  });
  state.activeTimer = null;
  persist();
  restoreTimerIfNeeded();
  renderAll();
}

function restoreTimerIfNeeded() {
  clearInterval(timerInterval);
  if (!state.activeTimer) {
    els.liveTimer.textContent = '00:00:00';
    return;
  }
  updateLiveTimer();
  timerInterval = setInterval(updateLiveTimer, 1000);
}

function updateLiveTimer() {
  if (!state.activeTimer) return;
  const totalSeconds = Math.floor((Date.now() - state.activeTimer.startedAt) / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  els.liveTimer.textContent = `${hours}:${minutes}:${seconds}`;
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rojosoft-control-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = JSON.parse(reader.result);
      renderAll();
      restoreTimerIfNeeded();
    } catch {
      alert('No se pudo importar el archivo.');
    }
  };
  reader.readAsText(file);
}

function getFilteredRequirements() {
  const search = els.searchInput.value.trim().toLowerCase();
  return state.requirements.filter((req) => {
    const matchesSearch = !search || [req.id, req.client, req.description].some((item) => item.toLowerCase().includes(search));
    const matchesStatus = els.statusFilter.value === 'all' || req.status === els.statusFilter.value;
    const matchesType = els.typeFilter.value === 'all' || req.type === els.typeFilter.value;
    const matchesTeam = els.teamFilter.value === 'all' || req.team === els.teamFilter.value;
    return matchesSearch && matchesStatus && matchesType && matchesTeam;
  });
}

function countBy(list, key) {
  return list.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});
}

function renderCountList(container, counts) {
  const items = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  container.innerHTML = items.length ? items.map(([label, total]) => `
    <div class="report-item">
      <div class="entry-top">
        <strong>${label}</strong>
        ${badge(String(total), 'blue')}
      </div>
    </div>
  `).join('') : `<div class="empty-state">Sin datos.</div>`;
}

function getTodayMinutesByCategory(category) {
  return state.timeEntries
    .filter((entry) => entry.date === state.journey.date && entry.category === category)
    .reduce((acc, entry) => acc + timeToMinutes(entry.duration), 0);
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState();
  try {
    return JSON.parse(raw);
  } catch {
    return defaultState();
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function fillOptions(select, items, options = {}) {
  const keepFirst = options.keepFirst || false;
  const labelMap = options.labelMap || {};
  const firstOption = keepFirst ? select.querySelector('option')?.outerHTML || '' : '';
  const normalized = items.map((item) => typeof item === 'string' ? { value: item, label: labelMap[item] || item } : item);
  select.innerHTML = `${firstOption}${normalized.map((item) => `<option value="${item.value}">${item.label}</option>`).join('')}`;
}

function badge(text, tone = 'dark') {
  return `<span class="badge ${tone}">${text}</span>`;
}

function priorityTone(priority) {
  return priority === 'Alta' ? 'red' : priority === 'Media' ? 'yellow' : 'gray';
}

function categoryTone(category) {
  return ({ productivo: 'green', almuerzo: 'yellow', improductivo: 'red', reunion: 'blue' }[category]) || 'gray';
}

function categoryLabel(category) {
  return ({ productivo: 'Productivo', almuerzo: 'Almuerzo', improductivo: 'Improductivo', reunion: 'Reunión' }[category]) || category;
}

function priorityScore(priority) {
  return ({ Alta: 3, Media: 2, Baja: 1 }[priority]) || 0;
}

function timeToMinutes(value) {
  if (!value) return 0;
  const [hours, minutes] = value.split(':').map(Number);
  return (hours * 60) + minutes;
}

function minutesToTime(totalMinutes) {
  const safe = Math.max(0, totalMinutes);
  const hours = String(Math.floor(safe / 60)).padStart(2, '0');
  const minutes = String(safe % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function createReqId() {
  const max = state.requirements.reduce((acc, item) => Math.max(acc, Number(item.id.split('-')[1]) || 0), 410000);
  return `REQ-${max + 1}`;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
