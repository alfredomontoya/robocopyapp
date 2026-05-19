# RobocopyApp - Plan de Desarrollo v3

## Stack Tecnológico

- **Framework**: Electron 33+
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Estilos**: CSS Modules (sin dependencias extra)
- **Testing**: Vitest + Testing Library

## Cambios v3 - Mejoras de Robocopy y UX

### Comando Robocopy Mejorado

**Modo Usuario (todos los usuarios, sin selección):**
```
robocopy "C:\Users\usuario" "destino" /E /ZB /MT:16 /W:1 /R:1 /NP /XJ
  /XD "AppData" "Application Data" "Cookies" "Recent" "OneDrive"
  /XF "NTUSER.DAT" "ntuser.dat.LOG*" "thumbs.db" "desktop.ini" "*.tmp"
```

**Modo Disco:**
```
robocopy "D:\" "destino" /E /ZB /MT:16 /W:1 /R:1 /NP /XJ
```

### Parámetros mejorados

| Parámetro | Razón |
|-----------|-------|
| `/E` | Copia todo incluyendo vacíos, **sin purgar destino** (más seguro que /MIR) |
| `/ZB` | Modo reiniciable, fallback a backup si falla |
| `/MT:16` | 16 hilos paralelos (3-5x más rápido) |
| `/NP` | Sin porcentaje en output (output más limpio) |
| `/XJ` | Excluye junction points (evita loops infinitos) |
| `/XD` | Excluye directorios innecesarios |
| `/XF` | Excluye archivos basura |

### Flujo Actualizado

**Modo Usuario:**
1. Selecciona disco origen
2. La app escanea `<disco>:\Users` y **muestra los directorios** (solo informativo, sin checkboxes)
3. **Se copian TODOS** los usuarios encontrados
4. Destino por defecto: `D:\backup\users` (editable)
5. Cada usuario genera un proceso robocopy independiente en paralelo

**Modo Disco:**
1. Selecciona disco origen
2. Destino por defecto: `D:\backup\disco-<letra>` (editable)
3. Ejecuta un proceso robocopy para toda la unidad

### Correcciones de UI

**Barra de progreso:**
- Se muestra en cada TaskCard durante la ejecución
- Parsing del output de robocopy para estimar progreso
- Barra ASCII `[████████░░░░░░░░] 60%`

**Consola - Siempre ver última línea:**
- Auto-scroll automático al final
- Mantiene solo las últimas 50 líneas visibles (evita saturación de memoria)
- Output limpio gracias a `/NP`
- Cursor parpadeante siempre visible al final

## Estructura de Archivos

```
robocopyapp/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── electron-builder.json
├── electron/
│   ├── main.ts              # Proceso principal Electron
│   └── preload.ts           # Bridge seguro renderer <-> main
├── src/
│   ├── main.tsx             # Entry point React
│   ├── App.tsx              # Componente raíz
│   ├── components/
│   │   ├── ConsolePanel.tsx      # Panel con múltiples consolas
│   │   ├── ModeSelector.tsx      # Selector modo copia
│   │   ├── DiskSelector.tsx      # Selector de disco disponible
│   │   ├── UserDirList.tsx       # Lista informativa de usuarios (sin checkboxes)
│   │   ├── ConfigPanel.tsx       # Panel configuración robocopy
│   │   ├── ProgressBar.tsx       # Barra de progreso estilo consola
│   │   └── TaskCard.tsx          # Tarjeta de tarea con progreso
│   ├── hooks/
│   │   ├── useRobocopy.ts        # Lógica de ejecución robocopy (multi-tarea)
│   │   ├── useConfig.ts          # Gestión configuración global
│   │   ├── useConsole.ts         # Gestión output de consola (max 50 líneas)
│   │   ├── useDisks.ts           # Detección de discos disponibles
│   │   └── useUserDirs.ts        # Escaneo de directorios de usuario
│   └── styles/
│       ├── global.css            # Estilos globales CRT
│       └── amber-theme.css       # Tema ámbar sobre negro
└── tests/
    ├── hooks/
    │   ├── useRobocopy.test.ts
    │   ├── useConfig.test.ts
    │   └── useConsole.test.ts
    └── components/
        └── Console.test.tsx
```

## Notas de Implementación

- `/E` en lugar de `/MIR` para backups seguros (no borra en destino)
- `/MT:16` para velocidad multi-hilo
- `/NP` para output limpio sin porcentajes
- `/XJ` para evitar junction points
- Todos los usuarios se copian automáticamente, sin selección manual
- Consola mantiene últimas 50 líneas con auto-scroll
- Barra de progreso visible en cada TaskCard
- Destinos por defecto editables
- App portable, sin instalación requerida
