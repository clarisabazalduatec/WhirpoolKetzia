Aquí tienes una explicación completa y detallada de todas las APIs en tu proyecto, organizada por categorías. Esta información se basa en el análisis de los archivos de rutas en api.

---

## **Autenticación y Gestión de Usuarios**

### [/api/auth/[...nextauth]/route.js](src/app/api/auth/[...nextauth]/route.js)
- **Métodos**: GET, POST
- **Propósito**: Integración OAuth2 con NextAuth.js para Google
- **Funcionalidad**:
  - Autentica usuarios vía Google (soporta dominios @gmail.com y @whirlpool.com)
  - Crea automáticamente usuarios en la base de datos si no existen
  - Retorna sesión con `usuario_id` y `rol_id`
- **Flujo de Datos**: 
  - Entrada: Credenciales OAuth de Google
  - Salida: Objeto de sesión con metadatos del usuario
- **Códigos de Estado**: 200 (éxito)

### /api/login/route.js
- **Método**: POST
- **Endpoint**: `/api/login`
- **Propósito**: Autenticación tradicional con email/contraseña
- **Espera**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Retorna**:
  ```json
  {
    "message": "Login exitoso",
    "user": {
      "id": 1,
      "nombre": "John Doe",
      "rol": 2,
      "pfp": "profile_pic_url"
    }
  }
  ```
- **Códigos de Estado**: 200 (éxito), 401 (credenciales inválidas), 500 (error)

### /api/registro/route.js
- **Método**: POST
- **Endpoint**: `/api/registro`
- **Propósito**: Registro de usuario con hash bcrypt
- **Espera**:
  ```json
  {
    "nombre": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "rol_id": 2
  }
  ```
- **Retorna**: Mensaje de éxito/error
- **Validación**: Email único; todos los campos requeridos
- **Códigos de Estado**: 201 (creado), 400 (error de validación), 500 (error)

### /api/usuario/route.js
- **Método**: GET
- **Endpoint**: `/api/usuario?id={usuarioId}`
- **Propósito**: Obtener nombre de usuario por ID
- **Retorna**: `{ nombre: "John Doe" }`
- **Códigos de Estado**: 200, 400 (ID faltante), 404 (no encontrado)

### /api/perfil/route.js
- **Métodos**: GET, PUT
- **Endpoint**: `/api/perfil`
- **Funcionalidad GET**:
  - Obtiene perfil completo con estadísticas
  - Parámetro: `id={usuarioId}`
  - Retorna datos de usuario, rol, estadísticas de cursos inscritos y cursos inscritos
- **Funcionalidad PUT**:
  - Actualiza perfil de usuario
  - Espera:
    ```json
    {
      "usuario_id": 1,
      "alias": "username",
      "pfp": "profile_url"
    }
    ```
  - Actualiza alias y/o foto de perfil
- **Retorna GET**:
  ```json
  {
    "usuario": { ...datos de usuario },
    "stats": { "total_inscritos": 5, "total_completados": 2 },
    "cursos": [ {...cursos inscritos} ]
  }
  ```

---

## **Gestión de Cursos**

### /api/cursos/route.js
- **Método**: GET
- **Endpoint**: `/api/cursos?usuario_id={usuarioId}`
- **Propósito**: Obtener cursos inscritos del usuario con progreso
- **Retorna**: Array de cursos con:
  - Metadatos del curso (título, descripción, imagen)
  - `total_archivos`: conteo de archivos en el curso
  - `archivos_vistos`: archivos vistos por el usuario
  - `tiene_quiz`: si el curso tiene quizzes
  - `quiz_aprobado`: si el usuario aprobó el quiz
  - `porcentaje`: porcentaje de completitud
  - `completado`: booleano (100% = completado)

