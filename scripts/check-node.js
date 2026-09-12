// Dev/build toolchain needs modern Node (Vite 5 + rolldown-based Vitest):
// global crypto.getRandomValues requires >=19, styleText requires >=20.12.
// Validated on Node 22; CI runs Node 24.
const REQUIRED = [20, 12, 0];

const actual = process.versions.node.split('.').map(Number);
const [aMajor, aMinor, aPatch] = actual;
const [rMajor, rMinor, rPatch] = REQUIRED;
const tooOld =
  aMajor < rMajor ||
  (aMajor === rMajor && aMinor < rMinor) ||
  (aMajor === rMajor && aMinor === rMinor && aPatch < rPatch);

if (tooOld) {
  console.error(
    `\nNode ${process.versions.node} is too old for this project (need >= ${REQUIRED.join('.')}).` +
      '\nRun:  nvm use 22   (or: nvm alias default 22.20.0)' +
      '\nThen retry the command.\n'
  );
  process.exit(1);
}
