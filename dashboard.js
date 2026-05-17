/**
 * dashboard.js — Agenti Alert Dashboard Interactivity
 * Handles: sidebar navigation, search, job modals,
 * notification panel, settings panel, avatar dropdown,
 * resume review modal, trending toasts, and keyboard / backdrop close.
 */

'use strict';

/* ──────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────── */

const $ = (id) => document.getElementById(id);
const backdrop = $('backdrop');

function openBackdrop() { backdrop.classList.add('active'); }
function closeBackdrop() { backdrop.classList.remove('active'); }

function showToast(msg, duration = 3000) {
  const toast = $('toast');
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), duration);
}

/* Close ALL panels / modals / dropdowns */
function closeAll() {
  document.querySelectorAll('.modal.open').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.side-panel.open').forEach(el => el.classList.remove('open'));
  $('avatar-dropdown').classList.remove('open');
  closeBackdrop();
}

/* ──────────────────────────────────────────────
   SIDEBAR NAVIGATION
────────────────────────────────────────────── */

const sidebarItems = document.querySelectorAll('.sidebar-item');

sidebarItems.forEach(item => {
  item.addEventListener('click', () => {
    const section = item.dataset.section;

    // Settings sidebar icon → open settings panel
    if (section === 'settings') {
      openPanel('settings-panel');
      return;
    }

    // Remove active from all, add to clicked
    sidebarItems.forEach(s => s.classList.remove('active'));
    item.classList.add('active');

    const labels = {
      home:      'Home',
      explore:   'Explore',
      saved:     'Saved Opportunities',
      community: 'Community',
      bookmarks: 'Bookmarks',
    };
    if (labels[section]) showToast(`Navigating to ${labels[section]}`);
  });
});

/* ──────────────────────────────────────────────
   SEARCH / FILTER
────────────────────────────────────────────── */

const searchInput = $('search-input');
const oppCards   = document.querySelectorAll('#opp-cards-grid .opp-card');
const noResults  = $('no-results');

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;

  oppCards.forEach(card => {
    const role    = card.dataset.role?.toLowerCase()    || '';
    const company = card.dataset.company?.toLowerCase() || '';
    const loc     = card.dataset.location?.toLowerCase() || '';

    if (!query || role.includes(query) || company.includes(query) || loc.includes(query)) {
      card.style.display = '';
      visible++;
    } else {
      card.style.display = 'none';
    }
  });

  noResults.style.display = visible === 0 ? 'flex' : 'none';
});

// Clear search on Escape if focused
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input'));
  }
});

/* ──────────────────────────────────────────────
   JOB DETAILS MODAL
────────────────────────────────────────────── */

const jobModal = $('job-modal');

const logoStyles = {
  Google:    { bg: '#fff',  color: '#4285F4', text: 'G' },
  Microsoft: { bg: '#333',  color: '#fff',    text: 'MS' },
  Atlassian: { bg: '#1e88e5', color: '#fff',  text: 'A' },
  Amazon:    { bg: '#ff9900', color: '#fff',  text: 'A' },
};

document.querySelectorAll('.view-details-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.opp-card');
    const company  = card.dataset.company;
    const role     = card.dataset.role;
    const location = card.dataset.location;
    const salary   = card.dataset.salary;
    const type     = card.dataset.type;
    const posted   = card.dataset.posted;
    const desc     = card.dataset.desc;

    // Populate modal fields
    $('modal-role').textContent     = role;
    $('modal-company').textContent  = company;
    $('modal-location').textContent = location;
    $('modal-salary').textContent   = salary;
    $('modal-type').textContent     = type;
    $('modal-posted').textContent   = `Posted ${posted}`;
    $('modal-desc').textContent     = desc;

    // Logo
    const style = logoStyles[company] || { bg: '#2563eb', color: '#fff', text: company[0] };
    const logo  = $('modal-logo');
    logo.textContent        = style.text;
    logo.style.background   = style.bg;
    logo.style.color        = style.color;

    // Tag based on card tag text
    const tagEl   = card.querySelector('.tag');
    $('modal-tag').innerHTML = tagEl ? tagEl.outerHTML : '';

    openModal(jobModal);
  });
});

$('job-modal-close').addEventListener('click', () => closeModal(jobModal));

$('modal-apply-btn').addEventListener('click', () => {
  const company = $('modal-company').textContent;
  const role    = $('modal-role').textContent;
  closeModal(jobModal);
  showToast(`✅ Application submitted to ${company} for ${role}!`);
});

$('modal-save-btn').addEventListener('click', () => {
  const role = $('modal-role').textContent;
  $('modal-save-btn').innerHTML = `<svg viewBox="0 0 24 24" width="16" stroke="currentColor" fill="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> Saved`;
  $('modal-save-btn').classList.add('saved');
  showToast(`🔖 "${role}" saved to bookmarks`);
});

/* ──────────────────────────────────────────────
   NOTIFICATION PANEL
────────────────────────────────────────────── */

$('bell-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  const panel = $('notif-panel');
  if (panel.classList.contains('open')) {
    closeAll();
  } else {
    closeAll();
    openPanel('notif-panel');
  }
});

