export async function withLoadingState(setLoading, operation) {
  setLoading(true);
  try {
    return await operation();
  } finally {
    setLoading(false);
  }
}
