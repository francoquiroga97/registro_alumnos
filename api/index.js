const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 5001;

// API Key ficticia
const API_KEY = '12345ABCDEF';

// Middleware
app.use(cors());
app.use(express.json());

// Archivo donde se almacenan los estudiantes
const STUDENTS_FILE = './students.json';
const CAREERS_FILE = './careers.json';
const CATEGORIES_FILE = './categories.json';

// Función para leer estudiantes desde archivo
function loadStudents() {
    try {
        const data = fs.readFileSync(STUDENTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading students, using empty list.", error);
        return [];
    }
}

// Función para guardar estudiantes en archivo
function saveStudents(students) {
    try {
        fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2));
    } catch (error) {
        console.error("Error saving students:", error);
    }
}

// Función para leer carreras desde archivo
function loadCareers() {
    try {
        const data = fs.readFileSync(CAREERS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading careers, using empty list.", error);
        return [];
    }
}

// Función para guardar carreras en archivo
function saveCareers(careers) {
    try {
        fs.writeFileSync(CAREERS_FILE, JSON.stringify(careers, null, 2));
    } catch (error) {
        console.error("Error saving careers:", error);
    }
}

// Función para leer categorías desde archivo
function loadCategories() {
    try {
        const data = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error("Error loading categories, using empty list.", error);
        return [];
    }
}

// Función para guardar categorías en archivo
function saveCategories(categories) {
    try {
        fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
    } catch (error) {
        console.error("Error saving categories:", error);
    }
}

// Inicializar estudiantes
let students = loadStudents();

// Inicializar carreras
let careers = loadCareers();

// Inicializar categorías
let categories = loadCategories();

// Middleware para validar API Key
app.use((req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
        return res.status(401).json({ error: 'Unauthorized. Invalid API Key.' });
    }
    next();
});

// ============================
// Endpoints
// ============================

// Registrar nuevo estudiante
app.post('/api/students', (req, res) => {
    const { name, career } = req.body;

    if (!name || !career) {
        return res.status(400).json({ error: "Missing required fields: name and career." });
    }

    const newStudentId = students.length ? students[students.length - 1].id + 1 : 1;

    const newStudent = {
        id: newStudentId,
        name,
        career
    };

    students.push(newStudent);
    saveStudents(students); // Guardar cambios

    return res.status(201).json({ message: "Student registered successfully.", student: newStudent });
});

// Consultar estudiante por ID
app.get('/api/students/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const student = students.find(s => s.id === id);

    if (!student) {
        return res.status(404).json({ error: "Student not found." });
    }

    return res.status(200).json(student);
});

// Consultar estudiantes por carrera
app.get('/api/students', (req, res) => {
    const career = req.query.career;

    if (!career) {
        return res.status(400).json({ error: "Career filter is required." });
    }

    const filtered = students.filter(s => s.career.toLowerCase() === career.toLowerCase());
    return res.status(200).json(filtered);
});

// Eliminar estudiante por ID
app.delete('/api/students/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Student not found for deletion." });
    }

    students.splice(index, 1);
    saveStudents(students); // Guardar cambios

    return res.status(200).json({ message: "Student deleted successfully." });
});

// CRUD para carrera
// Registrar nueva carrera
app.post('/api/careers', (req, res) => {
    const { name, duration, description, category, emoji } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Missing required field: name." });
    }

    const existingCareer = careers.find(c => c.name.toLowerCase() === name.toLowerCase());
    
    if (existingCareer) {
        return res.status(409).json({ error: "Career already exists." });
    }

    const newCareersId = careers.length ? careers[careers.length - 1].id + 1 : 1;

    // Logica para guardar la carrera en el archivo o base de datos
    const newCareer = {
  id: newCareersId,
  name,
  duration,
  description,
  category,
  emoji
};

    careers.push(newCareer);
    saveCareers(careers); // Guardar cambios

    return res.status(201).json({ message: "Career registered successfully.", career: { name } });
});

