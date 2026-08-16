function toggleAcc(header) {
  const body = header && header.nextElementSibling;
  const span = header && header.querySelector('span');
  if (!body || !span) return;

  const isOpen = body.classList.contains('open');
  document.querySelectorAll('.accordion-body').forEach(b => b.classList.remove('open'));
  document.querySelectorAll('.accordion-header span').forEach(s => s.textContent = '+');

  if (!isOpen) {
    body.classList.add('open');
    span.textContent = '−';
  }
}

function initEmergencyAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    if (header.dataset.bound === 'true') return;

    header.tabIndex = 0;
    header.onclick = function () {
      toggleAcc(header);
    };
    header.onkeydown = function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleAcc(header);
      }
    };
    header.dataset.bound = 'true';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEmergencyAccordions);
} else {
  initEmergencyAccordions();
}

async function loadContacts() {
  const user = getUser();
  const list = document.getElementById('contacts-list');
  if (!user || user.role !== 'patient') return;
  try {
    const contacts = await apiFetch('/emergency-contacts/mine');
    if (contacts.length === 0) {
      list.innerHTML = '<p style="color:#64748b;">No emergency contacts saved yet. Add some from your dashboard.</p>';
      return;
    }
    list.innerHTML = contacts.map(c => `
      <div class="doctor-card">
        <div class="info">
          <h4>${c.name} <span style="font-weight:400; color:#64748b;">(${c.relation || 'Contact'})</span></h4>
          <p>${c.phone}</p>
        </div>
        <a href="tel:${c.phone}" class="btn btn-small">Call</a>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = '';
  }
}

loadContacts();