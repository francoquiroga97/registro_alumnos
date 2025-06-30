// ===============================
// CONFIGURACIÓN GLOBAL
// ===============================
const API_URL = "http://localhost:5001/api"; // URL base de la API
const API_KEY = "12345ABCDEF"; // Clave de autenticación para la API

const headers = { // Headers comunes para las peticiones HTTP
  "Content-Type": "application/json",
  "Authorization": `Bearer ${API_KEY}`
};

// ===============================
// FUNCIONES GLOBALES DE UI
// ===============================

/**
 * Muestra una notificación toast en la pantalla
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, warning, info)
 */
function showToast(message, type = 'success') {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons['success']}</span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-slide-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===============================
// MÓDULO: index.html
// ===============================

/**
 * Inicializa la página de inicio (actualmente solo log)
 */
function loadHomePage() {
  console.log("Inicio cargado correctamente");
}

// ===============================
// MÓDULO: carreras.html
// ===============================

/**
 * Obtiene todas las carreras desde la API
 * @returns {Promise<Array>} Lista de carreras
 */
async function getAllCareers() {
  try {
    const response = await fetch(`${API_URL}/careers`, { method: "GET", headers });
    if (!response.ok) throw new Error("Error al cargar carreras");
    return response.json();
  } catch (error) {
    console.error("Error al obtener carreras:", error);
    showToast('Error al cargar la lista de carreras', 'error');
    return []; // Devuelve un array vacío en caso de error
  }
}

/**
 * Obtiene todas las categorías desde la API
 * @returns {Promise<Array>} Lista de categorías
 */
async function getCategories() {
  try {
    const response = await fetch(`${API_URL}/categories`, { method: "GET", headers });
    if (!response.ok) throw new Error("Error al cargar categorías");
    return response.json();
  } catch(error) {
    console.error("Error al obtener categorías:", error);
    showToast('Error al cargar las categorías', 'error');
    return []; // Devuelve un array vacío en caso de error
  }
}

/**
 * Renderiza las tarjetas de carreras en el grid
 * @param {Array} careers - Lista de carreras a mostrar
 */
function renderCareerCards(careers) {
  const container = document.getElementById('careerGrid');
  if (!container) return;

  if (!careers || careers.length === 0) {
    container.innerHTML = '<p class="no-results">No se encontraron carreras con los filtros aplicados.</p>';
    return;
  }

  container.innerHTML = careers.map(career => `
    <div class="career-card" data-category="${career.category || ''}">
      <div class="career-emoji">${career.emoji || "🎓"}</div>
      <div class="career-content">
        <h3>${career.name}</h3>
        <div class="career-meta">
          <p><strong>Duración:</strong> ${career.duration || "-"} años</p>
          ${career.category ? `<p><strong>Categoría:</strong> ${career.category}</p>` : ''}
        </div>
        ${career.description ? `<p class="career-description">${career.description}</p>` : ''}
      </div>
    </div>
  `).join('');
}

/**
 * Llena el dropdown de filtro por categoría
 * @param {Array} categories - Lista de categorías
 */
function populateCategoryFilter(categories) {
  const select = document.getElementById('categoryFilter');
  if (!select) return;

  // Limpiamos opciones previas por si acaso, pero mantenemos la primera
  select.innerHTML = '<option value="">Todas las categorías</option>';
  
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.name;
    option.textContent = category.name;
    select.appendChild(option);
  });
}

/**
 * Actualiza las estadísticas de carreras
 * @param {Array} careers - Lista de carreras
 * @param {Array} categories - Lista de todas las categorías disponibles
 */
function updateCareerStats(careers, categories) {
    if (!document.getElementById('totalCareers')) return;

    const totalCareers = careers.length;
    const durations = careers
        .map(c => parseInt(c.duration) || 0)
        .filter(d => d > 0);

    const averageDuration = durations.length > 0
        ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1)
        : '0';

    // Usamos el total de categorías cargadas, no solo las de las carreras filtradas
    const totalCategories = categories.length;

    document.getElementById('totalCareers').textContent = totalCareers;
    document.getElementById('averageDuration').textContent = averageDuration;
    document.getElementById('totalCategories').textContent = totalCategories;
}

/**
 * Filtra carreras por nombre y categoría, y actualiza la vista
 */
