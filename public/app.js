// ==========================================
// 1. PROTEKSI HALAMAN & DATA USER (AUTH GUARD)
// ==========================================
const token = localStorage.getItem('token');
let userData = JSON.parse(localStorage.getItem('user'));

if (!token) {
    window.location.href = 'login.html';
}

// Fungsi menampilkan identitas di UI
function updateUI() {
    if (userData) {
        if (document.getElementById('userAvatar')) {
            document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?name=${userData.username}&background=FFD700&color=000&bold=true`;
        }
        const logoHeader = document.querySelector('.blink-gold');
        if (logoHeader) {
            logoHeader.innerText = `Hi, ${userData.username}!`;
        }
    }
}
updateUI();

// ==========================================
// 2. FITUR SETTINGS USER (UPDATE & DELETE)
// ==========================================
const settingsModal = document.getElementById('settingsModal');
const settingsForm = document.getElementById('settingsForm');

function openSettings() {
    document.getElementById('editUsername').value = userData.username;
    document.getElementById('editEmail').value = userData.email;
    settingsModal.style.display = 'flex';
}

function closeSettings() {
    settingsModal.style.display = 'none';
    settingsForm.reset();
}

function logout() {
    if (confirm("Apakah anda yakin ingin keluar dari Memoora?")) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

// Handler Simpan Perubahan (UPDATE)
settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const updatedData = {
        id: userData.id,
        username: document.getElementById('editUsername').value,
        email: document.getElementById('editEmail').value,
        password: document.getElementById('editPassword').value
    };

    try {
        const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        const result = await response.json();
        if (result.success) {
            alert("Profil diperbarui! Silakan login kembali dengan data baru.");
            localStorage.clear();
            window.location.href = 'login.html';
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert("Gagal memperbarui profil");
    }
});

// Handler Hapus Akun (DELETE)
async function handleDeleteAccount() {
    if (confirm("PERINGATAN: Akun dan semua catatan Anda akan dihapus permanen. Lanjutkan?")) {
        try {
            const response = await fetch(`/api/users/${userData.id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                alert("Akun berhasil dihapus.");
                localStorage.clear();
                window.location.href = 'login.html';
            }
        } catch (error) {
            alert("Gagal menghapus akun");
        }
    }
}

// ==========================================
// 3. KODE CRUD NOTES (LOGIKA UTAMA)
// ==========================================
const notesContainer = document.getElementById('notesContainer');
const addNoteBtn = document.getElementById('addNoteBtn');
const noteModal = document.getElementById('noteModal');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');
const noteForm = document.getElementById('noteForm');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');

let allNotes = []; 

async function fetchNotes() {
    try {
        const response = await fetch('/api/notes');
        const result = await response.json();
        if (result.success) {
            allNotes = result.data;
            jalankanFilter();
        }
    } catch (error) {
        console.error("Gagal mengambil data:", error);
    }
}

function renderNotes(dataYangMauDitampilkan) {
    notesContainer.innerHTML = '';
    dataYangMauDitampilkan.forEach(note => {
        const isChecked = note.status === 'completed' ? 'checked' : '';
        const titleStyle = note.status === 'completed' ? 'text-decoration: line-through; color: gray;' : 'color: var(--gold-primary);';

        let tagBg, tagColor;
        switch(note.tag.toLowerCase()) {
            case 'urgent': tagBg = 'rgba(255, 71, 87, 0.1)'; tagColor = '#ff4757'; break;
            case 'normal': tagBg = 'rgba(46, 213, 115, 0.1)'; tagColor = '#2ed573'; break;
            case 'review': tagBg = 'rgba(30, 144, 255, 0.1)'; tagColor = '#1e90ff'; break;
            default: tagBg = 'rgba(255, 215, 0, 0.1)'; tagColor = '#FFD700';
        }

        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.innerHTML = `
            <div class="note-header" style="display: flex; justify-content: space-between; align-items: start;">
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="checkbox" class="note-check" data-id="${note.id}" ${isChecked}>
                    <h3 style="${titleStyle}; margin: 0; transition: all 0.3s;">${note.title}</h3>
                </div>
                <button class="delete-btn" data-id="${note.id}" style="border: none; background: none; color: #ff4757; cursor: pointer; font-size: 1.2rem;">✕</button>
            </div>
            <p style="margin-top: 10px; color: #d0d0d0;">${note.description}</p>
            <div class="note-footer" style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-top: 15px;">
                <span style="background: ${tagBg}; color: ${tagColor}; padding: 4px 10px; border-radius: 8px; font-weight: bold;">${note.tag.toUpperCase()}</span>
                <span>🗓️ ${note.dueDate}</span>
            </div>
        `;
        notesContainer.appendChild(noteCard);
    });
}

function jalankanFilter() {
    const kataKunci = searchInput.value.toLowerCase();
    const statusPilihan = statusFilter.value;
    const dataTersaring = allNotes.filter(note => {
        const cocokKataKunci = note.title.toLowerCase().includes(kataKunci) || 
                               note.description.toLowerCase().includes(kataKunci);
        const cocokStatus = statusPilihan === 'all' || note.status === statusPilihan;
        return cocokKataKunci && cocokStatus;
    });
    renderNotes(dataTersaring);
}

searchInput.addEventListener('input', jalankanFilter);
statusFilter.addEventListener('change', jalankanFilter);
addNoteBtn.addEventListener('click', () => { noteModal.style.display = 'flex'; });
cancelNoteBtn.addEventListener('click', () => { noteModal.style.display = 'none'; noteForm.reset(); });

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

notesContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.getAttribute('data-id');
        if (confirm("Hapus catatan ini?")) {
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
});

fetchNotes();