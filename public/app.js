const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = 'login.html';
} else {
    const initials = user.username.charAt(0).toUpperCase();
    document.getElementById('userAvatar').textContent = initials;
}

const notesContainer = document.getElementById('notesContainer');
const addMainBtn = document.getElementById('addNoteBtn');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');

const navNotes = document.getElementById('navNotes');
const navFolders = document.getElementById('navFolders');
const navCollabs = document.getElementById('navCollabs'); 
const navTags = document.getElementById('navTags');
const navActivities = document.getElementById('navActivities');

const noteModal = document.getElementById('noteModal');
const noteForm = document.getElementById('noteForm');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');
const noteFolderDropdown = document.getElementById('noteFolder');

const folderModal = document.getElementById('folderModal');
const folderForm = document.getElementById('folderForm');
const cancelFolderBtn = document.getElementById('cancelFolderBtn');

const collabModal = document.getElementById('collabModal'); 
const collabForm = document.getElementById('collabForm'); 
const cancelCollabBtn = document.getElementById('cancelCollabBtn'); 

const tagModal = document.getElementById('tagModal');
const tagForm = document.getElementById('tagForm');
const cancelTagBtn = document.getElementById('cancelTagBtn');

let allNotes = [];
let allFolders = [];
let allCollabs = []; 
let allTags = [];
let allActivities = [];

let currentView = 'notes';
let editingNoteId = null;
let editingFolderId = null;
let editingTagId = null;
let editingCollabId = null;

