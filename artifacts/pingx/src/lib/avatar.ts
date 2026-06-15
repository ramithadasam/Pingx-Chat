/**
 * Returns a user's avatar URL, falling back to a deterministic generated
 * avatar (DiceBear) based on their username when no avatarUrl is set
 * (e.g. a brand-new account that hasn't uploaded a profile photo yet).
 */
export function avatarUrlFor(user: { avatarUrl?: string | null; username: string }): string {
  if (user.avatarUrl) return user.avatarUrl;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username)}`;
}

export function getAvatarUrl(avatarUrl: string | null, name: string): string {
  if (avatarUrl) return avatarUrl;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
}
