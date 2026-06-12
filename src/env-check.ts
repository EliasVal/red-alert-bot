export function checkEnv() {
  if (!Object.hasOwn(process.env, 'TOKEN')) throw new Error('No token provided!');
  if (!Object.hasOwn(process.env, 'INTERVAL')) throw new Error('No interval provided!');
  if (!Object.hasOwn(process.env, 'ANNOUNCEMENT_CHANNEL')) throw new Error('No announcement channel provided!');
}
