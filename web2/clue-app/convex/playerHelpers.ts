import { ROOMS, SUSPECTS, WEAPONS } from "../app/constants";

/**
 * Validates that the provided array of cards contains exactly three cards,
 * with one card from each category: suspect, weapon, and room.
 *
 * @param cards - An array of card names to be validated.
 * @returns A boolean indicating whether the cards array is valid.
 */
export function validateCards(cards: string[]): boolean {
  // Players pass cards to the backend in 3s
  if (cards.length !== 3) {
    return false;
  }

  // Ensures exactly one suspect, weapon, and room is included
  [ROOMS, SUSPECTS, WEAPONS].forEach((category) => {
    if (cards.filter((card) => category.includes(card)).length !== 1) {
      return false;
    }
  });

  return true;
}