### /api/cursos/detalle/route.js
- **Método**: GET
- **Endpoint**: `/api/cursos/detalle?curso_id={id}&usuario_id={id}`
- **Propósito**: Obtener información detallada del curso con currículo y progreso del usuario
- **Retorna**:
  ```json
  {
    "curso": { ...datos del curso, total_inscritos, total_graduados },
    "items": [ {id_contenido, titulo, tipo (archivo|quiz), orden, completado} ],
    "porcentaje": 45,
    "esCompletado": false
  }
  ```

### /api/cursos/usuario/route.js
- **Método**: GET
- **Endpoint**: `/api/cursos/usuario?usuario_id={id}`
- **Propósito**: Verificar si el usuario completó cursos
- **Retorna**: Array de todos los cursos con flag `esCompletado`

---

## **Gestión de Quizzes**

### /api/quiz/detalle/route.js
- **Método**: GET
- **Endpoint**: `/api/quiz/detalle?quiz_id={id}`
- **Propósito**: Recuperar preguntas y opciones del quiz (claves de respuesta ocultas)
- **Retorna**:
  ```json
  {
    "quiz_id": 1,
    "titulo": "Math Quiz",
    "descripcion": "...",
    "preguntas": [
      {
        "pregunta_id": 1,
        "texto_pregunta": "What is 2+2?",
        "opciones": [
          { "opcion_id": 1, "texto_opcion": "3" },
          { "opcion_id": 2, "texto_opcion": "4" }
        ]
      }
    ]
  }
  ```

### /api/quiz/evaluar/route.js
- **Método**: POST
- **Endpoint**: `/api/quiz/evaluar`
- **Propósito**: Enviar respuestas del quiz y calcular calificación
- **Espera**:
  ```json
  {
    "usuario_id": 1,
    "quiz_id": 5,
    "curso_id": 3,
    "respuestas": { "pregunta_id": "opcion_id", ... }
  }
  ```
- **Lógica**:
  - Compara respuestas con opciones correctas
  - Calcula porcentaje de calificación
  - Verifica si cumple con `puntos_minimos` (por defecto 80)
  - Inserta automáticamente en tabla `Completaciones` si el curso está completo
  - Verifica si todo el curso está completado (todos los archivos vistos + quiz aprobado)
- **Retorna**:
  ```json
  {
    "calificacion": 85,
    "aprobado": true,
    "cursoCompletado": false
  }
  ```

---

## **Rutas de Administrador**

### /api/admin/dashboard/route.js
- **Método**: GET
- **Endpoint**: `/api/admin/dashboard`
- **Propósito**: Obtener todos los cursos del catálogo para vista de admin
- **Retorna**: Array de todos los cursos con creador y metadatos

### /api/admin/stats/route.js
- **Método**: GET
- **Endpoint**: `/api/admin/stats`
- **Propósito**: Obtener analíticas de toda la plataforma
- **Retorna**:
  ```json
  {
    "totalAlumnos": 150,
    "totalCursos": 25,
    "tasaCompletado": 65,
    "promedioQuiz": 78
  }
  ```

### /api/admin/cursos/route.js
- **Método**: POST
- **Endpoint**: `/api/admin/cursos`
- **Propósito**: Crear nuevo curso con archivos y quizzes
- **Espera**:
  ```json
  {
    "titulo": "Python Basics",
    "descripcion": "Learn Python",
    "descripcionCorta": "Python course",
    "imagenSrc": "image_url",
    "archivosSeleccionados": [1, 2, 3],
    "quizzesSeleccionados": [5, 6],
    "creado_por": 1
  }
  ```
- **Proceso**: Usa transacciones para crear curso, enlazar archivos y quizzes con orden
- **Retorna**: `{ success: true, curso_id: 42 }`

### [/api/admin/cursos/[id]/route.js](src/app/api/admin/cursos/[id]/route.js)
- **Método**: DELETE
- **Endpoint**: `/api/admin/cursos/{courseId}`
- **Propósito**: Eliminar curso (cascada a registros relacionados si FK configurado)
- **Retorna**: `{ success: true, message: "Curso deleted" }`

### /api/admin/archivos/route.js
- **Métodos**: GET, POST
- **Endpoint**: `/api/admin/archivos`
- **GET**:
  - Retorna todos los archivos en la biblioteca
  - Ordenados por fecha de subida descendente
