ESTRUCTURA GENERAL

Mi app cuenta con un Home (index.html) bien basico e intuitivo, con un carrusel de imagenes, botenes que te llevan a Registrar un nuevo estudiante o a Visualizar las carreras disponibles, y un navbar que te da otra opcion de desplazarte por la app, y de ingresar a la pagina de Samba.

La pagina Carreras (carreras.html) cumple una funcion meramente informativa, mostrando las carreras disponibles y creadas hasta el momento. En ella se pueden ver todas las carreras con su respectiva informacion academica, y la opcion de buscarlas por nombre o separalas por categoria.

En registro de estudiantes (registro.html) podemos registrar, buscar o eliminar un estudiante por carrera o id, y tenemos una nueva opcion en navbar de Nueva carrera.

En Nueva Carrera (nuevas-carreras.html) tenemos la posibilidad de Crear una carrera y asignarle un nombre, duracion, categoria, descripcion breve y emoji representativo. Tambien esta disponible la opción de buscarlas y/o eliminarlas. En esta pagina, el navbar nos disponibiliza la opcion de acceder a Categorias.

Dentro de Categorias (categorias.html) podremos crear nuevas categorias (dándoles un nombre y una descripcion opcional), que luego estaran disponibles en el resto de la app. Ademas de poder buscarlas y/o eliminar.

Cada elemento tiene su ID unico asignado de manera correlativa, y se guarda en su respectivo archivo.json
Una carrera no puede ser eliminada si contiene un estudiante registrado en ella, y de igual manera no podremos eliminar una categoria si contiene carreras registradas.
Todo el script y style estan correctamente ubicados en app.js y styles1.css y no hay codigo embebido en html.

UTILIZACION DE LA IA

A la hora de realizar este proyecto, tuve en cuenta principalmente 3 modelos de IA, Chat-GPT, Gemini, y DeepSeek. En un comienzo la mayor parte de la estructura principal
de mi app fue diseñada con chat-gpt, pero al ir creciendo el proyecto note que chat se enredaba un poco entre tanto codigo y archivo, ademas su limite diario era tambien un problema.
Luego comence a probar con DeepSeek que me dio un muy buen resultado en lo que es codigo y compresion de texto. Pero tambien tenia grandes problemas a partir de cierta cantidad de prompts.
Por ultimo decidi probar con Gemini de Google, la cual me sorprendio positivamente en muechos aspectos: Rapides, buena comprension a la hora de continuar con el hilo de la charla,
y buen limite diario (posibilidad de subir muchos archivos y gran cantidad de prompts).
Esta ultima, Gemini, la utilice en su mayoria para terminar de pulir el proyecto a nivel funcionabilidad en app.js y Estilo (aunque quedan cosas por mejorar) muy cercano a lo que pretendia.
Si bien mi proyecto fue mutando a lo largo de las clases, creo que pude darle forma y representa lo que imaginaba de un principio, con un estilo personalizado a mi manera y un tanto diferente al resto, gracias a estas 3 IAs.

UTILIZACION DE PROMPTS

Al momento de promptear, note una gran diferencia en la utilizacion de ciertas palabras, con un lenguaje mas tecnico y bien dirigido. Tambien comprendi lo crucial que es identificar medianamente el problema antes de promptear, para evitar una comprension de incorrecta de la IA y por ende malos resultados, que derivan luego en mas problemas que al principio.

ALUMNO: FRANCO QUIROGA
CARRERA: CIENCIA DE DATOS E IA
PROFESOR: SANTIAGO CHIALE