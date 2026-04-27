// ==========================================
// 1. TANGKAP SEMUA ELEMEN HTML
// ==========================================
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

// State Management (Penyimpan Data Sementara)
let allNotes = []; 
let allFolders = []; // Wadah baru untuk menyimpan memori folder
let currentView = 'notes'; 

// ==========================================
// 2. LOGIKA NAVIGASI (SWITCH TABS)
// ==========================================
navNotes.addEventListener('click', () => {
    currentView = 'notes';
    navNotes.classList.add('active');
    navFolders.classList.remove('active');
    
    addMainBtn.textContent = 'Catatan Baru'; 
    searchInput.style.display = 'block';      
    searchInput.placeholder = 'Cari catatan...'; // Kembalikan teks
    statusFilter.style.display = 'block';     // Munculkan filter status
    
    fetchNotes(); 
});

navFolders.addEventListener('click', () => {
    currentView = 'folders';
    navFolders.classList.add('active');
    navNotes.classList.remove('active');
    
    addMainBtn.textContent = 'Folder Baru'; 
    searchInput.style.display = 'block';      // TETAP MUNCULKAN PENCARIAN
    searchInput.placeholder = 'Cari folder...'; // Ganti teks pencarian
    statusFilter.style.display = 'none';      // Sembunyikan filternya saja
    
    fetchFolders(); 
});

addMainBtn.addEventListener('click', () => {
    if (currentView === 'notes') {
        noteModal.style.display = 'flex';
    } else if (currentView === 'folders') {
        folderModal.style.display = 'flex';
    }
});

// ==========================================
// 3. FITUR PENCARIAN & FILTER (GABUNGAN)
// ==========================================
function jalankanFilter() {
    const kataKunci = searchInput.value.toLowerCase();

    if (currentView === 'notes') {
        const statusPilihan = statusFilter.value;
        const dataTersaring = allNotes.filter(note => {
            const cocokKata = note.title.toLowerCase().includes(kataKunci) || note.description.toLowerCase().includes(kataKunci);
            const cocokStatus = statusPilihan === 'all' || note.status === statusPilihan;
            return cocokKata && cocokStatus;
        });
        renderNotes(dataTersaring);
    } 
    else if (currentView === 'folders') {
        // Logika pencarian khusus untuk folder
        const dataTersaring = allFolders.filter(folder => {
            return folder.name.toLowerCase().includes(kataKunci);
        });
        renderFolders(dataTersaring);
    }
}

// Pasang sensor pencarian
searchInput.addEventListener('input', jalankanFilter);
statusFilter.addEventListener('change', jalankanFilter);

// ==========================================
// 4. FITUR NOTES (TUGAS ANDA)
// ==========================================
async function fetchNotes() {
    try {
        const response = await fetch('/api/notes');
        const result = await response.json();
        if (result.success) {
            allNotes = result.data;
            jalankanFilter(); 
        }
    } catch (error) {
        console.error("Gagal mengambil data notes:", error);
    }
}

function renderNotes(data) {
    if (currentView !== 'notes') return; 
    notesContainer.innerHTML = ''; 

    data.forEach(note => {
        const isChecked = note.status === 'completed' ? 'checked' : '';
        const titleStyle = note.status === 'completed' ? 'text-decoration: line-through; color: gray;' : 'color: var(--text-main);';

        // ==========================================
        // LOGIKA WARNA LABEL (DIKEMBALIKAN)
        // ==========================================
        let tagBg, tagColor;
        switch(note.tag.toLowerCase()) {
            case 'urgent':
                tagBg = 'rgba(198, 77, 49, 0.1)'; // Pakai warna aksen primer Anda
                tagColor = 'var(--accent-primary)'; 
                break;
            case 'normal':
                tagBg = 'rgba(46, 213, 115, 0.1)'; // Hijau
                tagColor = '#2ed573';              
                break;
            case 'review':
                tagBg = 'rgba(30, 144, 255, 0.1)'; // Biru
                tagColor = '#1e90ff';              
                break;
            case 'project':
                tagBg = 'rgba(243, 156, 18, 0.1)'; // Oranye
                tagColor = '#f39c12';
                break;
            default:
                tagBg = 'transparent';  
                tagColor = 'var(--text-main)';              
        }

        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.innerHTML = `
            <div class="note-header" style="display: flex; justify-content: space-between; align-items: start;">
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="checkbox" class="note-check" data-id="${note.id}" ${isChecked}>
                    <h3 style="${titleStyle}; margin: 0; transition: all 0.3s;">${note.title}</h3>
                </div>
                <button class="delete-btn" data-id="${note.id}">✕</button>
            </div>
            <p>${note.description}</p>
            <div class="note-footer" style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); margin-top: 15px;">
                <span style="background: ${tagBg}; color: ${tagColor}; border: 1px solid ${tagColor}; padding: 4px 10px; border-radius: 8px; font-weight: bold;">${note.tag.toUpperCase()}</span>
                <span>🗓️ ${note.dueDate}</span>
            </div>
        `;
        notesContainer.appendChild(noteCard);
    });
}

