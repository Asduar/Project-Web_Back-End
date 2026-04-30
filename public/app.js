// ==========================================
// 0. CEK OTENTIKASI & TAMPILAN PROFIL
// ==========================================
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = 'login.html';
} else {
    // Membuat inisial dari username (Contoh: Yehezkiel -> Y)
    const initials = user.username.charAt(0).toUpperCase();
    document.getElementById('userAvatar').textContent = initials;
}

// ==========================================
// 1. TANGKAP SEMUA ELEMEN HTML
// ==========================================
const notesContainer = document.getElementById('notesContainer');
const addMainBtn = document.getElementById('addNoteBtn');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');

const navNotes = document.getElementById('navNotes');
const navFolders = document.getElementById('navFolders');
const navCollabs = document.getElementById('navCollabs'); 

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

// ==========================================
// 2. STATE MANAGEMENT
// ==========================================
let allNotes = [];
let allFolders = [];
let allCollabs = []; 
let currentView = 'notes';
let editingNoteId = null;

// ==========================================
// 3. LOGIKA NAVIGASI
// ==========================================
navNotes.addEventListener('click', () => {
    currentView = 'notes';
    navNotes.classList.add('active', 'text-gold');
    navNotes.classList.remove('text-secondary');
    navFolders.classList.remove('active', 'text-gold');
    navFolders.classList.add('text-secondary');
    navCollabs.classList.remove('active', 'text-gold');
    navCollabs.classList.add('text-secondary');
    
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
    navCollabs.classList.remove('active', 'text-gold');
    navCollabs.classList.add('text-secondary');
    
    addMainBtn.textContent = 'Folder Baru';
    searchInput.placeholder = 'Cari folder...';
    statusFilter.style.display = 'none';
    
    notesContainer.innerHTML = '<div class="col-12 text-center text-secondary mt-5">Memuat folder...</div>';
    fetchFolders();
});

navCollabs.addEventListener('click', () => {
    currentView = 'collabs';
    navCollabs.classList.add('active', 'text-gold');
    navCollabs.classList.remove('text-secondary');
    navNotes.classList.remove('active', 'text-gold');
    navNotes.classList.add('text-secondary');
    navFolders.classList.remove('active', 'text-gold');
    navFolders.classList.add('text-secondary');
    
    addMainBtn.textContent = 'Undang Teman';
    searchInput.placeholder = 'Cari email...';
    statusFilter.style.display = 'none';
    
    notesContainer.innerHTML = '<div class="col-12 text-center text-secondary mt-5">Memuat kolaborator...</div>';
    fetchCollabs();
});

addMainBtn.addEventListener('click', () => {
    if (currentView === 'notes') {
        editingNoteId = null; 
        noteForm.reset();
        document.querySelector('#noteModal h4').textContent = "Buat Catatan Baru";
        noteModal.style.display = 'flex';
    } else if (currentView === 'folders') {
        folderModal.style.display = 'flex';
    } else if (currentView === 'collabs') {
        collabModal.style.display = 'flex';
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
    } else if (currentView === 'collabs') {
        const dataTersaring = allCollabs.filter(collab => collab.email.toLowerCase().includes(kataKunci));
        renderCollabsTemplate(dataTersaring);
    }
}

searchInput.addEventListener('input', jalankanFilter);
statusFilter.addEventListener('change', jalankanFilter);

// ==========================================
// 4. FITUR FOLDERS (FADIL)
// ==========================================
async function fetchFolders() {
    try {
        const response = await fetch('/api/folders', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
            allFolders = result.data;
            updateFolderDropdown(); 
            if (currentView === 'folders') jalankanFilter();
        }
    } catch (error) { console.error("Gagal mengambil folder:", error); }
}

function updateFolderDropdown() {
    noteFolderDropdown.innerHTML = '<option value="">-- Pilih Folder (Opsional) --</option>';
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
    await fetch('/api/folders', { 
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }, 
        body: JSON.stringify({ name }) 
    });
    folderModal.style.display = 'none';
    folderForm.reset();
    fetchFolders();
});

cancelFolderBtn.addEventListener('click', () => { folderModal.style.display = 'none'; folderForm.reset(); });

// ==========================================
// 5. FITUR NOTES (AULIA)
// ==========================================
async function fetchNotes() {
    try {
        const response = await fetch('/api/notes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
            allNotes = result.data;
            if (currentView === 'notes') jalankanFilter();
        }
    } catch (error) { console.error("Gagal mengambil catatan:", error); }
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
        await fetch(url, { 
            method: method, 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }, 
            body: JSON.stringify(data) 
        });
        noteModal.style.display = 'none';
        noteForm.reset();
        editingNoteId = null;
        fetchNotes();
    } catch (error) { console.error("Error:", error); }
});

