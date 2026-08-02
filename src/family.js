/**
 * The portfolio, in one place. Every shelf site renders this same list in its
 * footer, filtered to exclude itself, so launching an app means editing one
 * file here rather than hunting through five repos for hard-coded footers.
 *
 * `live` gates whether the entry becomes a link. Leave `url` off entirely for
 * anything unreleased - the strip renders those as plain text with a "soon"
 * marker, so there is no way to accidentally ship a dead link by flipping a
 * flag and forgetting the address.
 */
export const SHELF_FAMILY = [
  {
    name: 'My Bar Shelf',
    url: 'https://mybarshelf.com',
    tagline: 'Your bottles, and what you can make with them.',
    live: true,
  },
  {
    name: 'My Coffee Shelf',
    url: 'https://mycoffeeshelf.com',
    tagline: 'Your machines, your beans, and keeping both in good order.',
    live: true,
  },
  {
    name: 'My Whiskey Shelf',
    tagline: 'For the bottles you drink neat.',
    live: false,
  },
  {
    name: 'My Wine Shelf',
    tagline: 'What to open, and what to eat with it.',
    live: false,
  },
  {
    name: 'My Cigar Shelf',
    tagline: 'Humidor, rotation, and tasting notes.',
    live: false,
  },
];