async function filterAndUpdateView() {
  const searchTerm = document.getElementById('careerSearch')?.value.toLowerCase() || '';
  const categoryFilter = document.getElementById('categoryFilter')?.value || '';

  try {
    // Obtenemos todos los datos frescos para asegurar consistencia
    const [allCareers, allCategories] = await Promise.all([
        getAllCareers(),
        getCategories()
    ]);
    
    const filteredCareers = allCareers.filter(career => {
      const matchesSearch = career.name.toLowerCase().includes(searchTerm) ||
        (career.description && career.description.toLowerCase().includes(searchTerm));
      const matchesCategory = !categoryFilter ||
        (career.category && career.category.toLowerCase() === categoryFilter.toLowerCase());
      return matchesSearch && matchesCategory;
    });

    renderCareerCards(filteredCareers);
    updateCareerStats(filteredCareers, allCategories); // Pasamos todas las categorías para el conteo total
  } catch (error) {
    console.error('Error filtrando carreras:', error);
    showToast('Error al filtrar carreras', 'error');
  }
}

/**
 * Inicializa la página de carreras
 */
async function loadCareerPage() {
  // Asegurarse que estamos en la página correcta
  if (!document.getElementById('careerGrid')) return;

  try {
    // Carga inicial de datos
    const [careers, categories] = await Promise.all([
      getAllCareers(),
      getCategories()
    ]);

    // Renderizado inicial
    populateCategoryFilter(categories);
    renderCareerCards(careers);
    updateCareerStats(careers, categories);

    // Asignación de eventos de forma programática
    document.getElementById('careerSearch')?.addEventListener('input', filterAndUpdateView);
    document.getElementById('categoryFilter')?.addEventListener('change', filterAndUpdateView);
    
  } catch (error) {
    console.error('Error inicializando página de carreras:', error);
    showToast('Error al cargar los datos de la página', 'error');
  }
}

// ===============================
// MÓDULO: registro.html
// ===============================

/**
 * Inicializa la página de registro de estudiantes
 */
