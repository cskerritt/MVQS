# Legacy Executable Analysis

## Files analyzed
- `/Users/chrisskerritt/Dropbox/My Mac (chriss-MacBook-Pro.local)/Downloads/MVQS (1)/1MVQS2017.EXE`
  - SHA-256: `d6519f4dd98c5db731ff8de37d6031244a0896dfa7e52537b7fdc03a6faaad88`
  - Type: `PE32 executable (GUI) Intel 80386`
- `/Users/chrisskerritt/Dropbox/My Mac (chriss-MacBook-Pro.local)/Downloads/MVQS (1)/Jobbanks/_MVQS2016.exe`
  - SHA-256: `9bdbd76b763cab501f2ccf5a6d4f5eb6b9505034bfb96f01e2f6906774b42510`
  - Type: `PE32 executable (GUI) Intel 80386`

## Key findings

### `_MVQS2016.exe`
- Classic Borland Delphi Win32 app (registry strings include `SOFTWARE\\Borland\\Delphi\\RTL`).
- String evidence shows this EXE is a launcher/menu shell, not the full matching engine.
- Launch actions recovered from strings:
  - `\MVQS2016.MDE`
  - `\VDARE16.exe`
  - `\Volcano16.exe`
- UI artifacts indicate a simple "Program Selection" screen with button handlers (`butMVQSClick`, `butVDAREClick`).

### `1MVQS2017.EXE`
- Large PE32 executable with 2004 PE timestamp and TrainerSoft/Digital Trainer strings.
- String evidence indicates this is a legacy packaged runtime/distribution wrapper (course/player/printing/licensing components), not the authoritative MVQS domain model.
- Contains heavy generic runtime strings (printing/menu/runtime dialogs), plus `DT50LIC.*` and `TrainerSoft` references.

## Where the real business data/logic lives
- Access databases (`.mdb` / `.mde`), especially:
  - `MVQS2016.mdb` (DOTTS/task metadata)
  - `jcontrol.mdb` (state/county/ECLR lookups)
  - state/province job bank MDBs (`Texas.mdb`, `California.mdb`, etc.)
- Flat reference datasets:
  - `DOTTitle.prn`
  - `DOTDesc.PRN`
  - `DOTVar.prn` (24-trait requirement vectors)
  - `DOTSkills.prn`, `DOTPop.prn`, `DOTDis.prn`
- Delphi source stubs are present for menu launchers (e.g. `MVQS2017.dpr`, `VocUnit.pas`, `VocUnit.dfm`).

## Conversion implication
- Direct binary-to-modern conversion is not practical.
- Practical path is data + behavior reconstruction from MDB/PRN/manuals, then a full modern rewrite.
- This repository now includes that rewrite baseline (data migration + API + modern UI).

## Additional dataset package (`MVQS_Database 2`)
- Newer Access backend package is supported:
  - `MVQS_DC_Data.accdb`
  - `MVQS_DC_Data_JobBank.accdb`
- These sources provide:
  - `tblXLU_Occupations` (`12,975` occupations)
  - `tblXLU_Occupations_Transferrable_Skills` (`119,354` task rows)
  - `tblJob_Bank` (`3,389,832` jobbank rows)
- The importer now supports `--source dc` and auto-detection via `--source auto`.
