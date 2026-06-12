export function envCheck(): void {
  if (!Object.hasOwn(process.env, 'TOKEN')) throw new Error('No token provided!');
  if (!Object.hasOwn(process.env, 'ANNOUNCEMENT_CHANNEL')) throw new Error('No announcement channel provided!');
}
