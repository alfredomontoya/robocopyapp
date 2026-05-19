# RobocopyApp

Desktop Electron app for robocopy backups with retro amber CRT UI.

## Commands

```
npm run dev          # Start dev server + Electron (port 5173)
npm run build        # tsc → vite build → electron-builder → release/*.exe
npx vitest run       # Run all tests
npx tsc --noEmit     # Type check only
```

Build order matters: `tsc` must pass before `vite build`.

## Architecture

```
electron/          # Main process (IPC, robocopy spawn, disk detection)
src/               # React renderer (components, hooks, styles)
tests/             # Vitest + jsdom tests
dist/              # Built renderer
dist-electron/     # Built main + preload
release/           # Packaged .exe (portable)
```

- **Path alias**: `@/*` → `src/*`
- **CSS**: CSS Modules (`*.module.css`)
- **TypeScript**: `strict`, `noUnusedLocals`, `noUnusedParameters`

## Electron IPC

Main process exposes via `preload.ts` / `contextBridge`:
- `getDisks()` → detects drives via `fsutil`, fallback `wmic`
- `getUserDirs(diskLetter)` → scans `<disk>:\Users`
- `executeRobocopy({ taskId, source, destination, options })`
- `cancelRobocopy(taskId)`
- `onOutput(callback)` / `onComplete(callback)` → stream events per taskId

Multiple robocopy processes run in parallel, tracked by `taskId` in a Map.

## CRITICAL: Spawning robocopy

**Never use `shell: true` with `spawn('robocopy', ...)`**. It causes `cmd.exe` to merge the args array into a single string, breaking parsing.

**Never include literal quotes in args**. `spawn` passes each array element as a separate argument; quotes become part of the filename.

```typescript
// CORRECT
const args = [source, destination, ...options]
const child = spawn('robocopy', args, { windowsHide: true })

// WRONG — shell merges args, quotes become literal
spawn('robocopy', [`"${source}"`, ...options], { shell: true })
```

## Admin privileges

- **Production**: `electron-builder.json` sets `requestedExecutionLevel: "requireAdministrator"`. Windows shows UAC prompt once at launch.
- **Development**: Auto-restart is disabled. App logs a warning and continues. Some robocopy operations may fail without admin. To test with full permissions, run your terminal as Administrator then `npm run dev`.

## Robocopy defaults

Command: `/E /ZB /MT:16 /W:1 /R:1 /NP /XJ`

- `/E` — recursive copy including empty dirs (no purge, safer than `/MIR`)
- `/ZB` — restartable mode with backup fallback
- `/MT:16` — 16 parallel threads
- `/NP` — no progress percentage (cleaner output)
- `/XJ` — exclude junction points (prevents infinite loops)

**Always excluded**: `AppData`, `Application Data`, `Cookies`, `Recent`, `OneDrive`, `NTUSER.DAT`, `ntuser.dat.LOG*`, `thumbs.db`, `desktop.ini`, `*.tmp`

**Cache exclusion toggle** (`excludeCaches: true` by default): excludes `.cache`, `.cargo`, `.codex`, `.devdb`, `.lmstudio`, `.ollama`, `.overture`, `.quokka`, `.rustup`, `.VirtualBox`

## Two copy modes

| Mode | Source | Destination (default) |
|------|--------|----------------------|
| **user** | Selected dirs from `<disk>:\Users` | `D:\backup\users\<user>` (per user) |
| **disk** | Entire `<disk>:\` | `D:\backup\disco-<letter>` |

User mode: user selects which `C:\Users\<name>` dirs to copy via checkboxes. Each selected user spawns a separate robocopy task.

## Config persistence

`localStorage` key: `robocopy-config`. Stores mode, disk, destination, selectedUsers, and all options.

## Console output

`useConsole` caps at 50 lines (drops oldest). Auto-scrolls to bottom on every update.

## Testing

- **Framework**: Vitest 2.x with `jsdom` environment
- **Setup**: `tests/setup.ts` mocks `window.electronAPI` with `vi.fn()`
- **Globals**: `describe`, `it`, `expect`, `vi` are global
- **Path alias**: `@/*` works in tests via `vitest.config.ts`
- Tests for hooks use `renderHook` from `@testing-library/react`
- Component tests use `@testing-library/react` with CSS module class matching (use `className.match(/pattern/)` not `toHaveClass('literal')`)