function loadRegisterPage() {
  /**
   * Carga las opciones de carreras en el select
   */
  async function loadCareerOptions() {
    const select = document.getElementById("registerCareer");
    select.innerHTML = '<option value="">Cargando carreras...</option>';
    try {
      const response = await fetch(`${API_URL}/careers`, { headers });
      if (!response.ok) throw new Error("Error al cargar carreras");
      const careers = await response.json();
      select.innerHTML = '<option value="">Selecciona una carrera</option>';
      careers.forEach(career => {
        const option = document.createElement("option");
        option.value = career.name;
        option.textContent = `${career.emoji || "🎓"} ${career.name}`;
        select.appendChild(option);
      });
    } catch (error) {
      console.error("Error:", error);
      select.innerHTML = '<option value="">Error al cargar carreras</option>';
      showToast('Error al cargar las carreras', 'error');
    }
  }

  /**
   * Muestra/oculta pestañas de búsqueda
   * @param {string} tabId - ID de la pestaña a mostrar ('byId' o 'byCareer')
   */
  function showSearchTab(tabId) {
    document.querySelectorAll('.search-tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`search${tabId === 'byId' ? 'ById' : 'ByCareer'}`).classList.add('active');
    document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
  }

  /**
   * Valida un campo del formulario
   * @param {string} inputId - ID del input a validar
   * @param {string} errorId - ID del elemento de error
   * @param {boolean} isValid - Si el campo es válido
   * @param {string} message - Mensaje de error
   */
  function validateField(inputId, errorId, isValid, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (!input || !error) return;
    
    input.classList.remove('input-success', 'input-error');
    if (isValid) {
      input.classList.add('input-success');
      error.style.display = 'none';
    } else {
      input.classList.add('input-error');
      error.textContent = message;
      error.style.display = 'block';
    }
  }

  /**
   * Establece estado de carga en un botón
   * @param {HTMLElement} button - Botón a modificar
   * @param {boolean} isLoading - Si está en estado de carga
   */
  function setButtonLoading(button, isLoading) {
    if (!button) return;
    button.disabled = isLoading;
    button.classList.toggle('button-loading', isLoading);
  }

  /**
   * Renderiza los resultados de un estudiante
   * @param {Object} student - Datos del estudiante
   * @param {HTMLElement} container - Contenedor donde mostrar los resultados
   */
  function renderStudentResult(student, container) {
    if (!container) return;
    container.innerHTML = `
      <div class="student-details">
        <h3>Detalles del estudiante</h3>
        <p><strong>ID:</strong> ${student.id}</p>
        <p><strong>Nombre:</strong> ${student.name}</p>
        <p><strong>Carrera:</strong> ${student.career}</p>
      </div>
    `;
  }

  /**
   * Registra un nuevo estudiante (POST /api/students)
   */
  async function registerStudent() {
    const name = document.getElementById("registerName")?.value.trim();
    const career = document.getElementById("registerCareer")?.value;
    const btn = document.getElementById("registerBtn");
    const resultContainer = document.getElementById("registerResult");

    // Validación
    let isValid = true;
    if (!name) {
      validateField("registerName", "nameError", false, "Nombre es requerido");
      isValid = false;
    } else {
      validateField("registerName", "nameError", true, "");
    }

    if (!career) {
      validateField("registerCareer", "careerError", false, "Selecciona una carrera");
      isValid = false;
    } else {
      validateField("registerCareer", "careerError", true, "");
    }

    if (!isValid) {
      showToast("Por favor completa todos los campos correctamente", "error");
      return;
    }

    try {
      setButtonLoading(btn, true);
      const response = await fetch(`${API_URL}/students`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name, career }),
      });
      const result = await response.json();

      if (response.ok) {
        showToast(`Estudiante "${result.student.name}" registrado con ID ${result.student.id}`, "success");
        document.getElementById("registerName").value = "";
        document.getElementById("registerCareer").value = "";
        renderStudentResult(result.student, resultContainer);
      } else {
        showToast(result.error || "Error al registrar", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error de conexión con el servidor", "error");
    } finally {
      setButtonLoading(btn, false);
    }
  }

  /**
   * Busca un estudiante por ID (GET /api/students/:id)
   */
  async function getStudentById() {
    const idInput = document.getElementById("studentId");
    const id = idInput?.value.trim();
    const btn = document.getElementById("searchByIdBtn");
    const resultContainer = document.getElementById("getResult");

    if (!id) {
      validateField("studentId", "idSearchError", false, "Ingresa un ID válido");
      resultContainer.innerHTML = "";
      return;
    } else {
      validateField("studentId", "idSearchError", true, "");
    }

    try {
      setButtonLoading(btn, true);
      const response = await fetch(`${API_URL}/students/${id}`, { headers });
      const result = await response.json();

      if (response.ok) {
        renderStudentResult(result, resultContainer);
        showToast("Estudiante encontrado", "success");
      } else {
        showToast(result.error || "Estudiante no encontrado", "error");
        resultContainer.innerHTML = `<p class="no-results">No se encontró estudiante con ID ${id}.</p>`;
      }
    } catch (error) {
      console.error(error);
      showToast("Error al buscar estudiante", "error");
      resultContainer.innerHTML = "";
    } finally {
      setButtonLoading(btn, false);
    }
  }

  /**
   * Busca estudiantes por carrera (GET /api/students?career=)
   */
  async function getStudentsByCareer() {
    const careerInput = document.getElementById("careerFilter");
    const career = careerInput?.value.trim();
    const btn = document.getElementById("searchByCareerBtn");
    const resultContainer = document.getElementById("careerResult");

    if (!career) {
      validateField("careerFilter", "careerSearchError", false, "Ingresa una carrera");
      resultContainer.innerHTML = "";
      return;
    } else {
      validateField("careerFilter", "careerSearchError", true, "");
    }

    try {
      setButtonLoading(btn, true);
      const response = await fetch(`${API_URL}/students?career=${encodeURIComponent(career)}`, { headers });
      const students = await response.json();

      if (response.ok) {
        if (students.length === 0) {
          resultContainer.innerHTML = `<p class="no-results">No se encontraron estudiantes en la carrera "${career}".</p>`;
          showToast(`No se encontraron estudiantes en "${career}"`, "info");
        } else {
          resultContainer.innerHTML = `
            <h3>Estudiantes de ${career}</h3>
            <div class="students-list">
              ${students.map(s => `
                <div class="student-card">
                  <p><strong>ID:</strong> ${s.id}</p>
                  <p><strong>Nombre:</strong> ${s.name}</p>
                  <p><strong>Carrera:</strong> ${s.career}</p>
                </div>
              `).join('')}
            </div>
          `;
          showToast(`Se encontraron ${students.length} estudiantes en "${career}"`, "success");
        }
      } else {
        showToast(students.error || "Error al buscar estudiantes", "error");
        resultContainer.innerHTML = "";
      }
    } catch (error) {
      console.error(error);
      showToast("Error al buscar estudiantes", "error");
      resultContainer.innerHTML = "";
    } finally {
      setButtonLoading(btn, false);
    }
  }

  /**
   * Elimina un estudiante por ID (DELETE /api/students/:id)
   */
  async function deleteStudent() {
    const idInput = document.getElementById("deleteId");
    const id = idInput?.value.trim();
    const btn = document.getElementById("deleteBtn");
    const resultContainer = document.getElementById("deleteResult");

    if (!id) {
      validateField("deleteId", "deleteError", false, "Ingresa un ID válido");
      resultContainer.innerHTML = "";
      return;
    } else {
      validateField("deleteId", "deleteError", true, "");
    }

    if (!confirm(`¿Estás seguro que deseas eliminar al estudiante con ID ${id}?`)) return;

    try {
      setButtonLoading(btn, true);
      const response = await fetch(`${API_URL}/students/${id}`, {
        method: "DELETE",
        headers,
      });
      const result = await response.json();

      if (response.ok) {
        showToast(`Estudiante con ID ${id} eliminado correctamente`, "success");
        document.getElementById("deleteId").value = "";
        resultContainer.innerHTML = `<p class="success-message">${result.message}</p>`;
      } else {
        showToast(result.error || "Error al eliminar", "error");
        resultContainer.innerHTML = `<p class="error-message">${result.error || "Error al eliminar"}</p>`;
      }
    } catch (error) {
      console.error(error);
      showToast("Error al eliminar estudiante", "error");
      resultContainer.innerHTML = "";
    } finally {
      setButtonLoading(btn, false);
    }
  }

  // Vincular eventos
  document.getElementById("registerBtn")?.addEventListener("click", registerStudent);
  document.getElementById("searchByIdBtn")?.addEventListener("click", getStudentById);
  document.getElementById("searchByCareerBtn")?.addEventListener("click", getStudentsByCareer);
  document.getElementById("deleteBtn")?.addEventListener("click", deleteStudent);

  // Vincular eventos para las pestañas de búsqueda
  document.querySelectorAll(".tab-button").forEach(button => {
    button.addEventListener("click", () => {
      showSearchTab(button.dataset.tab);
    });
  });

  loadCareerOptions();
  showSearchTab('byId'); // Mostrar pestaña de búsqueda por ID por defecto
}