let noteCurrentPage = 1;
let noteTotalPages = 1;

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `memoora-toast toast-${type}`;
    toast.innerHTML = type === 'success' ? `✅ ${message}` : `❌ ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

function setActiveNav(activeElement) {
    document.querySelectorAll('.nav-link').forEach(el => { 
        el.classList.remove('active', 'text-gold');
        el.classList.add('text-secondary'); 
        el.style.borderLeft = "none";
    });
    if(activeElement) {
        activeElement.classList.add('active', 'text-gold');
        activeElement.classList.remove('text-secondary');
        activeElement.style.borderLeft = "4px solid #f39c12";
    }

    if (currentView !== 'notes') {
        const pagContainer = document.getElementById('paginationContainer');
        if (pagContainer) pagContainer.innerHTML = '';
    }

const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        if (currentView === 'notes') {
            statusFilter.classList.remove('d-none');
            statusFilter.classList.add('d-md-block');
        } else {
            statusFilter.classList.remove('d-md-block');
            statusFilter.classList.add('d-none');
        }
    }

    const mainAddBtn = document.getElementById('addNoteBtn');
document.getElementById('addNoteBtn').addEventListener('click', () => {
    if (currentView === 'notes') {
        editingNoteId = null;
        noteForm.reset();
        document.querySelector('#noteModal h4').textContent = "Buat Catatan Baru";
        noteModal.style.display = 'flex';
    } else if (currentView === 'folders') {
        editingFolderId = null;
        folderForm.reset();
        const folderTitle = document.getElementById('folderModalTitle') || document.querySelector('#folderModal h4');
        if (folderTitle) folderTitle.textContent = "Buat Folder Baru";
        folderModal.style.display = 'flex';
    } else if (currentView === 'collabs') {
        editingCollabId = null;
        collabForm.reset();
        document.getElementById('collabEmail').readOnly = false;
        document.querySelector('#collabModal h4').textContent = "Undang Kolaborator";
        const submitBtn = document.querySelector('#collabForm button[type="submit"]');
        if(submitBtn) submitBtn.textContent = "Kirim Undangan";
        collabModal.style.display = 'flex';
    } else if (currentView === 'tags') {
        editingTagId = null;
        tagForm.reset();
        document.getElementById('tagModalTitle').textContent = "Buat Tag Baru";
        tagModal.style.display = 'flex';
    }
});

}

async function logActivity(actionName, descriptionText) {
    try {
        await fetch('/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ action: actionName, description: descriptionText })
        });
    } catch (error) { console.error("Gagal mencatat aktivitas", error); }
}

navNotes.addEventListener('click', () => {
    currentView = 'notes';
    setActiveNav(navNotes);
    addMainBtn.textContent = 'Catatan Baru';
    addMainBtn.style.display = 'block';
    searchInput.placeholder = 'Cari catatan...';
    statusFilter.style.display = 'block';
    notesContainer.innerHTML = '<div class="col-12 text-center text-secondary mt-5">Memuat catatan...</div>';
    fetchNotes();
});

navFolders.addEventListener('click', () => {
    currentView = 'folders';
    setActiveNav(navFolders);
    addMainBtn.textContent = 'Folder Baru';
    addMainBtn.style.display = 'block';
    searchInput.placeholder = 'Cari folder...';
    statusFilter.style.display = 'none';
    notesContainer.innerHTML = '<div class="col-12 text-center text-secondary mt-5">Memuat folder...</div>';
    fetchFolders();
});

navCollabs.addEventListener('click', () => {
    currentView = 'collabs';
    setActiveNav(navCollabs);
    addMainBtn.textContent = 'Undang Teman';
    addMainBtn.style.display = 'block';
    searchInput.placeholder = 'Cari email...';
    statusFilter.style.display = 'none';
    notesContainer.innerHTML = '<div class="col-12 text-center text-secondary mt-5">Memuat kolaborator...</div>';
    fetchCollabs();
});

if (navTags) {
    navTags.addEventListener('click', () => {
        currentView = 'tags';
        setActiveNav(navTags);
        addMainBtn.textContent = 'Tag Baru';
        addMainBtn.style.display = 'block'; 
        searchInput.placeholder = 'Cari tag...';
        statusFilter.style.display = 'none';
        notesContainer.innerHTML = '<div class="col-12 text-center text-secondary mt-5">Memuat Tags...</div>';
        fetchTags();
    });
}

if (navActivities) {
    navActivities.addEventListener('click', () => {
        currentView = 'activities';
        setActiveNav(navActivities);
        addMainBtn.style.display = 'none';
        searchInput.placeholder = 'Cari aktivitas...';
        statusFilter.style.display = 'none';
        notesContainer.innerHTML = '<div class="col-12 text-center text-secondary mt-5">Memuat Riwayat Aktivitas...</div>';
        fetchActivities();
    });
}

addMainBtn.addEventListener('click', () => {
    if (currentView === 'notes') {
        editingNoteId = null; 
        noteForm.reset();
        document.querySelector('#noteModal h4').textContent = "Buat Catatan Baru";
        noteModal.style.display = 'flex';
    } else if (currentView === 'folders') {
        editingFolderId = null;
        folderForm.reset();
        document.querySelector('#folderModal h4').textContent = "Buat Folder Baru";
        folderModal.style.display = 'flex';
    } else if (currentView === 'collabs') {
        editingCollabId = null;
        collabForm.reset();
        document.getElementById('collabEmail').readOnly = false;
        document.querySelector('#collabModal h4').textContent = "Undang Kolaborator";
        collabModal.style.display = 'flex';
    } else if (currentView === 'tags') {
    } else if (currentView === 'tags') {
        editingTagId = null;
        tagForm.reset();
        document.getElementById('tagModalTitle').textContent = "Buat Tag Baru";
        tagModal.style.display = 'flex';
    }
});

function jalankanFilter() {
    const kataKunci = searchInput.value.toLowerCase();
    if (currentView === 'notes') {
        fetchNotes(1); 
    } else if (currentView === 'folders') {
        const dataTersaring = allFolders.filter(folder => folder.name.toLowerCase().includes(kataKunci));
        renderFoldersTemplate(dataTersaring);
    } else if (currentView === 'collabs') {
        const dataTersaring = allCollabs.filter(collab => collab.email.toLowerCase().includes(kataKunci));
        renderCollabsTemplate(dataTersaring);
    } else if (currentView === 'tags') {
        const dataTersaring = allTags.filter(tag => tag.name.toLowerCase().includes(kataKunci));
        renderTags(dataTersaring);
    } else if (currentView === 'activities') {
        const dataTersaring = allActivities.filter(act => act.action.toLowerCase().includes(kataKunci) || (act.description && act.description.toLowerCase().includes(kataKunci)));
        renderActivities(dataTersaring);
    }
}

searchInput.addEventListener('input', jalankanFilter);
statusFilter.addEventListener('change', jalankanFilter);

async function fetchFolders() {
    try {
        const response = await fetch('/api/folders', { headers: { 'Authorization': `Bearer ${token}` } });
        const result = await response.json();
        if (result.success) {
            allFolders = result.data;
            updateFolderDropdown(); 
            if (currentView === 'folders') jalankanFilter();
        }
    } catch (error) { console.error("Gagal mengambil folder:", error); }
}

function updateFolderDropdown() {
    noteFolderDropdown.innerHTML = '<option value="">Pilih Folder (Opsional)</option>';
    allFolders.forEach(folder => {
        noteFolderDropdown.innerHTML += `<option value="${folder.id}">${folder.name}</option>`;
    });
}

function renderFoldersTemplate(folders) {
    if (currentView !== 'folders') return;
    notesContainer.innerHTML = '';
    if (folders.length === 0) return notesContainer.innerHTML = `<div class="col-12 text-center mt-5 pt-5"><h1 style="font-size: 4rem; opacity: 0.3;">📁</h1><h5 class="text-gold mt-3">Belum ada folder</h5></div>`;
    
    folders.forEach(folder => {
        const card = document.createElement('div');
        card.className = 'col-md-4 col-sm-6 mb-4';
        card.innerHTML = `
            <div class="card bg-dark border-secondary shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0 text-gold fw-bold">📁 ${folder.name}</h5>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-sm btn-outline-warning edit-folder-btn fw-bold" data-id="${folder.id}" data-name="${folder.name}">Edit</button>
                            <button class="btn btn-sm btn-outline-danger delete-folder-btn fw-bold" data-id="${folder.id}">Hapus</button>
                        </div>
                    </div>
                </div>
            </div>`;
        notesContainer.appendChild(card);
    });
}

async function fetchNotes(page = 1) {
    try {
        const status = statusFilter.value;
        const search = searchInput.value;
        let query = `?page=${page}&limit=6`;
        
        if (status && status !== 'all') query += `&status=${status}`;
        if (search) query += `&search=${search}`;

        const response = await fetch(`/api/notes${query}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const result = await response.json();
        
        if (result.success) {
            allNotes = result.data;
            if (result.pagination) {
                noteCurrentPage = result.pagination.currentPage;
                noteTotalPages = result.pagination.totalPages;
            }
            
            if (currentView === 'notes') {
                renderNotesTemplate(allNotes);
                renderPagination();
            }
        }
    } catch (error) { console.error("Gagal mengambil catatan:", error); }
}

