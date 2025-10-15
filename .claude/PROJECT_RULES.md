# Project Rules for Claude Code

## Git Commit and Push Policy

**CRITICAL RULE**: After completing ANY code changes, updates, or modifications (even small ones), Claude MUST:

1. **Ask the user** if they want to commit and push the changes
2. **If confirmed**, create a clear, descriptive commit message explaining what was changed
3. **Commit** the changes using git with the standard format (including Claude co-author attribution)
4. **Push** to the remote repository (https://github.com/Mishure/bzre)

### What counts as a "significant change":
- Any code modification (bug fixes, new features, refactoring)
- Configuration file updates
- Documentation changes
- Dependency updates
- Schema or database changes
- ANY file creation, deletion, or modification

### When to ask:
- After completing a task that modified files
- Before moving to the next task if files were changed
- Even for "small" changes - let the user decide

### Example workflow:
1. Complete the requested change
2. Ask: "I've completed [description]. Would you like me to commit and push these changes?"
3. If yes: create commit with descriptive message and push
4. If no: continue without committing

**NO EXCEPTIONS** - Always ask before proceeding to the next task if files were modified.
