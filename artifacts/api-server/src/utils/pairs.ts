/**
 * Returns [a, b] such that a < b lexicographically. Used to enforce the
 * canonical (user_id_a < user_id_b) ordering for friendships and
 * conversations, so a pair of users always maps to exactly one row
 * regardless of which user initiates.
 */
export function orderedPair(idA: string, idB: string): [string, string] {
  return idA < idB ? [idA, idB] : [idB, idA];
}
