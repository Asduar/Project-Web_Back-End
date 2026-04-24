// Menunggu sampai seluruh HTML selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    console.log("Dashboard siap! Memulai inisialisasi aplikasi...");

    // ==========================================
    // 1. DATA TIRUAN (Dummy Data)
    // ==========================================
    let notesData = [
        { 
            id: 1, 
            title: "Selesaikan UI Back-End", 
            description: "Mengerjakan struktur HTML dan CSS untuk tugas web.", 
            dueDate: "2026-05-02", 
            tag: "urgent", 
            status: "pending" 
        },
        { 
            id: 2, 
            title: "Pelajari Routing Node.js", 
            description: "Membaca dokumentasi Express JS agar siap bantu tim.", 
            dueDate: "2026-04-28", 
            tag: "review", 
            status: "completed" 
        },
        { 
            id: 3, 
            title: "Rapat Pembagian Tugas", 
            description: "Diskusi via Google Meet dengan Anggota 2, 3, dan 4.", 
            dueDate: "2026-04-25", 
            tag: "normal", 
            status: "pending" 
        }
    ];

    // ==========================================
    // 2. FUNGSI RENDER TAMPILAN (Kartu Catatan)
    // ==========================================
    function renderNotes(notesToRender) {
        const container = document.getElementById('notesContainer');
        container.innerHTML = ''; // Kosongkan layar dulu

        if (notesToRender.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #5e6c84;">
                    <h3>Tidak ada catatan yang ditemukan.</h3>
                    <p>Coba gunakan kata kunci pencarian yang lain.</p>
                </div>`;
            return;
        }

        notesToRender.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            
            const isChecked = note.status === 'completed' ? 'checked' : '';
            const titleStyle = note.status === 'completed' ? 'text-decoration: line-through; color: #a5adba;' : '';

            noteCard.innerHTML = `
                <div class="note-header">
                    <input type="checkbox" class="note-check" data-id="${note.id}" ${isChecked}>
                    <h3 style="${titleStyle}">${note.title}</h3>
                </div>
                <p>${note.description}</p>
                <div class="note-footer">
                    <span class="tag ${note.tag}">${note.tag.toUpperCase()}</span>
                    <span class="date">${formatDate(note.dueDate)}</span>
                </div>
            `;
            container.appendChild(noteCard);
        });

        // Pasang pendengar klik untuk checkbox
        attachCheckboxListeners();
    }

    function formatDate(dateString) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    }

    function attachCheckboxListeners() {
        const checkboxes = document.querySelectorAll('.note-check');
        checkboxes.forEach(box => {
            box.addEventListener('change', (e) => {
                const noteId = parseInt(e.target.getAttribute('data-id'));
                const isDone = e.target.checked;
                
                const noteIndex = notesData.findIndex(n => n.id === noteId);
                if (noteIndex > -1) {
                    notesData[noteIndex].status = isDone ? 'completed' : 'pending';
                    // Panggil fungsi filter lagi, bukan sekadar renderNotes
                    // agar tidak merusak hasil pencarian yang sedang aktif
                    applyFilters(); 
                }
            });
        });
    }

    // ==========================================
    // 3. FITUR PENCARIAN DAN FILTER STATUS
    // ==========================================
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');

    // Fungsi utama penyaring data
    function applyFilters() {
        // Ambil nilai dari inputan dan jadikan huruf kecil semua agar tidak sensitif huruf besar/kecil
        const searchText = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;

        // Lakukan penyaringan pada array notesData
        const filteredData = notesData.filter(note => {
            // Cek apakah judul atau deskripsi mengandung kata yang dicari
            const matchesSearch = note.title.toLowerCase().includes(searchText) || 
                                  note.description.toLowerCase().includes(searchText);
            
            // Cek apakah statusnya sesuai dengan dropdown
            const matchesStatus = statusValue === 'all' || note.status === statusValue;

            // Kartu hanya ditampilkan jika lolos kedua syarat di atas
            return matchesSearch && matchesStatus;
        });

        // Tampilkan hasil saringan ke layar
        renderNotes(filteredData);
    }

    // Pasang "telinga" (event listener) saat user mengetik atau memilih dropdown
    searchInput.addEventListener('input', applyFilters);
    statusFilter.addEventListener('change', applyFilters);


    // ==========================================
    // 4. LOGIKA MODAL FORM (POP-UP)
    // ==========================================
    const addNoteBtn = document.getElementById('addNoteBtn');
    const noteModal = document.getElementById('noteModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelNoteBtn = document.getElementById('cancelNoteBtn');
    const noteForm = document.getElementById('noteForm');

    addNoteBtn.addEventListener('click', () => { noteModal.style.display = 'flex'; });

    const closeModal = () => { 
        noteModal.style.display = 'none'; 
        noteForm.reset(); 
    };

    closeModalBtn.addEventListener('click', closeModal);
    cancelNoteBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => { if (event.target === noteModal) closeModal(); });

    noteForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const newNote = {
            title: document.getElementById('noteTitle').value,
            description: document.getElementById('noteDesc').value,
            dueDate: document.getElementById('noteDate').value,
            tag: document.getElementById('noteTag').value
        };

        const submitBtn = noteForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Menyimpan...';
        submitBtn.disabled = true;

        setTimeout(() => {
            const newId = notesData.length > 0 ? Math.max(...notesData.map(n => n.id)) + 1 : 1;
            const finalNote = { id: newId, ...newNote, status: 'pending' };
            notesData.unshift(finalNote); // Tambahkan ke urutan paling atas
            
            // Render ulang layar dengan filter yang mungkin sedang aktif
            applyFilters();
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            closeModal();
        }, 800); // Simulasi delay lebih singkat agar terasa lebih responsif
    });

    // Tampilkan data pertama kali saat web dibuka
    renderNotes(notesData);
});