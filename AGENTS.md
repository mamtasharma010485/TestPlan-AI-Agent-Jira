# AGENTS.md

## Project Status
This is a new project. The only existing file is `BLAST.md` - a system prompt defining the B.L.A.S.T. protocol and A.N.T. 3-layer architecture for building deterministic automation.

## Key Reference
- **BLAST.md** contains the master system prompt. Follow its initialization protocol before writing code:
  1. Create `task_plan.md`, `findings.md`, `progress.md`
  2. Initialize `gemini.md` as Project Constitution (data schemas, behavioral rules, architectural invariants)
  3. Answer Discovery Questions before coding

## Next Steps (for future agents)
When implementing:
- Use the 3-layer architecture: `architecture/` (SOPs), navigation layer, `tools/` (Python scripts)
- Store credentials in `.env`, use `.tmp/` for intermediate files
- Define JSON data schemas in `gemini.md` before implementing logic