function renderPagination() {
    const pagContainer = document.getElementById('paginationContainer');
    if (!pagContainer) return;

    if (currentView !== 'notes' || noteTotalPages <= 1) {
        pagContainer.innerHTML = '';
        return;
    }

    pagContainer.innerHTML = `
        <button class="btn btn-outline-warning fw-bold" onclick="fetchNotes(${noteCurrentPage - 1})" ${noteCurrentPage === 1 ? 'disabled' : ''}>&lt;</button>
        <span class="btn btn-dark text-warning border-secondary disabled">Hal ${noteCurrentPage} dari ${noteTotalPages}</span>
        <button class="btn btn-outline-warning fw-bold" onclick="fetchNotes(${noteCurrentPage + 1})" ${noteCurrentPage === noteTotalPages ? 'disabled' : ''}>&gt;</button>
    `;
}

function renderNotesTemplate(data) {
    if (currentView !== 'notes') return;
    
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const userName = storedUser ? storedUser.username : 'Bos';

    notesContainer.innerHTML = `
        <div class="col-12 mb-4 animate__animated animate__fadeInDown">
            <h3 class="text-light fw-bold">Halo, <span class="text-gold">${userName}</span>!</h3>
            <p class="text-secondary">Berikut adalah ringkasan Memoora kamu hari ini.</p>
            <hr class="border-secondary">
        </div>
    `;

    if (data.length === 0) {
        notesContainer.innerHTML += `<div class="col-12 text-center text-secondary py-5">Belum ada catatan...</div>`;
    } else {
        data.forEach(note => {
            const isChecked = note.status === 'completed' ? 'checked' : '';
            const titleStyle = note.status === 'completed' ? 'text-decoration-line-through text-secondary' : 'text-light';
            
            let tagBg = 'transparent';
            let tagColor = '#f3ede3';
            let tagText = 'NO TAG';

            if (note.tag && note.tag !== '') {
                tagText = note.tag.toUpperCase();
                const matchingTag = allTags.find(t => t.name.toLowerCase() === note.tag.toLowerCase());
                
                if (matchingTag) {
                    tagColor = matchingTag.color;
                    tagBg = matchingTag.color + '20'; 
                } else {
                    tagColor = '#f39c12'; 
                    tagBg = 'rgba(243, 156, 18, 0.1)';
                }
            }

            const folderTerkait = allFolders.find(f => f.id === note.folderId);
            const namaFolderRender = folderTerkait ? `📁 ${folderTerkait.name}` : 'Tanpa Folder';

            const noteCard = document.createElement('div');
            noteCard.className = 'col-md-4 col-sm-6 mb-4';
            
            noteCard.innerHTML = `
                <div class="card h-100 bg-dark border-secondary shadow-sm">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="d-flex gap-2 align-items-center">
                                <input class="form-check-input note-check fs-5 mt-0" type="checkbox" data-id="${note.id}" ${isChecked}>
                                <h5 class="card-title mb-0 ${titleStyle} fw-bold">${note.title}</h5>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn btn-sm btn-outline-warning edit-note-btn fw-bold" 
                                        data-id="${note.id}" data-title="${note.title}" data-desc="${note.description || ''}"
                                        data-date="${note.dueDate || ''}" data-tag="${note.tag || ''}" data-folder="${note.folderId || ''}">Edit</button>
                                <button class="btn btn-sm btn-outline-danger delete-btn fw-bold" data-id="${note.id}">Hapus</button>
                            </div>
                        </div>
                        <p class="card-text text-secondary flex-grow-1">${note.description || ''}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary">
                            <span class="badge" style="background-color: ${tagBg}; color: ${tagColor}; border: 1px solid ${tagColor};">${tagText}</span>
                            <small class="text-gold fw-bold">${namaFolderRender}</small>
                        </div>
                    </div>
                </div>`;
            notesContainer.appendChild(noteCard);
        });
    }
}