// ===============================
// MÓDULO: nuevas-carreras.html
// ===============================

/**
 * Inicializa la página de creación de carreras
 */
function loadNewCareerPage() {
  const form = document.getElementById("newCareerForm");
  const nameInput = document.getElementById("careerName");
  const emojiInput = document.getElementById("careerEmoji");
  const durationInput = document.getElementById("careerDuration");
  const descriptionInput = document.getElementById("careerDescription");
  const categorySelect = document.getElementById("careerCategory");
  const listContainer = document.getElementById("careerListContainer");
  const filterInput = document.getElementById("careerSearchInput");

  /**
   * Carga las categorías en el select
   */
  async function loadCategories() {
    try {
      const response = await fetch(`${API_URL}/categories`, { headers });
      if (!response.ok) throw new Error("Error al cargar categorías");
      const categories = await response.json();
      categorySelect.innerHTML = '<option value="">Selecciona una categoría</option>';
      categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      showToast("Error al cargar categorías", "error");
    }
  }

  /**
   * Carga y muestra la lista de carreras
   */
  async function loadCareersForList() {
    try {
      const response = await fetch(`${API_URL}/careers`, { headers });
      if (!response.ok) throw new Error("Error al cargar carreras");
      const careers = await response.json();
      renderCareerList(careers);
    } catch (error) {
      console.error("Error al cargar carreras:", error);
      listContainer.innerHTML = "<p>Error al cargar las carreras</p>";
      showToast("Error al cargar el listado de carreras", "error");
    }
  }

  /**
   * Renderiza la lista de carreras
   * @param {Array} careers - Lista de carreras
   */
  function renderCareerList(careers) {
    if (!careers || careers.length === 0) {
      listContainer.innerHTML = "<p class='no-results'>No hay carreras registradas.</p>";
      return;
    }

    listContainer.innerHTML = careers.map(career => `
      <div class="career-item">
        <div class="career-header">
          <span class="career-emoji">${career.emoji || "🎓"}</span>
          <strong>${career.name}</strong>
        </div>
        <p><strong>Duración:</strong> ${career.duration || "-"} años</p>
        <p><strong>Categoría:</strong> ${career.category || "-"}</p>
        ${career.description ? `<p>${career.description}</p>` : ""}
        <button class="danger-button" data-id="${career.id}">Eliminar</button>
      </div>
    `).join("");

    // Agregar eventos a botones eliminar
    listContainer.querySelectorAll(".danger-button").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        if (confirm(`¿Estás seguro de eliminar la carrera con ID ${id}?`)) {
          deleteCareer(id);
        }
      });
    });
  }

  /**
   * Valida un campo del formulario
   * @param {HTMLElement} input - Campo a validar
   * @param {string} message - Mensaje de error
   * @returns {boolean} Si el campo es válido
   */
  function validateField(input, message) {
    if (!input) return true;
    if (!input.value.trim()) {
      input.classList.add("input-error");
      input.classList.remove("input-success");
      input.setCustomValidity(message);
      return false;
    } else {
      input.classList.remove("input-error");
      input.classList.add("input-success");
      input.setCustomValidity("");
      return true;
    }
  }

  /**
   * Crea una nueva carrera (POST /api/careers)
   * @param {Event} event - Evento del formulario
   */
  async function createCareer(event) {
    event.preventDefault();

    const isNameValid = validateField(nameInput, "Nombre requerido");
    const isEmojiValid = validateField(emojiInput, "Emoji requerido");
    const isDurationValid = validateField(durationInput, "Duración requerida");
    const isCategoryValid = validateField(categorySelect, "Categoría requerida");

    if (!isNameValid || !isEmojiValid || !isDurationValid || !isCategoryValid) {
      showToast("Por favor completá todos los campos obligatorios", "error");
      return;
    }

    const career = {
      name: nameInput.value.trim(),
      emoji: emojiInput.value.trim(),
      duration: parseInt(durationInput.value),
      category: categorySelect.value,
      description: descriptionInput.value.trim()
    };

    try {
      const response = await fetch(`${API_URL}/careers`, {
        method: "POST",
        headers,
        body: JSON.stringify(career)
      });

      const result = await response.json();

      if (response.ok) {
        showToast(`Carrera "${result.career.name}" creada con éxito`, "success");
        form.reset();
        document.querySelectorAll(".input-success").forEach(el => el.classList.remove("input-success"));
        loadCareersForList();
      } else {
        showToast(result.error || "Error al crear carrera", "error");
      }
    } catch (error) {
      console.error("Error al crear carrera:", error);
      showToast("Error de conexión al guardar carrera", "error");
    }
  }

  /**
   * Elimina una carrera (DELETE /api/careers/:id)
   * @param {string} id - ID de la carrera a eliminar
   */
  async function deleteCareer(id) {
    try {
      const response = await fetch(`${API_URL}/careers/${id}`, {
        method: "DELETE",
        headers
      });
      const result = await response.json();

      if (response.ok) {
        showToast(result.message || "Carrera eliminada correctamente", "success");
        loadCareersForList();
      } else {
        showToast(result.error || "Error al eliminar carrera", "error");
      }
    } catch (error) {
      console.error("Error al eliminar carrera:", error);
      showToast("Error de conexión al eliminar carrera", "error");
    }
  }

  /**
   * Filtra la lista de carreras por texto
   */
  function filterCareers() {
    const filterValue = filterInput.value.trim().toLowerCase();
    const items = document.querySelectorAll(".career-item");

    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(filterValue) ? "block" : "none";
    });
  }

  // Vincular eventos
  form.addEventListener("submit", createCareer);
  filterInput.addEventListener("input", filterCareers);

  // Cargar datos iniciales
  loadCategories();
  loadCareersForList();
}

