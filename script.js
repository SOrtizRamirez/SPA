// Declare route paths for the SPA (Single Page Application)
const routes = {
    "/": "./views/users.html",
    "/users": "./views/users.html",
    "/newUser": "./views/newUser.html",
    "/editUser": "./views/editUser.html",
    "/login": "./views/login.html"
}

// Variable to store the ID of the user currently being edited
let currentUserId = null;

// Check if the user is authenticated (either admin or visitor)
function isAuth() {
    const result = localStorage.getItem("Auth") || null;
    return result === "admin" || result === "visitor" || null;
}

// Listen globally for clicks on elements with [data-link] attribute
document.body.addEventListener("click", (e) => {
    const link = e.target.closest("[data-link]");
    if (!link) return;

    e.preventDefault();

    const href = link.getAttribute("href"); // Get the route from href
    const url = new URL(href, window.location.origin); // Convert it to full URL
    const route = url.pathname; // Get the pathname (e.g., "/users")

    if (routes[route]) {
        navigate(href); // Navigate to the route if it exists
    } else {
        console.warn("Ruta no válida:", route); // Log invalid route
    }
});

// Navigation function: fetch and render HTML from views based on route
async function navigate(href) {
    const url = new URL(href, window.location.origin);
    const route = url.pathname;

    if (!isAuth()) {
        history.pushState({}, "", "/login")
    }

    if (!routes[route]) {
        console.warn("Ruta no encontrada:", route); // If the route doesn't exist
        return;
    }

    // Load the view's HTML
    const html = await fetch(routes[route]).then(res => res.text());
    document.getElementById("content").innerHTML = html;

    // Update browser URL
    history.pushState({}, "", href);

    // Wait a tick to allow DOM to update before continuing
    await new Promise(resolve => setTimeout(resolve, 0));

    // If editing user, download user info using ID from query string
    if (route === "/editUser") {
        const id = url.searchParams.get("id");
        if (id) downloadInfo(id);
    }

    // If in users view, show users and hide add button if visitor
    if (route === "/users") {
        showUsers();
        toggleAddUserButton();
    }

    // If in login view, setup login and visitor buttons
    if (route === "/login") {
        setupLoginForm();
        visitor();
    }
}

// Enable browser back/forward navigation for SPA
window.addEventListener("popstate", () =>
    navigate(location.pathname)
);

// Function to add new user to JSON server
async function addUser() {
    const buttonSave = document.getElementById('btn-save')
    const nameNewUser = document.getElementById("name").value
    const docNewUser = document.getElementById("doc").value
    const emailNewUser = document.getElementById("email").value
    const phoneNewUser = document.getElementById("phone").value
    const dateNewUser = document.getElementById("admission").value

    buttonSave.onclick = function (e) {
        e.preventDefault();
    }

    // Field validations
    const validations = [
        validateField("name", { required: true, type: "letters", label: "Nombre" }),
        validateField("email", { required: true, label: "Correo electrónico" }),
        validateField("phone", { required: true, type: "numbers", label: "Teléfono" }),
        validateField("admission", { required: true, label: "Fecha de admisión" }),
        validateField("doc", { required: true, type: "numbers", label: "Documento de identidad" }),
    ];

    // If validation fails, show alert
    for (let result of validations) {
        if (!result.valid) {
            alert(result.error);
            return;
        }
    }

    // Create user object
    const newUser = {
        "id": docNewUser,
        "name": nameNewUser,
        "email": emailNewUser,
        "phone": phoneNewUser,
        "dateOfAdmission": dateNewUser
    }

    // POST request to JSON server
    await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
    })
        .then(response => response.json())
        .then(data => {
            const respon = document.getElementById('response')
            respon.innerHTML = `<p>Usuario ${data.name} agregado con éxito.</p>`
        })
        .catch(error => {
            const respon = document.getElementById('response')
            respon.innerHTML = `<p>Error al agregar al usuario: ${error}</p>`
        })
}

// Fetch and display user list
async function showUsers() {
    let usersTable = document.getElementById('usersTable');
    try {
        let html = '';
        const response = await fetch('http://localhost:3000/users');
        const data = await response.json();

        // If user is a visitor, display without actions
        if (localStorage.getItem('Auth') == 'visitor') {
            data.forEach(data => {
                html += `
                <tr>
                    <td><img src="./img/randomGuy.jpg" alt="Foto"></td>
                    <td>${data.id}</td>
                    <td>${data.name}</td>
                    <td>${data.email}</td>
                    <td>${data.phone}</td>
                    <td>${data.dateOfAdmission}</td>
                </tr>
            `;
            });
            usersTable.innerHTML = html;
        } else if (localStorage.getItem('Auth') == 'admin') {
            data.forEach(data => {
                html += `
                <tr>
                    <td><img src="./img/randomGuy.jpg" alt="Foto"></td>
                    <td>${data.id}</td>
                    <td>${data.name}</td>
                    <td>${data.email}</td>
                    <td>${data.phone}</td>
                    <td>${data.dateOfAdmission}</td>
                    <td class="actions">
                        <i onclick="deteleUser(${data.id})" class='bx bx-message-alt-x' style='color:#810af3'></i>
                        <i class='bx bxs-edit-alt' href="/editUser?id=${data.id}" data-link></i>
                    </td>
                </tr>
            `;
            });
            usersTable.innerHTML = html;
        }
    } catch (error) {
        const results = document.getElementById('results');
        console.log(error)
    }
}

