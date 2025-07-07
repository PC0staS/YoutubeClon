// Utility functions for comments management

export function sanitizeComment(comment) {
  return {
    author: comment.author || 'Usuario Anónimo',
    text: comment.text || '',
    publishedAt: comment.publishedAt || new Date().toISOString(),
    authorProfileImageUrl: comment.authorProfileImageUrl || null
  };
}

export function formatCommentDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Fecha inválida';
  }
}

export function generateAvatarUrl(authorName) {
  const encodedName = encodeURIComponent(authorName || 'U');
  return `https://ui-avatars.com/api/?name=${encodedName}&background=222&color=fff&size=48`;
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
