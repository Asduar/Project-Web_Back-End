document.addEventListener('DOMContentLoaded', () => {
    console.log("Dashboard siap! Memulai koneksi ke API Server...");
    const API_URL = '/api/notes';

    async function fetchNotes() {
        try {
            const searchInput = document.getElementById('searchInput').value;
            const statusFilter = document.getElementById('statusFilter').value;

            let url = API_URL;
            const queryParams = [];
            if (searchInput) queryParams.push(`search=${encodeURIComponent(searchInput)}`);
            if (statusFilter && statusFilter !== 'all') queryParams.push(`status=${statusFilter}`);
            
            if (queryParams.length > 0) {
                url += `?${queryParams.join('&')}`;
            }

            const response = await fetch(url);
            const result = await response.json();

            if (result.success) {
                renderNotes(result.data);
            } else {
                console.error("Gagal mengambil data:", result.message);
            }
        } catch (error) {
            console.error("Terjadi kesalahan jaringan:", error);
        }
    }

    async function createNote(newNote) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNote)
            });
            const result = await response.json();
            
            if (result.success) {
                fetchNotes();
            }
        } catch (error) {
            console.error("Gagal menambah catatan:", error);
        }
    }

    async function updateNoteStatus(id, newStatus) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const result = await response.json();

            if (result.success) {
                fetchNotes();
            }
        } catch (error) {
            console.error("Gagal mengupdate status:", error);
        }
    }

    async function deleteNote(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.success) {
                fetchNotes();
            }
        } catch (error) {
            console.error("Gagal menghapus catatan:", error);
        }
    }

    function renderNotes(notesToRender) {
        const container = document.getElementById('notesContainer');
        container.innerHTML = ''; 

        if (notesToRender.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #5e6c84;">
                    <h3>Tidak ada catatan yang ditemukan.</h3>
                </div>`;
            return;
        }

        notesToRender.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            
            const isChecked = note.status === 'completed' ? 'checked' : '';
            const titleStyle = note.status === 'completed' ? 'text-decoration: line-through; color: #a5adba;' : '';

            noteCard.innerHTML = `
                <div class="note-header" style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="display: flex; gap: 10px;">
                        <input type="checkbox" class="note-check" data-id="${note.id}" ${isChecked}>
                        <h3 style="${titleStyle}; margin: 0;">${note.title}</h3>
                    </div>
                    <button class="delete-btn" data-id="${note.id}" style="background: none; border: none; color: #ff5630; cursor: pointer; font-weight: bold;">X</button>
                </div>
                <p>${note.description}</p>
                <div class="note-footer">
                    <span class="tag ${note.tag}">${note.tag.toUpperCase()}</span>
                    <span class="date">${note.dueDate}</span>
                </div>
            `;
            container.appendChild(noteCard);
        });

        attachCardListeners();
    }

    function attachCardListeners() {
        document.querySelectorAll('.note-check').forEach(box => {
            box.addEventListener('change', (e) => {
                const noteId = parseInt(e.target.getAttribute('data-id'));
                const newStatus = e.target.checked ? 'completed' : 'pending';
                updateNoteStatus(noteId, newStatus);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const noteId = parseInt(e.target.getAttribute('data-id'));
                if(confirm("Yakin ingin menghapus catatan ini?")) {
                    deleteNote(noteId);
                }
            });
        });
    }

    document.getElementById('searchInput').addEventListener('input', fetchNotes);
    document.getElementById('statusFilter').addEventListener('change', fetchNotes);

    const noteModal = document.getElementById('noteModal');
    const noteForm = document.getElementById('noteForm');

    document.getElementById('addNoteBtn').addEventListener('click', () => { noteModal.style.display = 'flex'; });
    
    const closeModal = () => { noteModal.style.display = 'none'; noteForm.reset(); };
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelNoteBtn').addEventListener('click', closeModal);

    noteForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        const newNote = {
            title: document.getElementById('noteTitle').value,
            description: document.getElementById('noteDesc').value,
            dueDate: document.getElementById('noteDate').value,
            tag: document.getElementById('noteTag').value
        };

        const submitBtn = noteForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Menyimpan...';
        submitBtn.disabled = true;

        createNote(newNote).then(() => {
            submitBtn.textContent = 'Simpan Catatan';
            submitBtn.disabled = false;
            closeModal();
        });
    });

    fetchNotes();
});