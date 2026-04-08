
export const withErrorReporting = <T extends Array<any>,>(thunk: (...args: T) => any) => (...args: T) => {
  try {
    const result = thunk(...args);
    if (result && result.catch && typeof result.catch === 'function') {
      result.catch(err => {
        // TODO: send request to external reporting service, or persist to a DB.
        // e.g.: BugSnag, Sentry, etc.
        console.error(err);
      });
    }
  } catch (err) {
    // TODO: send request to external reporting service, or persist to a DB.
    // e.g.: BugSnag, Sentry, etc.
    console.error(err);
  }
}
