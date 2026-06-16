# Test Migration Architecture: Moving Tests from `src` to Root-Level `tests`

## Executive Summary

This architecture documents the technical approach for moving all test files from `src/` directories to a root-level `tests/` folder. The migration involves 6 test files currently located in:
- `src/utils/` (4 files)
- `src/core/utils/` (1 file) 
- `src/core/services/` (1 file)

**Goal**: Restructure test organization while maintaining 100% test functionality and import compatibility.

## Current State Analysis

### Existing Test Files

1. **src/utils/** (4 tests):
   - `goalProgress.test.ts` (imports: `../core/services/goalService`, `../core/db/types`)
   - `goalUtils.test.ts` (imports: `./goalUtils`)
   - `progressUtils.test.ts` (imports: `./progressUtils`, `./dateUtils`, `../core/db/types`)
   - `validation.test.ts` (imports: `./validation`)

2. **src/core/utils/** (1 test):
   - `dateUtils.test.ts` (imports: `./dateUtils`)

3. **src/core/services/** (1 test):
   - `streakLogic.test.ts` (imports: `../utils/dateUtils`)

### Current Configuration

**vitest.config.ts**:
```typescript
include: ['src/**/*.test.ts', 'src/**/*.test.tsx']
```

**tsconfig.json**:
```json
"include": ["src"]
```

## Migration Strategy

### Phase 1: Directory Structure Creation

Create new directory structure mirroring `src` hierarchy:

```
tests/
├── utils/
│   ├── goalProgress.test.ts
│   ├── goalUtils.test.ts
│   ├── progressUtils.test.ts
│   └── validation.test.ts
└── core/
    ├── utils/
    │   └── dateUtils.test.ts
    └── services/
        └── streakLogic.test.ts
