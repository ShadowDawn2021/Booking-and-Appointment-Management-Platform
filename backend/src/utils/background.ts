export function runInBackground(task: Promise<unknown>, label: string): void {
  task.catch((error: unknown) => {
    console.error(`[background] ${label} failed`, error);
  });
}
