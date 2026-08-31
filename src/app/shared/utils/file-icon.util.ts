/**
 * Retorna um emoji representativo para o mimeType de um anexo,
 * usado nas listagens de anexos de boletins.
 */
export function getFileIcon(mimeType: string): string {
  if (!mimeType) return '📁';
  const lower = mimeType.toLowerCase();
  if (lower.includes('pdf')) return '📄';
  if (
    lower.includes('word') ||
    lower.includes('docx') ||
    lower.includes('msword')
  )
    return '📝';
  if (lower.includes('image')) return '🖼️';
  if (lower.includes('video')) return '🎥';
  return '📁';
}