```

### Phase 2: Import Path Calculations

The critical challenge is updating import paths to work from the new locations. Here are the calculations:

#### Test File: `tests/utils/goalProgress.test.ts`
**Current imports** (from `src/utils/`):
```typescript
import { calculateProgress } from '../core/services/goalService';
import { Goal, Session } from '../core/db/types';
```

**New imports** (from `tests/utils/`):
```typescript
import { calculateProgress } from '../../src/core/services/goalService';
import { Goal, Session } from '../../src/core/db/types';
```

**Path calculation**: 
- Old: `../core/` = up 1 level from `src/utils/` to `src/`, then into `core/`
- New: `../../src/core/` = up 2 levels from `tests/utils/` to root, then into `src/core/`

#### Test File: `tests/utils/goalUtils.test.ts`
**Current imports** (from `src/utils/`):
```typescript
import { getPeriodStart, getPeriodEnd, isDateInPeriod, isPeriodComplete } from './goalUtils';
```

**New imports** (from `tests/utils/`):
```typescript
import { getPeriodStart, getPeriodEnd, isDateInPeriod, isPeriodComplete } from '../../src/utils/goalUtils';
```

**Path calculation**: 
- Old: `./goalUtils` = same directory as test in `src/utils/`
- New: `../../src/utils/goalUtils` = up 2 levels from `tests/utils/` to root, then into `src/utils/`

#### Test File: `tests/utils/progressUtils.test.ts`
**Current imports** (from `src/utils/`):
```typescript
import { calculateTodayTotal, calculateTodayBreakdown, calculateWeeklyData } from './progressUtils';
import { Session } from '../core/db/types';
import { formatDate, getWeekStart } from './dateUtils';
```

**New imports** (from `tests/utils/`):
```typescript
import { calculateTodayTotal, calculateTodayBreakdown, calculateWeeklyData } from '../../src/utils/progressUtils';
import { Session } from '../../src/core/db/types';
import { formatDate, getWeekStart } from '../../src/utils/dateUtils';
```

#### Test File: `tests/utils/validation.test.ts`
**Current imports** (from `src/utils/`):
```typescript
import { validateZikrName, isDuplicateZikrName, validateCount } from './validation';
```

**New imports** (from `tests/utils/`):
```typescript
import { validateZikrName, isDuplicateZikrName, validateCount } from '../../src/utils/validation';
```

#### Test File: `tests/core/utils/dateUtils.test.ts`
**Current imports** (from `src/core/utils/`):
```typescript
import { formatDate, formatTime, daysBetween, isToday, isYesterday, combineDateTime } from './dateUtils';
```

**New imports** (from `tests/core/utils/`):
```typescript
import { formatDate, formatTime, daysBetween, isToday, isYesterday, combineDateTime } from '../../../src/core/utils/dateUtils';
```

**Path calculation**: 
- Old: `./dateUtils` = same directory as test in `src/core/utils/`
- New: `../../../src/core/utils/dateUtils` = up 3 levels from `tests/core/utils/` to root, then into `src/core/utils/`

#### Test File: `tests/core/services/streakLogic.test.ts`
**Current imports** (from `src/core/services/`):
```typescript
import { daysBetween } from '../utils/dateUtils';
```

**New imports** (from `tests/core/services/`):
```typescript
import { daysBetween } from '../../../src/core/utils/dateUtils';
```

**Path calculation**: 
- Old: `../utils/` = up 1 level from `src/core/services/` to `src/core/`, then into `utils/`
- New: `../../../src/core/utils/` = up 3 levels from `tests/core/services/` to root, then into `src/core/utils/`

### Phase 3: Configuration Updates

#### vitest.config.ts Update

**Current**:
```typescript
export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
```

**Updated**:
```typescript
export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
```

#### tsconfig.json Update

**Current**:
```json
{
  "compilerOptions": { ... },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Updated**:
```json
{
  "compilerOptions": { ... },
  "include": ["src", "tests"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Phase 4: File Migration Execution

**Step-by-step process**:

1. Create directory structure:
```bash
mkdir -p tests/utils
mkdir -p tests/core/utils  
mkdir -p tests/core/services
```

2. Move files with import updates:
```bash
# For each file, update imports THEN move
# 1. Update imports in src/utils/goalProgress.test.ts
# 2. Move to tests/utils/goalProgress.test.ts
# 3. Remove original file
```

### Phase 5: Validation Strategy

#### Automated Validation

1. **Run all tests**:
```bash
npm test
```
Expected: All 6 test files run successfully with no failures

2. **Run tests in watch mode**:
```bash
npm run test:watch
```
Expected: All tests run and watch mode functions correctly

3. **Run tests with UI**:
```bash
npm run test:ui
```
Expected: Vitest UI loads and shows all tests passing

#### Manual Validation Checks

1. **Import resolution verification**: 
   - Verify all imports resolve correctly
   - No TypeScript errors in test files
   - No runtime import errors

2. **Test coverage verification**:
   - Ensure same test coverage as before migration
   - No tests are "lost" in the move

3. **File structure verification**:
   - All test files exist in new locations
   - No test files remain in `src/` directories

#### Rollback Strategy

If migration fails:
1. Restore from git: `git checkout src/`
2. Remove `tests/` directory: `rm -rf tests/`
3. Restore configs: `git checkout vitest.config.ts tsconfig.json`

## Risk Assessment & Mitigation

### High-Risk Areas

1. **Import Path Breakage**
   - **Risk**: Tests fail to find source modules
   - **Mitigation**: Systematic import path calculation with examples
   - **Validation**: Run TypeScript compilation before moving files

2. **Configuration Misses**
   - **Risk**: Vitest doesn't find test files in new location
   - **Mitigation**: Update both vitest.config.ts and tsconfig.json
   - **Validation**: Test vitest config with `--reporter=verbose` flag

### Medium-Risk Areas

1. **Directory Structure Mismatch**
   - **Risk**: Test hierarchy doesn't match source hierarchy
   - **Mitigation**: Mirror exact directory structure from `src/`
   - **Validation**: Visual comparison of directory trees

2. **IDE Integration Issues**
   - **Risk**: IDE doesn't recognize test files in new location
   - **Mitigation**: tsconfig.json includes `tests` directory
   - **Validation**: Reload IDE project after migration

### Low-Risk Areas

1. **Git History Loss**
   - **Risk**: Lose git history of moved files
   - **Mitigation**: Use `git mv` instead of copy + delete
   - **Validation**: Check git log after migration

## Implementation Timeline

### Step 1: Preparation (5 minutes)
- Create branch `test-migration`
- Review current test locations
- Document all import statements

### Step 2: Configuration Updates (2 minutes)
- Update `vitest.config.ts`
- Update `tsconfig.json`

### Step 3: Directory Creation (1 minute)
- Create `tests/utils/`
- Create `tests/core/utils/`
- Create `tests/core/services/`

### Step 4: File Migration & Import Updates (15 minutes)
- For each test file:
  - Update import paths
  - Move file to new location
  - Verify no remaining test files in `src/`

### Step 5: Validation (10 minutes)
- Run `npm test`
- Run TypeScript compilation
- Verify no broken imports
- Check IDE integration

### Step 6: Cleanup (5 minutes)
- Remove any `.test.ts` files remaining in `src/`
- Commit changes with descriptive message

**Total Estimated Time**: 38 minutes

## Success Criteria

1. ✅ All 6 test files successfully moved to `tests/` directory
2. ✅ All imports resolve correctly with new paths
3. ✅ All tests pass with `npm test`
4. ✅ No TypeScript compilation errors
5. ✅ No test files remain in `src/` directories
6. ✅ Vitest UI and watch mode function correctly
7. ✅ IDE recognizes test files in new location

## Post-Migration Benefits

1. **Clearer Project Structure**: Separates source code from tests
2. **Better Build Organization**: Tests don't clutter source directories
3. **Industry Standard**: Follows common JavaScript/TypeScript project patterns
4. **Easier Maintenance**: Clear separation of concerns
5. **Better Tooling Integration**: Many tools expect `tests/` at root level

## Alternative Approaches Considered

### Approach 1: Relative Imports (Selected)
- **Pros**: Clear import paths, no path mapping needed
- **Cons**: Longer import paths
- **Decision**: Chosen for clarity and maintainability

### Approach 2: Path Mapping with tsconfig
- **Pros**: Shorter import paths
- **Cons**: Requires configuration in multiple files, more complex
- **Decision**: Rejected to minimize configuration complexity

### Approach 3: Absolute Imports
- **Pros**: Consistent imports regardless of file location
- **Cons**: Requires build tool configuration
- **Decision**: Rejected as overkill for this migration

## Testing & Validation Plan

### Pre-Migration Validation
1. Run current tests: `npm test` (baseline)
2. Document current test count: `vitest run --reporter=json`
3. Note current test execution time

### Post-Migration Validation
1. Run tests: `npm test`
2. Compare test count matches baseline
3. Compare execution time is similar
4. Check no new TypeScript errors
5. Verify IDE test discovery works

### Rollback Testing
1. Test rollback procedure on single file
2. Verify git history is preserved
3. Confirm clean rollback restores functionality

## Dependency Analysis

### Files Being Modified
1. `vitest.config.ts` - Test discovery configuration
2. `tsconfig.json` - TypeScript compilation includes
3. 6 test files - Import paths and locations

### Files Being Created
1. `tests/` directory structure
2. 6 test files in new locations

### Files Being Deleted
1. 6 test files from original locations

## Communication Plan

### Before Migration
- Inform team of migration timeline
- Explain reasons for migration
- Provide estimated downtime (minimal expected)

### After Migration
- Confirm successful migration
- Document any issues encountered
- Provide updated project structure documentation

## Long-Term Maintenance

### Future Test Development
- All new tests should be placed in `tests/` directory
- Follow established directory mirroring pattern
- Use relative imports: `../../src/...`

### Documentation Updates
- Update CONTRIBUTING.md with test location guidelines
- Update CLAUDE.md with new test structure
- Update any development documentation

## Conclusion

This migration provides a clean, maintainable approach to separating source code from tests while maintaining full functionality. The systematic approach to import path updates ensures no tests are broken during the process. The risk mitigation strategies and validation approach ensure a smooth transition with minimal disruption to development workflows.

**Estimated Complexity**: Low-Medium  
**Risk Level**: Low (with proper validation)  
**Recommended Timeline**: 38 minutes  
**Rollback Difficulty**: Easy (git-based)
