$(document).ready(function() {
    const API_URL = 'http://localhost:3001/api';
    let currentNoteId = null;

    // Event listeners
    $('#login-form').submit(handleLogin);
    $('#show-register').click(showRegisterForm);
    $('#create-note').click(showNoteModal);
    $('#note-form').submit(handleSaveNote);
    $('#search').on('input', handleSearch);
    $('#show-archived').click(showArchivedNotes);
    $('#show-trash').click(showTrashNotes);
    $('#logout').click(handleLogout);
    $('.close').click(closeNoteModal);

    function handleLogin(e) {
        e.preventDefault();
        const username = $('#username').val();
        const password = $('#password').val();

        $.ajax({
            url: `${API_URL}/auth/login`,
            method: 'POST',
            data: JSON.stringify({ username, password }),
            contentType: 'application/json',
            success: function(response) {
                localStorage.setItem('token', response.token);
                showMainContainer();
                loadNotes();
            },
            error: function(xhr) {
                alert(xhr.responseJSON.message);
            }
        });
    }

    function showRegisterForm() {
        $('#login-form').html(`
            <input type="text" id="username" placeholder="Username" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Register</button>
        `);
        $('#login-form').off('submit').submit(handleRegister);
        $('#show-register').text('Back to Login').off('click').click(showLoginForm);
    }

    function showLoginForm() {
        $('#login-form').html(`
            <input type="text" id="username" placeholder="Username" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Login</button>
        `);
        $('#login-form').off('submit').submit(handleLogin);
        $('#show-register').text('Register').off('click').click(showRegisterForm);
    }

    function handleRegister(e) {
        e.preventDefault();
        const username = $('#username').val();
        const password = $('#password').val();

        $.ajax({
            url: `${API_URL}/auth/register`,
            method: 'POST',
            data: JSON.stringify({ username, password }),
            contentType: 'application/json',
            success: function() {
                alert('Registration successful. Please login.');
                showLoginForm();
            },
            error: function(xhr) {
                alert(xhr.responseJSON.message);
            }
        });
    }

    function showMainContainer() {
        $('#auth-container').hide();
        $('#main-container').show();
    }

    function loadNotes() {
        $.ajax({
            url: `${API_URL}/notes`,
            method: 'GET',
            headers: { 'Authorization': localStorage.getItem('token') },
            success: function(notes) {
                displayNotes(notes);
            },
            error: function(xhr) {
                alert(xhr.responseJSON.message);
            }
        });
    }

    function displayNotes(notes) {
        const notesContainer = $('#notes-container');
        notesContainer.empty();

        notes.forEach(note => {
            const noteElement = $(`
                <div class="note" style="background-color: ${note.color}">
                    <h3>${note.title}</h3>
                    <p>${note.content}</p>
                    <p>Tags: ${note.tags.join(', ')}</p>
                    <button class="edit-note" data-id="${note._id}">Edit</button>
                    <button class="delete-note" data-id="${note._id}">Delete</button>
                    <button class="archive-note" data-id="${note._id}">${note.isArchived ? 'Unarchive' : 'Archive'}</button>
                </div>
            `);

            notesContainer.append(noteElement);
        });

        $('.edit-note').click(function() {
            const noteId = $(this).data('id');
            editNote(noteId);
        });

        $('.delete-note').click(function() {
            const noteId = $(this).data('id');
            deleteNote(noteId);
        });

        $('.archive-note').click(function() {
            const noteId = $(this).data('id');
            toggleArchiveNote(noteId);
        });
    }

    function showNoteModal(note = null) {
        currentNoteId = note ? note._id : null;
        $('#note-title').val(note ? note.title : '');
        $('#note-content').val(note ? note.content : '');
        $('#note-tags').val(note ? note.tags.join(', ') : '');
        $('#note-color').val(note ? note.color : 'white');
        $('#note-modal').show();
    }

    function closeNoteModal() {
        $('#note-modal').hide();
        currentNoteId = null;
    }

    function handleSaveNote(e) {
        e.preventDefault();
        const title = $('#note-title').val();
        const content = $('#note-content').val();
        const tags = $('#note-tags').val().split(',').map(tag => tag.trim());
        const color = $('#note-color').val();

        const noteData = { title, content, tags, color };

        if (currentNoteId) {
            updateNote(currentNoteId, noteData);
        } else {
            createNote(noteData);
        }
    }

    function createNote(noteData) {
        $.ajax({
            url: `${API_URL}/notes`,
            method: 'POST',
            headers: { 'Authorization': localStorage.getItem('token') },
            data: JSON.stringify(noteData),
            contentType: 'application/json',
            success: function() {
                closeNoteModal();
                loadNotes();
            },
            error: function(xhr) {
                alert(xhr.responseJSON.message);
            }
        });
    }

    function updateNote(noteId, noteData) {
        $.ajax({
            url: `${API_URL}/notes/${noteId}`,
            method: 'PUT',
            headers: { 'Authorization': localStorage.getItem('token') },
            data: JSON.stringify(noteData),
            contentType: 'application/json',
            success: function() {
                closeNoteModal();
                loadNotes();
            },
            error: function(xhr) {
                alert(xhr.responseJSON.message);
            }
        });
    }

    function deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            $.ajax({
                url: `${API_URL}/notes/${noteId}`,
                method: 'DELETE',
                headers: { 'Authorization': localStorage.getItem('token') },
                success: function() {
                    loadNotes();
                },
                error: function(xhr) {
                    alert(xhr.responseJSON.message);
                }
            });
        }
    }

    function toggleArchiveNote(noteId) {
        $.ajax({
            url: `${API_URL}/notes/${noteId}`,
            method: 'PUT',
            headers: { 'Authorization': localStorage.getItem('token') },
            data: JSON.stringify({ isArchived: true }),
            contentType: 'application/json',
            success: function() {
                loadNotes();
            },
            error: function(xhr) {
                alert(xhr.responseJSON.message);
            }
        });
    }

    function handleSearch() {
        const query = $('#search').val();
        $.ajax({
            url: `${API_URL}/notes/search?q=${query}`,
            method: 'GET',
            headers: { 'Authorization': localStorage.getItem('token') },
            success: function(notes) {
                displayNotes(notes);
            },
            error: function(xhr) {
                alert(xhr.responseJSON.message);
            }
        });
    }

    function showArchivedNotes() {
        $.ajax({
            url: `${API_URL}/notes/archived`,
            method: 'GET',
            headers: { 'Authorization': localStorage.getItem('token') },
            success: function(notes) {
                displayNotes(notes);
            },
            error: function(xhr) {
                alert(xhr.responseJSON.message);
            }
        });
    }

    function showTrashNotes() {
        $.ajax({
            url: `${API_URL}/notes/trash`,
            method: 'GET',
            headers: { 'Authorization': localStorage.getItem('token') },
            success: function(notes) {
                displayNotes(notes);
            },
            error: function(xhr) {
                alert(xhr.responseJSON.message);
            }
        });
    }

    function handleLogout() {
        localStorage.removeItem('token');
        $('#auth-container').show();
        $('#main-container').hide();
    }

    // Check if user is already logged in
    if (localStorage.getItem('token')) {
        showMainContainer();
        loadNotes();
    }
});