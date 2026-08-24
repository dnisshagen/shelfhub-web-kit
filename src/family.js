/**
 * The portfolio, in one place. Every shelf site renders this same list in its
 * footer, filtered to exclude itself, so launching an app means editing one
 * file here rather than hunting through five repos for hard-coded footers.
 *
 * `url` gates whether the entry becomes a link — a live landing page is worth
 * linking even before the app ships; `live` marks whether the APP is out (the
 * strip shows a "soon" chip on !live entries, linked or not). Leave `url` off
 * entirely for anything with no page at all.
 *
 * Scope ruling 2026-08-04 (shelfhub/PORTFOLIO.md): active brands only — bar,
 * coffee, whiskey, cigar, plus the hub. Wine/idea brands wait. Fragrance
 * joined 2026-08-23 (MYBAR-298): its landing page has been live in
 * shelfhub-landing all along, and this file's own rule is that a live page
 * is worth linking before the app ships.
 */
export const SHELF_FAMILY = [
  {
    name: 'My Bar Shelf',
    url: 'https://www.mybarshelf.com',
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
    url: 'https://www.mywhiskeyshelf.com',
    tagline: 'For the bottles you drink neat.',
    live: false,
  },
  {
    name: 'My Cigar Shelf',
    url: 'https://www.mycigarshelf.com',
    tagline: 'Humidor, rotation, and tasting notes.',
    live: false,
  },
  {
    name: 'My Fragrance Shelf',
    url: 'https://www.myfragranceshelf.com',
    tagline: 'Your bottles, their seasons, and what to wear tonight.',
    live: false,
  },
  // Beer and supply joined 2026-08-24: both are real apps in TestFlight.
  // No url yet — their domains are parked, and this file's rule is that
  // url gates linking on a live page, not on the app.
  {
    name: 'My Beer Shelf',
    tagline: 'The cellar and the fridge, kept straight.',
    live: false,
  },
  {
    name: 'My Supply Shelf',
    tagline: 'Your household stores, measured against the official list.',
    live: false,
  },
  {
    name: 'Shelf Hub',
    url: 'https://www.myshelfhub.com',
    tagline: 'One family of shelves, one account.',
    live: true,
  },
];