// Tambah Note
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const dataBaru = {
        title: document.getElementById('noteTitle').value,
        description: document.getElementById('noteDesc').value,
        dueDate: document.getElementById('noteDate').value,
        tag: document.getElementById('noteTag').value
    };

    try {
        const response = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataBaru)
        });
        if (response.ok) {
            noteModal.style.display = 'none'; 
            noteForm.reset(); 
            fetchNotes(); 
        }
    } catch (error) {
        console.error("Gagal menyimpan catatan:", error);
    }
});

cancelNoteBtn.addEventListener('click', () => {
    noteModal.style.display = 'none';
    noteForm.reset();
});

// ==========================================
// 5. FITUR FOLDERS (TUGAS FADIL)
// ==========================================
async function fetchFolders() {
    try {
        const response = await fetch('/api/folders');
        const result = await response.json();
        if (result.success) {
            allFolders = result.data; // Simpan memori folder
            jalankanFilter(); // Tampilkan lewat filter
        }
    } catch (error) {
        console.error("Gagal mengambil data folder:", error);
    }
}

function renderFolders(folders) {
    if (currentView !== 'folders') return; 
    notesContainer.innerHTML = ''; 

    folders.forEach(folder => {
        const card = document.createElement('div');
        card.className = 'note-card'; 
        card.innerHTML = `
            <div class="note-header" style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="color: var(--accent-primary); margin: 0; font-size: 1.2rem;">📁 ${folder.name}</h3>
                <button class="delete-folder-btn" data-id="${folder.id}" style="color: var(--accent-primary); background: transparent; border: none; font-size: 1.2rem; cursor: pointer;">✕</button>
            </div>
            <p style="margin-top: 15px; font-size: 0.9rem; color: var(--text-muted);">
                Dibuat: ${new Date(folder.createdAt).toLocaleDateString('id-ID')}
            </p>
        `;
        notesContainer.appendChild(card);
    });
}

// Tambah Folder
folderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('folderName').value;
    try {
        const response = await fetch('/api/folders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        if (response.ok) {
            folderModal.style.display = 'none';
            folderForm.reset();
            fetchFolders();
        }
    } catch (error) {
        console.error("Gagal menyimpan folder:", error);
    }
});

cancelFolderBtn.addEventListener('click', () => {
    folderModal.style.display = 'none';
    folderForm.reset();
});

// ==========================================
// 6. GLOBAL EVENT LISTENER (DELETE & UPDATE)
// ==========================================
notesContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.getAttribute('data-id');
        if (confirm("Yakin ingin menghapus catatan ini?")) {
            await fetch(`/api/notes/${id}`, { method: 'DELETE' });
            fetchNotes();
        }
    }

    if (e.target.classList.contains('note-check')) {
        const id = e.target.getAttribute('data-id');
        const statusBaru = e.target.checked ? 'completed' : 'pending';
        await fetch(`/api/notes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: statusBaru })
        });
        fetchNotes();
    }

    if (e.target.classList.contains('delete-folder-btn')) {
        const id = e.target.getAttribute('data-id');
        if (confirm("Yakin ingin menghapus folder ini?")) {
            await fetch(`/api/folders/${id}`, { method: 'DELETE' });
            fetchFolders();
        }
    }
});

// Mulai aplikasi
fetchNotes();