async function fetchCollabs() {
    try {
        const response = await fetch('/api/collabs', { headers: { 'Authorization': `Bearer ${token}` } }); 
        const result = await response.json();
        if (result.success) {
            allCollabs = result.data;
            if (currentView === 'collabs') jalankanFilter(); 
        }
    } catch (error) { console.warn("Peringatan: API Collabs belum siap."); }
}

function renderCollabsTemplate(collabs) {
    if (currentView !== 'collabs') return;
    notesContainer.innerHTML = '';
    if (collabs.length === 0) return notesContainer.innerHTML = `<div class="col-12 text-center mt-5 pt-5"><h1 style="font-size: 4rem; opacity: 0.3;">🤝</h1><h5 class="text-gold mt-3">Belum ada kolaborator</h5></div>`;

    collabs.forEach(collab => {
        const roleBg = collab.role === 'editor' ? 'rgba(198, 77, 49, 0.1)' : 'rgba(30, 144, 255, 0.1)';
        const roleColor = collab.role === 'editor' ? '#c64d31' : '#1e90ff';
        const card = document.createElement('div');
        card.className = 'col-md-3 col-sm-6 mb-4';
        card.innerHTML = `
            <div class="card bg-dark border-secondary shadow-sm h-100">
                <div class="card-body d-flex flex-column align-items-center text-center">
                    <div class="rounded-circle bg-secondary d-flex justify-content-center align-items-center mb-3" style="width: 60px; height: 60px; font-size: 1.5rem;">👤</div>
                    <h6 class="card-title text-light fw-bold mb-1 w-100 text-truncate" title="${collab.email}">${collab.email}</h6>
                    <span class="badge mb-3" style="background-color: ${roleBg}; color: ${roleColor}; border: 1px solid ${roleColor};">${collab.role.toUpperCase()}</span>
                    
                    <div class="w-100 mt-auto d-flex flex-column gap-2">
                        <button class="btn btn-sm btn-outline-warning fw-bold w-100 edit-collab-btn" data-id="${collab.id}" data-email="${collab.email}" data-role="${collab.role}">Edit</button>
                        <button class="btn btn-sm btn-outline-danger fw-bold w-100 delete-collab-btn" data-id="${collab.id}">Cabut Akses</button>
                    </div>
                </div>
            </div>`;
        notesContainer.appendChild(card);
    });
}