- **POST**:
  - Subir archivo a la biblioteca
  - Espera:
    ```json
    {
      "nombre_archivo": "Lesson1.pdf",
      "tipo_archivo": "pdf",
      "descripcion": "Introduction",
      "url_archivo": "https://storage.example.com/file.pdf"
    }
    ```
  - Retorna: `{ success: true, archivo_id: 10 }`

### /api/admin/usuarios/route.js
- **Método**: GET
- **Endpoint**: `/api/admin/usuarios`
- **Propósito**: Obtener lista de usuarios inscritos (para asignación en gestión de cursos)
- **Retorna**: Array con formato `value` (ID) y `label` (nombre)

### /api/admin/asignar/route.js
- **Métodos**: GET, POST, DELETE
- **Endpoint**: `/api/admin/asignar`
- **GET** (con parámetro `curso_id`):
  - Retorna usuarios disponibles para inscribir y ya inscritos
  - Ambas listas con detalles de usuario
- **POST**:
  - Inscribir usuario en curso
  - Espera: `{ usuario_id: 1, curso_id: 5 }`
- **DELETE**:
  - Remover usuario del curso
  - Espera: `{ usuario_id: 1, curso_id: 5 }`

### /api/admin/quizzes/route.js
- **Métodos**: GET, POST
- **Endpoint**: `/api/admin/quizzes`
- **GET**: Retorna todos los quizzes con conteo de preguntas
- **POST**: Crear quiz con preguntas y opciones
- **Espera**:
  ```json
  {
    "titulo": "Math Quiz",
    "descripcion": "Basic math",
    "preguntas": [
      {
        "texto": "What is 2+2?",
        "opciones": ["3", "4", "5", "6"],
        "respuestaCorrecta": 1
      }
    ]
  }
  ```
- **Proceso**: Usa transacción; inserta quiz → preguntas → opciones con respuesta correcta marcada

---

## **Características Comunitarias/Sociales**

### /api/comunidad/route.js
- **Métodos**: GET, POST
- **Parámetros GET**: `limit` (por defecto 5), `offset` (por defecto 0), `myId` (usuario actual)
- **Funcionalidad GET**:
  - Publicaciones paginadas con info de usuario
  - Incluye conteos de likes y estado de like del usuario
  - Carga comentarios para cada publicación
  - Puede asociar con "gemas" (notas/marcadores)
- **Retorna**:
  ```json
  [
    {
      "publicacion_id": 1,
      "titulo": "Post title",
      "contenido": "Post content",
      "usuario_id": 5,
      "nombre": "John",
      "pfp": "url",
      "totalLikes": 10,
      "iLiked": 1,
      "gema": { "gema_id": 2, "titulo": "...", "descripcion": "..." },
      "comentarios": [ {...} ]
    }
  ]
  ```
- **POST**:
  - Crear nueva publicación
  - Espera: `{ usuario_id, titulo, contenido, gema_id }`

### /api/comentarios/route.js
- **Método**: POST
- **Endpoint**: `/api/comentarios`
- **Propósito**: Agregar comentario a publicación y notificar al propietario
- **Espera**:
  ```json
  {
    "usuario_id": 1,
    "publicacion_id": 3,
    "contenido": "Nice post!"
  }
  ```
- **Retorna**: `{ success: true, comentario_id: 42 }`
- **Efectos Secundarios**: Crea notificación para el propietario de la publicación

### /api/likes/route.js
- **Método**: POST
- **Endpoint**: `/api/likes`
- **Propósito**: Alternar like en publicación o comentario
- **Espera**:
  ```json
  {
    "usuario_id": 1,
    "id": 10,
    "tipo": "post" | "comentario"
  }
  ```
- **Lógica**:
  - Si ya liked: elimina like, retorna `{ liked: false }`
  - Si no liked: inserta like, crea notificación para el propietario
- **Retorna**: `{ liked: true/false }`