cancelNoteBtn.addEventListener('click', () => { noteModal.style.display = 'none'; noteForm.reset(); editingNoteId = null; });

// ==========================================
// 6. FITUR COLLABS (KASIH)
// ==========================================
async function fetchCollabs() {
    try {
        const response = await fetch('/api/collabs', {
            headers: { 'Authorization': `Bearer ${token}` }
        }); 
        const result = await response.json();
        if (result.success) {
            allCollabs = result.data;
            if (currentView === 'collabs') jalankanFilter(); 
        } else {
            if (currentView === 'collabs') {
                notesContainer.innerHTML = `<div class="col-12 text-center text-danger mt-5">Gagal memuat: ${result.message}</div>`;
            }
        }
    } catch (error) {
        if (currentView === 'collabs') {
            notesContainer.innerHTML = '<div class="col-12 text-center text-danger mt-5">Koneksi ke server API Collabs gagal.</div>';
        } else {
            console.warn("Peringatan: API Collabs belum siap.");
        }
    }
}

function renderCollabsTemplate(collabs) {
    if (currentView !== 'collabs') return;
    notesContainer.innerHTML = '';

    if (collabs.length === 0) {
        notesContainer.innerHTML = `
            <div class="col-12 text-center mt-5 pt-5">
                <h1 style="font-size: 4rem; opacity: 0.3;">🤝</h1>
                <h5 class="text-gold mt-3">Belum ada kolaborator</h5>
                <p class="text-secondary">Klik tombol "Undang Teman" di pojok kanan atas.</p>
            </div>`;
        return;
    }

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
                    <button class="btn btn-sm btn-outline-danger fw-bold w-100 mt-auto delete-collab-btn" data-id="${collab.id}">Cabut Akses</button>
                </div>
            </div>`;
        notesContainer.appendChild(card);
    });
}

collabForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        email: document.getElementById('collabEmail').value,
        role: document.getElementById('collabRole').value
    };

    try {
        const response = await fetch('/api/collabs', { 
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }, 
            body: JSON.stringify(data) 
        });

        const result = await response.json();

        if (result.success) {
            // Jika berhasil (Email ditemukan & terdaftar)
            showToast("Berhasil mengundang kolaborator!", "success");
            collabModal.style.display = 'none';
            collabForm.reset();
            fetchCollabs(); 
        } else {
            // Jika gagal (Email tidak ada atau sudah pernah diundang)
            // Pesan ini diambil langsung dari hasil pengecekan di Backend
            showToast(result.message, "error");
        }
    } catch (error) { 
        console.error("Error:", error);
        showToast("Terjadi kesalahan koneksi ke server.", "error");
    }
});

cancelCollabBtn.addEventListener('click', () => { collabModal.style.display = 'none'; collabForm.reset(); });

// ==========================================
// 7. GLOBAL EVENT (Klik Tombol di Kartu)
// ==========================================
notesContainer.addEventListener('click', async (e) => {
    // HAPUS NOTE
    if (e.target.classList.contains('delete-btn')) {
        if (confirm("Hapus catatan ini?")) { 
            await fetch(`/api/notes/${e.target.getAttribute('data-id')}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            }); 
            fetchNotes(); 
        }
    }
    // CHECK/UNCHECK NOTE
    if (e.target.classList.contains('note-check')) {
        await fetch(`/api/notes/${e.target.getAttribute('data-id')}`, { 
            method: 'PUT', 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }, 
            body: JSON.stringify({ status: e.target.checked ? 'completed' : 'pending' }) 
        });
        fetchNotes();
    }
    // EDIT NOTE BUKA MODAL
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
    // HAPUS FOLDER
    if (e.target.classList.contains('delete-folder-btn')) {
        if (confirm("Hapus folder ini?")) { 
            await fetch(`/api/folders/${e.target.getAttribute('data-id')}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            }); 
            fetchFolders(); fetchNotes(); 
        }
    }
    // EDIT FOLDER
    if (e.target.classList.contains('edit-folder-btn')) {
        const namaBaru = prompt("Ubah nama folder:", e.target.getAttribute('data-name'));
        if (namaBaru && namaBaru.trim()) { 
            await fetch(`/api/folders/${e.target.getAttribute('data-id')}`, { 
                method: 'PUT', 
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }, 
                body: JSON.stringify({ name: namaBaru }) 
            }); 
            fetchFolders(); fetchNotes(); 
        }
    }
    
    // LOGIKA HAPUS COLLAB
    if (e.target.classList.contains('delete-collab-btn')) {
        if (confirm("Cabut akses kolaborator ini?")) { 
            await fetch(`/api/collabs/${e.target.getAttribute('data-id')}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` } 
            }); 
            fetchCollabs(); 
        }
    }
});

// ==========================================
// 8. JALANKAN SAAT WEB PERTAMA DIBUKA
// ==========================================
async function startApp() {
    await fetchFolders(); 
    await fetchNotes();   
    await fetchCollabs(); 
}
startApp();

// ==========================================
// 10. LOGIKA MODAL PENGATURAN & CUSTOM NOTIFIKASI
// ==========================================
const userAvatar = document.getElementById('userAvatar');
const settingsModal = document.getElementById('settingsModal');
const settingsForm = document.getElementById('settingsForm');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');

// FUNGSI 1: TOAST NOTIFICATION (Melayang di kanan atas)
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

// FUNGSI 2: MODAL KONFIRMASI CUSTOM (Pengganti popup putih)
function showCustomConfirm(title, text, requireInput = false) {
    return new Promise((resolve) => {
        const modal = document.getElementById('customConfirmModal');
        const inputField = document.getElementById('confirmInput');
        
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmText').textContent = text;
        
        if(requireInput) {
            inputField.style.display = 'block';
            inputField.value = '';
        } else {
            inputField.style.display = 'none';
        }

        modal.style.display = 'flex';

        // Jika tombol YA ditekan
        document.getElementById('btnConfirmOk').onclick = () => {
            if(requireInput) {
                if(inputField.value === 'HAPUS') {
                    modal.style.display = 'none';
                    resolve(true);
                } else {
                    showToast('Gagal: Anda harus mengetik HAPUS huruf besar semua!', 'error');
                }
            } else {
                modal.style.display = 'none';
                resolve(true);
            }
        };

        // Jika tombol BATAL ditekan
        document.getElementById('btnConfirmCancel').onclick = () => {
            modal.style.display = 'none';
            resolve(false);
        };
    });
}

// Buka modal pengaturan
if (userAvatar && settingsModal) {
    userAvatar.addEventListener('click', () => {
        document.getElementById('editUsername').value = user.username;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editPassword').value = ''; 
        settingsModal.style.display = 'flex';
    });
}

// Tutup modal pengaturan
if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });
}

// Submit Edit Profil
if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = document.getElementById('editUsername').value;
        const newEmail = document.getElementById('editEmail').value;
        const newPassword = document.getElementById('editPassword').value;

        try {
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    id: user.id, username: newName, email: newEmail, password: newPassword 
                })
            });
            const result = await response.json();
            if (result.success) {
                showToast("Profil diperbarui! Silakan login kembali.", "success");
                setTimeout(() => {
                    localStorage.clear();
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                showToast(result.message, "error");
            }
        } catch (error) { 
            showToast("Terjadi kesalahan server saat update.", "error"); 
        }
    });
}

// Tombol Logout
document.getElementById('logoutSettingsBtn').addEventListener('click', async () => {
    settingsModal.style.display = 'none'; 
    
    // Panggil modal custom
    const yakin = await showCustomConfirm('Logout', 'Yakin ingin keluar dari sesi Memoora saat ini?');
    
    if (yakin) {
        localStorage.clear();
        window.location.href = 'login.html';
    } else {
        settingsModal.style.display = 'flex'; 
    }
});

// Tombol Hapus Akun
document.getElementById('deleteAccountSettingsBtn').addEventListener('click', async () => {
    settingsModal.style.display = 'none'; 
    
    const yakin = await showCustomConfirm('Hapus Akun', 'Menghapus akun akan memusnahkan seluruh catatan dan folder Anda secara permanen. Lanjutkan?');
    
    if (yakin) {
        const konfirmasiAkhir = await showCustomConfirm('Konfirmasi Akhir', 'Ketik kata HAPUS di bawah ini untuk memusnahkan akun:', true);
        
        if (konfirmasiAkhir) {
            try {
                const response = await fetch(`/api/users/${user.id}`, { 
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) {
                    showToast("Akun berhasil dimusnahkan. Selamat tinggal!", "success");
                    setTimeout(() => {
                        localStorage.clear();
                        window.location.href = 'login.html';
                    }, 1500);
                }
            } catch (error) { 
                showToast("Gagal menghapus akun karena masalah server.", "error"); 
            }
        } else {
            settingsModal.style.display = 'flex';
        }
    } else {
        settingsModal.style.display = 'flex';
    }
});