// Consultar carrera por ID
app.get('/api/careers/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const career = careers.find(c => c.id === id);

    if (!career) {
        return res.status(404).json({ error: "Career not found." });
    }

    return res.status(200).json(career);
});

// Consultar todas las carreras
app.get('/api/careers', (req, res) => {
    const careerName = req.query.name;

    if (careerName) {
        const filteredCareers = careers.filter(c => c.name.toLowerCase() === careerName.toLowerCase());
        return res.status(200).json(filteredCareers);
    }
    return res.status(200).json(careers);
});

// Borrar carrera por ID
app.delete('/api/careers/:id', (req, res) => {
    // === INICIO DE LA MODIFICACIÓN ===
    // Recargar los datos justo antes de usarlos para asegurar que estén actualizados
    students = loadStudents(); // Carga los estudiantes más recientes del archivo
    careers = loadCareers();   // Carga las carreras más recientes del archivo
    // === FIN DE LA MODIFICACIÓN ===

    const id = parseInt(req.params.id);
    const index = careers.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Career not found for deletion." });
    }

    // Verificar si hay estudiantes asociados a la carrera
    const studentsInCareer = students.filter(s => s.career.toLowerCase() === careers[index].name.toLowerCase());
    if (studentsInCareer.length > 0) {
        return res.status(400).json({ error: "Cannot delete career with associated students." });
    }

    careers.splice(index, 1);
    saveCareers(careers); // Guardar cambios

    return res.status(200).json({ message: "Career deleted successfully." });
});

//CRUD para categorías de carreras
app.post('/api/categories', (req, res) => {
    const { name, description } = req.body; // Cambiado de 'emoji' a 'description'

    if (!name) {
        return res.status(400).json({ error: "Missing required field: name." });
    }

    // Verificar si la categoría ya existe (esto ya lo tenías)
    const existingCategory = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingCategory) {
        return res.status(409).json({ error: "Category already exists." });
    }

    const newCategoryId = categories.length ? categories[categories.length - 1].id + 1 : 1;

    const newCategory = {
        id: newCategoryId,
        name,
        description: description || '' // Agregamos 'description'. Si no se proporciona, será una cadena vacía.
    };

    categories.push(newCategory);
    saveCategories(categories); // Guardar cambios

    return res.status(201).json({ message: "Category created successfully.", category: newCategory });
});

// Consultar categoría de carrera por ID
app.get('/api/categories/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const category = categories.find(c => c.id === id);

    if (!category) {
        return res.status(404).json({ error: "Career category not found." });
    }

    return res.status(200).json(category);
});

// Consultar todas las categorías de carreras
app.get('/api/categories', (req, res) => {
    const categoryName = req.query.name;

    if (categoryName) {
        const filteredCategories = categories.filter(c => c.name.toLowerCase() === categoryName.toLowerCase());
        return res.status(200).json(filteredCategories);
    }
    return res.status(200).json(categories);
});

// Borrar categoría de carrera por ID
app.delete('/api/categories/:id', (req, res) => {
    // === INICIO DE LA MODIFICACIÓN ===
    // Recargar los datos justo antes de usarlos para asegurar que estén actualizados
    students = loadStudents(); // Asegurarse de que 'students' esté actualizado
    careers = loadCareers();   // Asegurarse de que 'careers' esté actualizado
    categories = loadCategories(); // Asegurarse de que 'categories' esté actualizado
    // === FIN DE LA MODIFICACIÓN ===

    const id = parseInt(req.params.id);
    const index = categories.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Career category not found for deletion." });
    }

    const categoryToDeleteName = categories[index].name.toLowerCase(); 
    const careersInCategory = careers.filter(c => c.category.toLowerCase() === categoryToDeleteName);
    
    if (careersInCategory.length > 0) {
        return res.status(400).json({ error: "Cannot delete category with associated careers." });
    }

    categories.splice(index, 1);
    saveCategories(categories);

    return res.status(200).json({ message: "Career category deleted successfully." });
});

// ============================
// Start server
// ============================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