### /api/gemas/route.js
- **Métodos**: GET, POST, PUT, DELETE
- **Endpoint**: `/api/gemas`
- **Propósito**: Sistema de notas/marcadores personales (máx 10 por usuario)
- **GET** (con `usuario_id`):
  - Retorna gemas del usuario ordenadas por fecha de creación
- **POST**:
  - Crear gema
  - Espera: `{ usuario_id, titulo, descripcion }`
  - Aplica límite de 10 gemas por usuario
- **PUT**:
  - Actualizar gema
  - Espera: `{ gema_id, usuario_id, titulo, descripcion }`
- **DELETE** (con parámetros `gema_id` y `usuario_id`):
  - Eliminar gema específica

---

## **Notificaciones**

### /api/notificaciones/route.js
- **Métodos**: GET, PUT
- **GET** (con `usuario_id`):
  - Retorna 20 notificaciones más recientes ordenadas por fecha
  - Incluye: like_post, like_comentario, comentario
- **PUT**:
  - Marcar todas las notificaciones como leídas
  - Espera: `{ usuario_id }`

---

## **Seguimiento de Progreso**

### /api/progreso/route.js
- **Método**: POST
- **Endpoint**: `/api/progreso`
- **Propósito**: Rastrear visualización de archivos y marcar completitud automática de curso
- **Espera**:
  ```json
  {
    "usuario_id": 1,
    "curso_id": 3,
    "archivo_id": 15
  }
  ```
- **Lógica**:
  - Registra archivo como visto (por curso)
  - Calcula porcentaje de completitud
  - Si el curso tiene quiz: espera aprobación del quiz
  - Marca curso completo automáticamente cuando todos los archivos vistos + quiz aprobado
- **Retorna**:
  ```json
  {
    "completado": false,
    "progreso": "5/8",
    "porcentaje": 62,
    "necesitaQuiz": true
  }
  ```

---

## **Gestión de Archivos**

### [/api/archivos/[id]/route.js](src/app/api/archivos/[id]/route.js)
- **Método**: GET
- **Endpoint**: `/api/archivos/{fileId}`
- **Propósito**: Obtener metadatos del archivo para visor
- **Retorna**:
  ```json
  {
    "archivo_id": 15,
    "nombre_archivo": "Lesson1.pdf",
    "url_archivo": "https://...",
    "tipo_archivo": "pdf",
    "curso_id": 3,
    "curso_titulo": "Python Basics"
  }
  ```

---

## **Chat con IA**

### /api/chat/route.js
- **Método**: POST
- **Endpoint**: `/api/chat`
- **Propósito**: Chatbot con IA Gemini consciente del contexto de cursos
- **Espera**:
  ```json
  {
    "prompt": "What courses do you have?",
    "contextoCursos": "List of courses...",
    "historial": [ {role: "user", parts: [{text: "..."}]}, ... ],
    "nombreUsuario": "John"
  }
  ```
- **Características**:
  - Usa modelo Gemini 3.1 Flash
  - Instrucción de sistema asegura uso solo de conocimiento de cursos
  - Saluda al usuario solo en el primer mensaje
  - Mantiene historial de conversación
- **Retorna**: `{ text_content: "AI response..." }`

---

## **Tabla Resumen**

| Categoría | Rutas | Métodos HTTP |
|-----------|-------|--------------|
| **Auth & Usuarios** | 5 | GET, POST, PUT |
| **Cursos** | 3 | GET, POST, DELETE |
| **Quizzes** | 2 | GET, POST |
| **Admin** | 7 | GET, POST, DELETE |
| **Comunidad** | 4 | GET, POST |
| **Notificaciones** | 1 | GET, PUT |
| **Progreso** | 1 | POST |
| **Archivos** | 1 | GET |
| **Chat** | 1 | POST |
| **Total** | **26** | GET, POST, PUT, DELETE |

La API usa MySQL (vía TiDB) para persistencia, bcrypt para hash de contraseñas y Gemini AI para respuestas de chat inteligentes.