async function fetchTags() {
    try {
        const res = await fetch('/api/tags', { headers: { 'Authorization': `Bearer ${token}` } });
        const result = await res.json();
        if (result.success) { 
            allTags = result.data; 
            updateTagDropdown();
            if(currentView === 'tags') renderTags(allTags); 
        }
    } catch (error) { console.error("Gagal load tags", error); }
}
function updateTagDropdown() {
    const noteTagDropdown = document.getElementById('noteTag');
    if (!noteTagDropdown) return;
    
    noteTagDropdown.innerHTML = '<option value="">Tanpa Tag (Opsional)</option>';
    allTags.forEach(tag => {
        noteTagDropdown.innerHTML += `<option value="${tag.name}">${tag.name}</option>`;
    });
}

function renderTags(tags) {
    if (currentView !== 'tags') return;
    notesContainer.innerHTML = '';
    if (tags.length === 0) return notesContainer.innerHTML = `<div class="col-12 text-center mt-5 pt-5"><h1 style="font-size: 4rem; opacity: 0.3;">🏷️</h1><h5 class="text-gold mt-3">Belum ada Tag yang dibuat</h5></div>`;
    
    tags.forEach(tag => {
        const card = document.createElement('div');
        card.className = 'col-md-3 col-sm-6 mb-4';
        card.innerHTML = `
            <div class="card bg-dark border-secondary shadow-sm text-center p-4 h-100">
                <div class="mb-3" style="width: 50px; height: 50px; border-radius: 50%; background-color: ${tag.color}; margin: 0 auto; box-shadow: 0 0 15px ${tag.color}40;"></div>
                <h5 class="text-light fw-bold mb-4">${tag.name}</h5>
                <div class="mt-auto d-flex justify-content-center gap-2">
                    <button class="btn btn-sm btn-outline-warning edit-tag-btn" data-id="${tag.id}" data-name="${tag.name}" data-color="${tag.color}">Edit</button>
                    <button class="btn btn-sm btn-outline-danger delete-tag-btn" data-id="${tag.id}">Hapus</button>
                </div>
            </div>`;
        notesContainer.appendChild(card);
    });
}

async function fetchActivities() {
    try {
        const res = await fetch('/api/activities', { headers: { 'Authorization': `Bearer ${token}` } });
        const result = await res.json();
        if (result.success) { 
            allActivities = result.data; 
            if(currentView === 'activities') renderActivities(allActivities); 
        }
    } catch (error) { console.error("Gagal load aktivitas", error); }
}

