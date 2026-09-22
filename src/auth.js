export async function submitAuth(mode, values, handlers) {
  const submitter = mode === 'login' ? handlers.onLogin : handlers.onSignup;
  return submitter(values);
}