// Delete user by ID
async function deteleUser(id) {
    const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este usuario?");
    if (!confirmDelete) return;

    const results = document.getElementById('results');

    try {
        await fetch(`http://localhost:3000/users/${id}`, { method: 'DELETE' });
        results.innerHTML = `<p>Usuario eliminado correctamente.</p>`;
        showUsers(); // Refresh user list
    } catch (error) {
        results.innerHTML = `<p>Error al eliminar el usuario: ${error}</p>`;
    }
}

// Load user info into form to edit
async function downloadInfo(id) {
    currentUserId = id;
    console.log(id);

    try {
        const res = await fetch(`http://localhost:3000/users/${id}`);
        const data = await res.json();

        console.log("User data:", data);

        // Fill form inputs with user data
        const name = document.getElementById("name1");
        const email = document.getElementById("email1");
        const phone = document.getElementById("phone1");
        const admission = document.getElementById("admission1");

        if (name && email && phone && admission) {
            name.value = data.name;
            email.value = data.email;
            phone.value = data.phone;
            admission.value = data.dateOfAdmission;
        } else {
            console.error("Inputs no encontrados");
        }
    } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
    }
}

// Submit edited user data
async function editUser() {
    const name = document.getElementById("name1").value;
    const email = document.getElementById("email1").value;
    const phone = document.getElementById("phone1").value;
    const admission = document.getElementById("admission1").value;

    const validations = [
        validateField("name1", { required: true, type: "letters", label: "Nombre" }),
        validateField("email1", { required: true, label: "Correo electrónico" }),
        validateField("phone1", { required: true, type: "numbers", label: "Teléfono" }),
        validateField("admission1", { required: true, label: "Fecha de admisión" }),
    ];

    for (let result of validations) {
        if (!result.valid) {
            alert(result.error);
            return;
        }
    }

    const updatedUser = {
        name,
        email,
        phone,
        dateOfAdmission: admission
    };

    if (!currentUserId) {
        alert("No se encontró el ID del usuario para actualizar.");
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/users/${currentUserId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUser)
        });

        const data = await res.json();

        document.getElementById("response").innerHTML =
            `<p>Usuario ${data.name} editado con éxito.</p>`;
    } catch (error) {
        document.getElementById("response").innerHTML =
            `<p>Error al editar el usuario: ${error}</p>`;
    }
}

// Validate input fields (letters, numbers, required)
function validateField(id, { required = false, type = null, label = id } = {}) {
    const input = document.getElementById(id);
    if (!input) {
        console.warn(`El input con ID '${id}' no existe aún.`);
        return { valid: false, error: `Input no encontrado: ${id}` };
    }
    const value = input.value.trim();

    if (required && value === "") {
        return { valid: false, error: `El campo "${label}" es obligatorio.` };
    }
    if (type === "letters" && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
        return { valid: false, error: `El campo "${label}" solo puede contener letras.` };
    }
    if (type === "numbers" && !/^[0-9]+$/.test(value)) {
        return { valid: false, error: `El campo "${label}" solo puede contener números.` };
    }
    return { valid: true };
}

// Setup login form and handle login logic
function setupLoginForm() {
    setTimeout(() => {
        const loginForm = document.getElementById('login-form');
        const userInput = document.getElementById('userLogin');
        const passInput = document.getElementById('passwordLogin');
        const errorDiv = document.getElementById('error');

        if (!loginForm || !userInput || !passInput) {
            console.warn("No se encontró el formulario de login o sus campos.");
            return;
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let authorized = false;
            errorDiv.textContent = "";

            try {
                const res = await fetch(`http://localhost:3000/admins`);
                const admins = await res.json();
                const user = userInput.value.trim();
                const pass = passInput.value.trim();

                for (const admin of admins) {
                    if (admin.user === user && admin.password === pass) {
                        localStorage.setItem("Auth", "admin");
                        navigate("/users");
                        authorized = true;
                        break;
                    }
                }

                if (!authorized) {
                    errorDiv.textContent = "Usuario y/o contraseña incorrectos.";
                }
            } catch (err) {
                errorDiv.textContent = "Error al validar credenciales.";
                console.error(err);
            }
        });
    }, 0);
}

// Setup guest login button
function visitor() {
    const visit = document.getElementById('visitor')
    visit.addEventListener('click', () => {
        localStorage.setItem("Auth", "visitor");
        navigate("/users")
    })
}

// Show or hide the "Add user" button based on user role
function toggleAddUserButton() {
    const addButton = document.getElementById('add-btn');
    const role = localStorage.getItem('Auth');

    if (!addButton) {
        console.warn("Botón 'Agregar usuario' no encontrado.");
        return;
    }

    addButton.hidden = role === 'visitor';
}

// Logout button to clear session and redirect to login
const buttonCloseSession = document.getElementById("close-session");
buttonCloseSession.addEventListener("click", () => {
    localStorage.setItem("Auth", "false");
    navigate("/login");
});