function renderActivities(activities) {
    if (currentView !== 'activities') return;
    notesContainer.innerHTML = '';
    if (activities.length === 0) return notesContainer.innerHTML = `<div class="col-12 text-center mt-5 pt-5"><h1 style="font-size: 4rem; opacity: 0.3;">⏱️</h1><h5 class="text-gold mt-3">Belum ada riwayat aktivitas</h5></div>`;
    
    let html = '<div class="col-12"><div class="list-group">';
    activities.forEach(act => {
        const date = new Date(act.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' });
        html += `
            <div class="list-group-item bg-dark border-secondary text-light d-flex justify-content-between align-items-center mb-2 rounded shadow-sm">
                <div>
                    <h6 class="mb-1 text-gold fw-bold">${act.action}</h6>
                    <small class="text-secondary">${act.description || ''}</small>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <span class="badge bg-secondary rounded-pill">${date}</span>
                    <button class="btn btn-sm btn-outline-danger delete-activity-btn" data-id="${act.id}" title="Hapus Aktivitas">Hapus</button>
                </div>
            </div>`;
    });
    html += '</div></div>';
    notesContainer.innerHTML = html;
}

noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = { title: document.getElementById('noteTitle').value, description: document.getElementById('noteDesc').value, dueDate: document.getElementById('noteDate').value, tag: document.getElementById('noteTag').value, folderId: document.getElementById('noteFolder').value || null };
    try {
        const isEditing = editingNoteId !== null;
        const url = isEditing ? `/api/notes/${editingNoteId}` : '/api/notes';
        const method = isEditing ? 'PUT' : 'POST';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
        
        noteModal.style.display = 'none'; noteForm.reset(); editingNoteId = null; fetchNotes(); showToast("Catatan tersimpan!");
        logActivity(isEditing ? 'Update Catatan' : 'Buat Catatan', `Judul: ${data.title}`);
    } catch (error) { console.error("Error:", error); }
});

folderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('folderName').value;
    try {
        const isEditing = editingFolderId !== null;
        const url = isEditing ? `/api/folders/${editingFolderId}` : '/api/folders';
        const method = isEditing ? 'PUT' : 'POST';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ name }) });
        
        folderModal.style.display = 'none'; folderForm.reset(); editingFolderId = null; fetchFolders(); fetchNotes(); showToast("Folder tersimpan!");
        logActivity(isEditing ? 'Update Folder' : 'Buat Folder', `Nama Folder: ${name}`); 
    } catch (error) { console.error("Error folder:", error); }
});

collabForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = { email: document.getElementById('collabEmail').value, role: document.getElementById('collabRole').value };
    try {
        const isEditing = editingCollabId !== null;
        const url = isEditing ? `/api/collabs/${editingCollabId}` : '/api/collabs';
        const method = isEditing ? 'PUT' : 'POST';
        const response = await fetch(url, { method: method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
        const result = await response.json();
        
        if (result.success) {
            showToast(isEditing ? "Role berhasil diperbarui!" : "Berhasil mengundang kolaborator!", "success");
            collabModal.style.display = 'none'; collabForm.reset(); document.getElementById('collabEmail').readOnly = false; editingCollabId = null; fetchCollabs(); 
            logActivity(isEditing ? 'Update Kolaborator' : 'Undang Kolaborator', `Akses untuk: ${data.email} (${data.role})`);
        } else { showToast(result.message, "error"); }
    } catch (error) { showToast("Terjadi kesalahan koneksi ke server.", "error"); }
});

if(tagForm) {
    tagForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = { name: document.getElementById('tagName').value, color: document.getElementById('tagColor').value };
        const isEditing = editingTagId !== null;
        const url = isEditing ? `/api/tags/${editingTagId}` : '/api/tags';
        const method = isEditing ? 'PUT' : 'POST';
        try {
            await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
            tagModal.style.display = 'none'; tagForm.reset(); fetchTags(); showToast("Tag berhasil disimpan!", "success");
            logActivity(isEditing ? 'Update Tag' : 'Buat Tag', `Nama Tag: ${data.name}`);
        } catch (error) { showToast("Gagal menyimpan tag", "error"); }
    });
}

