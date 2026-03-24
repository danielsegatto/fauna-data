export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("pt-BR");
}

export function formatTime(
  timestamp: number,
  options?: { includeSeconds?: boolean }
): string {
  return new Date(timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    ...(options?.includeSeconds ? { second: "2-digit" } : {}),
  });
}

export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp)} às ${formatTime(timestamp)}`;
}