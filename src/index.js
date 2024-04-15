import './style/style.css';

const baseUrl = 'https://notes-api.dicoding.dev/v2';

class MyAppBar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header>
                <h1>My Notes App</h1>
            </header>
        `;
    }
}

class MyFooterBar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer>
                <h3>Syafaat Akbar F1316YB262 &copy; 2024</h3>
            </footer>
        `
    }
}

class MyNoteForm extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <form id="my-note-form">
            <h2>Form Tambahkan Note Baru</h2>
                <input type="text" id="note-title" placeholder="Masukkan Judul" required>
                <textarea id="note-body" placeholder="Masukkan Isi Notes" required></textarea>
                <button type="submit">Tambah Note</button>
            </form>
        `;

        const myForm = this.querySelector('#my-note-form');
        myForm.addEventListener('input', this.validateMyForm.bind(this));
        myForm.addEventListener('submit', this.addMyNotes.bind(this));
    }

    validateMyForm(event) {
        const inputTitle = this.querySelector('#note-title');
        const inputBody = this.querySelector('#note-body');
        const buttonSubmit = this.querySelector('button[type="submit"]');

        if(inputTitle.validity.valid && inputBody.validity.valid) {
            buttonSubmit.removeAttribute('disabled')
        } else {
            buttonSubmit.setAttribute('disabled', true);
        }
    }

    async addMyNotes(event) {
        event.preventDefault();
        const title = this.querySelector('#note-title').value;
        const body = this.querySelector('#note-body').value;

        if (title && body) {
            const myNewNote = {
                title,
                body,
            };

            try {

                MyLoading.show();

                const response = await fetch(`${baseUrl}/notes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(myNewNote),
                });

                if (!response.ok) {
                    alert('Gagal total');
                    return;
                }

                document.dispatchEvent(new CustomEvent('noteSuccAdded', {detail: myNewNote}));
                event.target.reset();
            } catch (error) {
                alert('Gagal total');
            } finally {
                MyLoading.hide();
            }
        }
    }
}

class MyNoteList extends HTMLElement {
    connectedCallback() {
        this.render();

        document.addEventListener('noteSuccAdded', this.render.bind(this));
        document.addEventListener('noteSuccDeleted', this.render.bind(this));
    }

    async render() {
        this.innerHTML = `
            <section id="my-note-list"></section>
        `;

        const myNoteList = this.querySelector('#my-note-list');

        try {
            const response = await fetch(`${baseUrl}/notes`);
            const {data} = await response.json();

            data.forEach(note => {
                const myNoteItem = document.createElement('my-note-item');
                myNoteItem.note = note;
                myNoteList.appendChild(myNoteItem);
            });
        } catch (e) {
            alert('Gagal total');
        }
    }
}

class MyNoteItem extends HTMLElement {
    set note(note) {
        this.setAttribute('data-note-type', 'note');
        this.innerHTML = `
            <article>
                <h2>${note.title}</h2>
                <p>${note.body}</p>
                <small>Created at: ${new Date(note.createdAt).toLocaleString()}</small>
                <br>
                <button class="button-delete" data-id="${note.id}">Delete</button>
            </article>
        `;

        const buttonDelete = this.querySelector('button');
        buttonDelete.addEventListener('click', this.deleteMyNote.bind(this));
    }

    async deleteMyNote() {
        const noteId = this.querySelector('button').dataset.id;

        try {
            
            MyLoading.show();

            const response = await fetch(`${baseUrl}/notes/${noteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                alert('Gagal total');
                return;
            }

            document.dispatchEvent(new CustomEvent('noteSuccDeleted', {detail: noteId}));
        } catch (error) {
            alert('Gagal total');
        } finally {
            MyLoading.hide();
        }
    }
}

class MyLoading extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div id="loading">
                <p>Loading...</p>
            </div>
        `;
    }

    static show() {
        document.querySelector('#loading').classList.add('active');
    }

    static hide(ms = 500) {
        setTimeout(() => {
            document.querySelector('#loading').classList.remove('active');
        }, ms);
    }
}

customElements.define('my-loading', MyLoading);
customElements.define('my-app-bar', MyAppBar);
customElements.define('my-note-form', MyNoteForm);
customElements.define('my-note-item', MyNoteItem);
customElements.define('my-note-list', MyNoteList);
customElements.define('my-footer-bar', MyFooterBar);