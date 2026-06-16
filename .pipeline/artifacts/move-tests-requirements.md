# Requirements: Move Tests to Root Tests Folder

## Overview
Move all test files from their current locations in the `src` directory to a centralized `tests` folder at the root level. This is a common best practice for better project organization.

## Current State
Based on the main2 branch analysis, test files are currently scattered within the `src` directory structure, mirroring the source code structure:
- `src/utils/goalProgress.test.ts`
- `src/utils/progressUtils.test.ts`  
- `src/utils/goalUtils.test.ts`
- `src/utils/validation.test.ts`
- `src/core/utils/dateUtils.test.ts`
- `src/core/services/streakLogic.test.ts`

**Test Infrastructure Status:**
- Test files exist and are functional
- Testing framework (Vitest) is configured in `vitest.config.ts`
- Test scripts exist in `package.json` (`npm run test`, `npm run test:ui`)
- Current test configuration points to `src` directory patterns

## Desired State
All test files should be moved to a root-level `tests` directory:
- `tests/utils/goalProgress.test.ts`
- `tests/utils/progressUtils.test.ts`
- `tests/utils/goalUtils.test.ts`
- `tests/utils/validation.test.ts`
- `tests/core/utils/dateUtils.test.ts`
- `tests/core/services/streakLogic.test.ts`

## Requirements

### Functional Requirements
1. **Move all test files** from `src` directory to `tests` directory
2. **Maintain directory structure** - Preserve the relative path structure within the tests folder
3. **Update imports** - Fix any import statements that break due to file movement
4. **Update test configuration** - Ensure Vitest/Vite config can still find the tests
5. **Maintain test functionality** - All tests must continue to pass after migration

### Technical Requirements
1. **Import path corrections** - Update relative imports in test files to account for new location
   - Tests in `tests/utils/` need to import from `../../src/utils/`
   - Tests in `tests/core/utils/` need to import from `../../../src/core/utils/`
   - Tests in `tests/core/services/` need to import from `../../../src/core/services/`
2. **Configuration updates** - Update `vitest.config.ts` to include `tests/**/*.test.ts` pattern
3. **Path aliases** - Preserve any TypeScript path mapping configurations
4. **No source code changes** - Source files in `src` should remain unchanged

### Import Migration Strategy
1. Analyze current import statements in each test file
2. Calculate new relative paths based on directory depth changes
3. Update all import statements to reference correct source file locations
4. Verify no broken imports after migration

### Acceptance Criteria
1. All test files moved to `tests` directory with preserved structure
2. All imports updated correctly
3. `npm run test` executes successfully
4. All tests pass
5. No changes to source code functionality
6. Test configuration properly points to new location

### Configuration Updates
1. **Update `vitest.config.ts`**:
   - Add `include: ['tests/**/*.test.ts']` pattern
   - Remove or keep existing `src/**/*.test.ts` pattern for backwards compatibility
   - Ensure environment setup (jsdom/node) is maintained
2. **Verify TypeScript configuration** - ensure path mappings still work
3. **Test scripts remain functional** - `npm run test` and `npm run test:ui` should work

### Validation Steps
1. **Pre-migration**:
   - Run current test suite to establish baseline: `npm run test`
   - Document all test file locations
2. **During migration**:
   - Move files by directory (utils, then core)
   - Update imports immediately after each directory move
   - Run tests after each directory to verify changes
3. **Post-migration**:
   - All tests pass: `npm run test`
   - No TypeScript errors: `npm run build`
   - No broken imports (manual verification)
   - Test UI works: `npm run test:ui`

## Constraints
- **Zero functionality changes** - This is purely organizational refactoring
- **All tests must pass** - No regression in test coverage or functionality
- **Maintain import structure** - Keep test imports working correctly
- **Minimal config changes** - Only update what's necessary for test discovery

## Success Metrics
- All tests located in `/tests` directory
- Test suite runs without errors
- No broken imports or references
- Clean separation of source and test code