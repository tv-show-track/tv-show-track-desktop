import jetpack from 'fs-jetpack';

function isSandboxed() {
  try {
    const listRoot = jetpack.list('/');
    console.log('isSandboxed', listRoot);
    const isNotSandboxed = listRoot && listRoot.length &&
      listRoot.indexOf('Applications') > -1 &&
      listRoot.indexOf('Users') > -1;

    return !isNotSandboxed;
  } catch (e) {
    return false;
  }
}

export { isSandboxed };