// ===============================
// MÓDULO: categorias.html
// ===============================

/**
 * Inicializa la página de categorías
 */
function loadCategoryPage() {
  const nameInput = document.getElementById("categoryName");
  const categoryDescriptionInput = document.getElementById("categoryDescription");
  const categoryList = document.getElementById("categoryList");
  const searchInput = document.getElementById("categorySearch");

  /**
   * Obtiene las categorías con conteo de carreras asociadas
   * @returns {Promise<Array>} Lista de categorías
   */
  async function getCategories() {
    try {
      const response = await fetch(`${API_URL}/categories`, { headers });
      if (!response.ok) throw new Error("Error al cargar categorías");
      const categoriesData = await response.json();
      
      const careers = await getAllCareers();
      
      return categoriesData.map(category => ({
        ...category,
        careerCount: careers.filter(career => career.category === category.name).length
      }));
    } catch (error) {
      console.error("Error:", error);
      showToast("❌ Error al cargar categorías", 'error');
      return [];
    }
  }

  /**
   * Renderiza la lista de categorías
   */
  async function renderCategories() {
    categoryList.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando categorías...</p>
      </div>
    `;

    const categories = await getCategories();

    if (categories.length === 0) {
      categoryList.innerHTML = "<p class='no-results'>No hay categorías registradas</p>";
      return;
    }

    categoryList.innerHTML = categories.map((category, index) => `
      <div class="category-card" style="animation-delay: ${index * 0.1}s">
        <div class="category-icon">📂</div>
        <div class="category-info">
          <h3>${category.name}</h3>
          <p class="category-description">${category.description || 'Sin descripción.'}</p>
          <div class="category-meta">
            <span class="meta-item">ID: ${category.id}</span>
            <span class="meta-item">${category.careerCount || 0} carreras</span>
          </div>
        </div>
        <button class="danger-button" data-id="${category.id}" data-name="${category.name}">
          🗑️ Eliminar
        </button>
      </div>
    `).join("");

    // Eventos eliminar
    categoryList.querySelectorAll(".danger-button").forEach(button => {
      const id = button.dataset.id;
      const name = button.dataset.name;
      button.addEventListener("click", () => confirmDeleteCategory(id, name));
    });
  }

  /**
   * Crea una nueva categoría (POST /api/categories)
   */
  async function createCategory() {
    const name = nameInput.value.trim();
    const description = categoryDescriptionInput.value.trim();

    if (!name) {
      nameInput.classList.add("input-error");
      showToast("⚠️ Ingresá un nombre válido", 'error');
      return;
    }

    nameInput.classList.remove("input-error");

    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name, description })
      });

      const result = await response.json();

      if (response.ok) {
        showToast(`✅ Categoría "${result.category.name}" creada con éxito`, 'success');
        nameInput.value = "";
        categoryDescriptionInput.value = "";
        renderCategories();
      } else {
        showToast(`❌ ${result.error || "No se pudo crear la categoría"}`, 'error');
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("❌ Error de conexión al crear categoría", 'error');
    }
  }

  /**
   * Confirma y elimina una categoría (DELETE /api/categories/:id)
   * @param {string} id - ID de la categoría
   * @param {string} name - Nombre de la categoría
   */
  async function confirmDeleteCategory(id, name) {
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return;

    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
        headers
      });

      const result = await response.json();

      if (response.ok) {
        showToast("✅ Categoría eliminada correctamente", 'success');
        renderCategories();
      } else {
        showToast(`❌ ${result.error || "No se pudo eliminar la categoría"}`, 'error');
      }
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      showToast("❌ Error de conexión al eliminar", 'error');
    }
  }

  /**
   * Filtra la lista de categorías por texto
   */
  function filterCategories() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const cards = document.querySelectorAll(".category-card");

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(searchTerm) ? "block" : "none";
    });
  }

  // Eventos
  document.getElementById("addCategoryBtn")?.addEventListener("click", createCategory);
  searchInput?.addEventListener("input", filterCategories);

  // Cargar categorías al iniciar
  renderCategories();
}

// ===============================
// INICIALIZACIÓN POR PÁGINA
// ===============================

/**
 * Detecta la página actual y carga el módulo correspondiente
 */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("registerBtn")) loadRegisterPage();
  if (document.getElementById("careerGrid")) loadCareerPage();
  if (document.getElementById("newCareerForm")) loadNewCareerPage();
  if (document.getElementById("categoryList")) loadCategoryPage();
  if (document.querySelector(".carousel-wrapper")) loadHomePage();
});