$('notif-close').addEventListener('click', () => closePanel('notif-panel'));

$('mark-all-read').addEventListener('click', () => {
  document.querySelectorAll('.notif-item.unread').forEach(item => {
    item.classList.remove('unread');
    item.querySelector('.notif-dot').style.opacity = '0';
  });
  const badge = document.querySelector('.notif-badge');
  if (badge) badge.style.display = 'none';
  showToast('All notifications marked as read');
});

/* ──────────────────────────────────────────────
   SETTINGS PANEL
────────────────────────────────────────────── */

[$('topnav-settings-btn'), $('nav-settings')].forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const panel = $('settings-panel');
    if (panel.classList.contains('open')) {
      closeAll();
    } else {
      closeAll();
      openPanel('settings-panel');
    }
  });
});

$('settings-close').addEventListener('click', () => closePanel('settings-panel'));

// Toggle switch feedback
$('toggle-email').addEventListener('change', (e) => {
  showToast(e.target.checked ? '📧 Email alerts enabled' : '📧 Email alerts disabled');
});
$('toggle-push').addEventListener('change', (e) => {
  showToast(e.target.checked ? '🔔 Push notifications enabled' : '🔔 Push notifications disabled');
});
$('toggle-dark').addEventListener('change', (e) => {
  showToast(e.target.checked ? '🌙 Dark mode on' : '☀️ Light mode on');
});
$('toggle-profile').addEventListener('change', (e) => {
  showToast(e.target.checked ? '👁️ Profile visible to recruiters' : '🔒 Profile hidden');
});

/* ──────────────────────────────────────────────
   AVATAR DROPDOWN
────────────────────────────────────────────── */

const avatarDropdown = $('avatar-dropdown');

$('avatar-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  if (avatarDropdown.classList.contains('open')) {
    avatarDropdown.classList.remove('open');
  } else {
    closeAll();
    // Position dropdown below avatar
    const rect = $('avatar-btn').getBoundingClientRect();
    avatarDropdown.style.top  = (rect.bottom + 8) + 'px';
    avatarDropdown.style.right = (window.innerWidth - rect.right) + 'px';
    avatarDropdown.classList.add('open');
  }
});

$('profile-btn').addEventListener('click', () => {
  avatarDropdown.classList.remove('open');
  showToast('👤 Profile page coming soon!');
});

$('logout-btn').addEventListener('click', () => {
  avatarDropdown.classList.remove('open');
  showToast('Logging out…');
  setTimeout(() => { window.location.href = 'auth.html'; }, 1200);
});

/* ──────────────────────────────────────────────
   RESUME REVIEW MODAL
────────────────────────────────────────────── */

const resumeModal = $('resume-modal');

$('resume-review-btn').addEventListener('click', () => openModal(resumeModal));
$('resume-modal-close').addEventListener('click', () => closeModal(resumeModal));
$('resume-modal-cancel').addEventListener('click', () => closeModal(resumeModal));

$('submit-review-btn').addEventListener('click', () => {
  const name  = $('review-name').value.trim();
  const email = $('review-email').value.trim();
  const text  = $('review-text').value.trim();

  if (!name || !email || !text) {
    showToast('⚠️ Please fill in all fields before submitting.');
    return;
  }

  closeModal(resumeModal);
  showToast(`✅ Resume review request submitted, ${name}! We'll email ${email} within 24 hours.`, 4000);
  // Reset form
  $('review-name').value  = '';
  $('review-email').value = '';
  $('review-text').value  = '';
});

/* ──────────────────────────────────────────────
   TRENDING ITEMS
────────────────────────────────────────────── */

document.querySelectorAll('.trend-item').forEach(item => {
  item.addEventListener('click', () => {
    const company = item.dataset.company;
    const role    = item.dataset.role;
    const time    = item.dataset.time;

    // Highlight active trend
    document.querySelectorAll('.trend-item').forEach(t => t.classList.remove('trend-active'));
    item.classList.add('trend-active');

    showToast(`🔥 ${company} — ${role} (${time})`, 3500);
  });
});

/* ──────────────────────────────────────────────
   MODAL / PANEL OPEN-CLOSE UTILITIES
────────────────────────────────────────────── */

function openModal(modal) {
  closeAll();
  modal.classList.add('open');
  openBackdrop();
}

function closeModal(modal) {
  modal.classList.remove('open');
  closeBackdrop();
}

function openPanel(panelId) {
  $('settings-panel').classList.remove('open');
  $('notif-panel').classList.remove('open');
  $(panelId).classList.add('open');
  openBackdrop();
}

function closePanel(panelId) {
  $(panelId).classList.remove('open');
  closeBackdrop();
}

/* ──────────────────────────────────────────────
   BACKDROP + KEYBOARD CLOSE
────────────────────────────────────────────── */

backdrop.addEventListener('click', closeAll);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAll();
});

// Close avatar dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!avatarDropdown.contains(e.target) && e.target !== $('avatar-btn')) {
    avatarDropdown.classList.remove('open');
  }
});