cancelNoteBtn.addEventListener('click', () => { noteModal.style.display = 'none'; noteForm.reset(); editingNoteId = null; });
cancelFolderBtn.addEventListener('click', () => { folderModal.style.display = 'none'; folderForm.reset(); editingFolderId = null; });
cancelCollabBtn.addEventListener('click', () => { collabModal.style.display = 'none'; collabForm.reset(); document.getElementById('collabEmail').readOnly = false; editingCollabId = null; });
if(cancelTagBtn) cancelTagBtn.addEventListener('click', () => { tagModal.style.display = 'none'; tagForm.reset(); });


notesContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        if (confirm("Hapus catatan ini?")) { 
            await fetch(`/api/notes/${e.target.getAttribute('data-id')}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); fetchNotes(); 
            logActivity('Hapus Catatan', 'Sebuah catatan telah dihapus');
        }
    }
    if (e.target.classList.contains('note-check')) {
        const statusBaru = e.target.checked ? 'completed' : 'pending';
        await fetch(`/api/notes/${e.target.getAttribute('data-id')}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status: statusBaru }) });
        fetchNotes();
        logActivity('Ubah Status Catatan', `Status diubah menjadi: ${statusBaru}`);
    }
    if (e.target.classList.contains('edit-note-btn')) {
        editingNoteId = e.target.getAttribute('data-id'); document.getElementById('noteTitle').value = e.target.getAttribute('data-title'); document.getElementById('noteDesc').value = e.target.getAttribute('data-desc'); document.getElementById('noteDate').value = e.target.getAttribute('data-date'); document.getElementById('noteTag').value = e.target.getAttribute('data-tag'); document.getElementById('noteFolder').value = e.target.getAttribute('data-folder'); document.querySelector('#noteModal h4').textContent = "Edit Catatan"; noteModal.style.display = 'flex';
    }

    if (e.target.classList.contains('delete-folder-btn')) {
        if (confirm("Hapus folder ini?")) {
            await fetch(`/api/folders/${e.target.getAttribute('data-id')}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); 
            fetchFolders(); fetchNotes(); showToast('Folder berhasil dihapus', 'success');
            logActivity('Hapus Folder', 'Sebuah folder dihapus');
        }
    }
    if (e.target.classList.contains('edit-folder-btn')) {
        editingFolderId = e.target.getAttribute('data-id'); document.getElementById('folderName').value = e.target.getAttribute('data-name'); const folderTitle = document.getElementById('folderModalTitle') || document.querySelector('#folderModal h4'); if (folderTitle) folderTitle.textContent = "Edit Folder"; folderModal.style.display = 'flex';
    }
    
    if (e.target.classList.contains('edit-collab-btn')) {
        editingCollabId = e.target.getAttribute('data-id'); 
        
        const emailInput = document.getElementById('collabEmail'); 
        emailInput.value = e.target.getAttribute('data-email'); 
        emailInput.readOnly = true;
        
        document.getElementById('collabRole').value = e.target.getAttribute('data-role'); 
        
        document.querySelector('#collabModal h4').textContent = "Edit Role Kolaborator"; 
        
        const submitBtn = document.querySelector('#collabForm button[type="submit"]');
        if(submitBtn) submitBtn.textContent = "Simpan Perubahan";
        
        collabModal.style.display = 'flex';
    }
    if (e.target.classList.contains('delete-collab-btn')) {
        if (confirm("Cabut akses kolaborator ini?")) { 
            await fetch(`/api/collabs/${e.target.getAttribute('data-id')}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); fetchCollabs(); 
            logActivity('Cabut Akses', 'Akses kolaborator dicabut'); 
        }
    }
    if (e.target.classList.contains('delete-tag-btn')) {
        if (confirm("Yakin ingin menghapus Tag ini?")) { 
            await fetch(`/api/tags/${e.target.getAttribute('data-id')}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); fetchTags(); 
            logActivity('Hapus Tag', 'Sebuah tag dihapus');
        }
    }
    if (e.target.classList.contains('edit-tag-btn')) {
        editingTagId = e.target.getAttribute('data-id'); document.getElementById('tagName').value = e.target.getAttribute('data-name'); document.getElementById('tagColor').value = e.target.getAttribute('data-color'); document.getElementById('tagModalTitle').textContent = "Edit Tag"; tagModal.style.display = 'flex';
    }

    if (e.target.classList.contains('delete-activity-btn')) {
        if (confirm("Hapus riwayat aktivitas ini?")) {
            try {
                await fetch(`/api/activities/${e.target.getAttribute('data-id')}`, { 
                    method: 'DELETE', 
                    headers: { 'Authorization': `Bearer ${token}` } 
                });
                fetchActivities();
                showToast("Aktivitas dihapus", "success");
            } catch (error) {
                showToast("Gagal menghapus aktivitas", "error");
            }
        }
    }
});

function showCustomConfirm(title, text, requireInput = false) {
    return new Promise((resolve) => {
        const modal = document.getElementById('customConfirmModal');
        const inputField = document.getElementById('confirmInput');
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmText').textContent = text;
        if(requireInput) { inputField.style.display = 'block'; inputField.value = ''; } else { inputField.style.display = 'none'; }
        modal.style.display = 'flex';
        document.getElementById('btnConfirmOk').onclick = () => {
            if(requireInput) {
                if(inputField.value === 'HAPUS') { modal.style.display = 'none'; resolve(true); } else { showToast('Gagal: Anda harus mengetik HAPUS huruf besar semua!', 'error'); }
            } else { modal.style.display = 'none'; resolve(true); }
        };
        document.getElementById('btnConfirmCancel').onclick = () => { modal.style.display = 'none'; resolve(false); };
    });
}

const userAvatar = document.getElementById('userAvatar');
const settingsModal = document.getElementById('settingsModal');
const settingsForm = document.getElementById('settingsForm');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');

if (userAvatar && settingsModal) {
    userAvatar.addEventListener('click', () => {
        document.getElementById('editUsername').value = user.username;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editPassword').value = ''; 
        settingsModal.style.display = 'flex';
    });
}
if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => settingsModal.style.display = 'none');

if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/users/profile', {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: user.id, username: document.getElementById('editUsername').value, email: document.getElementById('editEmail').value, password: document.getElementById('editPassword').value })
            });
            const result = await response.json();
            if (result.success) {
                showToast("Profil diperbarui! Silakan login kembali.", "success");
                setTimeout(() => { localStorage.clear(); window.location.href = 'login.html'; }, 1500);
            } else { showToast(result.message, "error"); }
        } catch (error) { showToast("Terjadi kesalahan server saat update.", "error"); }
    });
}

document.getElementById('logoutSettingsBtn').addEventListener('click', async () => {
    settingsModal.style.display = 'none'; 
    if (await showCustomConfirm('Logout', 'Yakin ingin keluar dari sesi Memoora saat ini?')) {
        localStorage.clear(); window.location.href = 'login.html';
    } else { settingsModal.style.display = 'flex'; }
});

document.getElementById('deleteAccountSettingsBtn').addEventListener('click', async () => {
    settingsModal.style.display = 'none'; 
    if (await showCustomConfirm('Hapus Akun', 'Menghapus akun akan memusnahkan seluruh catatan dan folder Anda secara permanen. Lanjutkan?')) {
        if (await showCustomConfirm('Konfirmasi Akhir', 'Ketik kata HAPUS di bawah ini untuk memusnahkan akun:', true)) {
            try {
                const response = await fetch(`/api/users/${user.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                const result = await response.json();
                if (result.success) { showToast("Akun berhasil dimusnahkan. Selamat tinggal!", "success"); setTimeout(() => { localStorage.clear(); window.location.href = 'login.html'; }, 1500); }
            } catch (error) { showToast("Gagal menghapus akun karena masalah server.", "error"); }
        } else { settingsModal.style.display = 'flex'; }
    } else { settingsModal.style.display = 'flex'; }
});

async function startApp() {
    await fetchFolders(); 
    await fetchNotes();   
    await fetchCollabs();
    await fetchTags();
}

document.getElementById('menu-toggle').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('wrapper').classList.toggle('toggled');
});

startApp();