const notesContainer = document.getElementById('notesContainer');
const addMainBtn = document.getElementById('addNoteBtn');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');

const navNotes = document.getElementById('navNotes');
const navFolders = document.getElementById('navFolders');

const noteModal = document.getElementById('noteModal');
const noteForm = document.getElementById('noteForm');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');

const folderModal = document.getElementById('folderModal');
const folderForm = document.getElementById('folderForm');
const cancelFolderBtn = document.getElementById('cancelFolderBtn');

const noteFolderDropdown = document.getElementById('noteFolder');

let allNotes = [];
let allFolders = [];
let currentView = 'notes';
let editingNoteId = null;

navNotes.addEventListener('click', () => {
    currentView = 'notes';
    navNotes.classList.add('active', 'text-gold');
    navNotes.classList.remove('text-secondary');
    navFolders.classList.remove('active', 'text-gold');
    navFolders.classList.add('text-secondary');
    
    addMainBtn.textContent = 'Catatan Baru';
    searchInput.placeholder = 'Cari catatan...';
    statusFilter.style.display = 'block';
    
    notesContainer.innerHTML = '<div class="col-12 text-center text-secondary mt-5">Memuat catatan...</div>';
    fetchNotes();
});

navFolders.addEventListener('click', () => {
    currentView = 'folders';
    navFolders.classList.add('active', 'text-gold');
    navFolders.classList.remove('text-secondary');
    navNotes.classList.remove('active', 'text-gold');
    navNotes.classList.add('text-secondary');
    
    addMainBtn.textContent = 'Folder Baru';
    searchInput.placeholder = 'Cari folder...';
    statusFilter.style.display = 'none';
    
    notesContainer.innerHTML = '<div class="col-12 text-center text-secondary mt-5">Memuat folder...</div>';
    fetchFolders();
});

addMainBtn.addEventListener('click', () => {
    if (currentView === 'notes') {
        editingNoteId = null; 
        noteForm.reset();
        document.querySelector('#noteModal h4').textContent = "Buat Catatan Baru";
        noteModal.style.display = 'flex';
    } else if (currentView === 'folders') {
        folderModal.style.display = 'flex';
    }
});

function jalankanFilter() {
    const kataKunci = searchInput.value.toLowerCase();
    if (currentView === 'notes') {
        const statusPilihan = statusFilter.value;
        const dataTersaring = allNotes.filter(note => {
            const cocokKata = note.title.toLowerCase().includes(kataKunci) || (note.description && note.description.toLowerCase().includes(kataKunci));
            const cocokStatus = statusPilihan === 'all' || note.status === statusPilihan;
            return cocokKata && cocokStatus;
        });
        renderNotesTemplate(dataTersaring);
    } else if (currentView === 'folders') {
        const dataTersaring = allFolders.filter(folder => folder.name.toLowerCase().includes(kataKunci));
        renderFoldersTemplate(dataTersaring);
    }
}

searchInput.addEventListener('input', jalankanFilter);
statusFilter.addEventListener('change', jalankanFilter);

async function fetchFolders() {
    try {
        const response = await fetch('/api/folders');
        const result = await response.json();
        if (result.success) {
            allFolders = result.data;
            updateFolderDropdown();
            if (currentView === 'folders') jalankanFilter();
        }
    } catch (error) {
        console.error("Gagal mengambil folder:", error);
    }
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
    if (folders.length === 0) {
        notesContainer.innerHTML = `<div class="col-12 text-center mt-5 pt-5"><h1 style="font-size: 4rem; opacity: 0.3;">📁</h1><h5 class="text-gold mt-3">Belum ada folder</h5></div>`;
        return;
    }
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

folderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('folderName').value;
    await fetch('/api/folders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    folderModal.style.display = 'none';
    folderForm.reset();
    fetchFolders();
});

cancelFolderBtn.addEventListener('click', () => { folderModal.style.display = 'none'; });

async function fetchNotes() {
    try {
        const response = await fetch('/api/notes');
        const result = await response.json();
        if (result.success) {
            allNotes = result.data;
            jalankanFilter();
        }
    } catch (error) {
        console.error("Gagal mengambil catatan:", error);
    }
}

