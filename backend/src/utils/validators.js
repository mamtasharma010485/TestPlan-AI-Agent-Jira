export function validateJiraId(ticketId) {
  const regex = /^[A-Z]+-\d+$/;
  return regex.test(ticketId);
}

export function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeTicketId(ticketId) {
  return ticketId.trim().toUpperCase();
}