function renderNotesTemplate(data) {
    if (currentView !== 'notes') return;
    notesContainer.innerHTML = '';
    if (data.length === 0) {
        notesContainer.innerHTML = `<div class="col-12 text-center mt-5 pt-5"><h1 style="font-size: 4rem; opacity: 0.3;">📝</h1><h5 class="text-gold mt-3">Belum ada catatan</h5></div>`;
        return;
    }

    data.forEach(note => {
        const isChecked = note.status === 'completed' ? 'checked' : '';
        const titleStyle = note.status === 'completed' ? 'text-decoration-line-through text-secondary' : 'text-light';

        let tagBg, tagColor;
        switch(note.tag?.toLowerCase()) {
            case 'urgent': tagBg = 'rgba(198, 77, 49, 0.1)'; tagColor = '#c64d31'; break;
            case 'normal': tagBg = 'rgba(46, 213, 115, 0.1)'; tagColor = '#2ed573'; break;
            case 'review': tagBg = 'rgba(30, 144, 255, 0.1)'; tagColor = '#1e90ff'; break;
            case 'project': tagBg = 'rgba(243, 156, 18, 0.1)'; tagColor = '#f39c12'; break;
            default: tagBg = 'transparent'; tagColor = '#f3ede3';
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
                                    data-date="${note.dueDate || ''}" data-tag="${note.tag}" data-folder="${note.folderId || ''}">Edit</button>
                            <button class="btn btn-sm btn-outline-danger delete-btn fw-bold" data-id="${note.id}">Hapus</button>
                        </div>
                    </div>
                    <p class="card-text text-secondary flex-grow-1">${note.description || ''}</p>
                    
                    <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary">
                        <span class="badge" style="background-color: ${tagBg}; color: ${tagColor}; border: 1px solid ${tagColor};">${note.tag ? note.tag.toUpperCase() : 'NO TAG'}</span>
                        <small class="text-gold fw-bold">${namaFolderRender}</small>
                    </div>
                </div>
            </div>`;
        notesContainer.appendChild(noteCard);
    });
}

noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        title: document.getElementById('noteTitle').value,
        description: document.getElementById('noteDesc').value,
        dueDate: document.getElementById('noteDate').value,
        tag: document.getElementById('noteTag').value,
        folderId: document.getElementById('noteFolder').value || null
    };

    try {
        const url = editingNoteId ? `/api/notes/${editingNoteId}` : '/api/notes';
        const method = editingNoteId ? 'PUT' : 'POST';
        await fetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        noteModal.style.display = 'none';
        noteForm.reset();
        editingNoteId = null;
        fetchNotes();
    } catch (error) { console.error("Error:", error); }
});

cancelNoteBtn.addEventListener('click', () => { noteModal.style.display = 'none'; noteForm.reset(); editingNoteId = null; });

notesContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.getAttribute('data-id');
        if (confirm("Hapus catatan ini?")) { await fetch(`/api/notes/${id}`, { method: 'DELETE' }); fetchNotes(); }
    }
    if (e.target.classList.contains('note-check')) {
        const id = e.target.getAttribute('data-id');
        await fetch(`/api/notes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: e.target.checked ? 'completed' : 'pending' }) });
        fetchNotes();
    }
    if (e.target.classList.contains('edit-note-btn')) {
        editingNoteId = e.target.getAttribute('data-id');
        document.getElementById('noteTitle').value = e.target.getAttribute('data-title');
        document.getElementById('noteDesc').value = e.target.getAttribute('data-desc');
        document.getElementById('noteDate').value = e.target.getAttribute('data-date');
        document.getElementById('noteTag').value = e.target.getAttribute('data-tag');
        document.getElementById('noteFolder').value = e.target.getAttribute('data-folder');
        document.querySelector('#noteModal h4').textContent = "Edit Catatan";
        noteModal.style.display = 'flex';
    }
    if (e.target.classList.contains('delete-folder-btn')) {
        const id = e.target.getAttribute('data-id');
        if (confirm("Hapus folder ini?")) { await fetch(`/api/folders/${id}`, { method: 'DELETE' }); fetchFolders(); fetchNotes(); }
    }
    if (e.target.classList.contains('edit-folder-btn')) {
        const id = e.target.getAttribute('data-id');
        const namaBaru = prompt("Ubah nama folder:", e.target.getAttribute('data-name'));
        if (namaBaru && namaBaru.trim()) { await fetch(`/api/folders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: namaBaru }) }); fetchFolders(); fetchNotes(); }
    }
});

async function startApp() {
    await fetchFolders();
    await fetchNotes();
}
startApp();