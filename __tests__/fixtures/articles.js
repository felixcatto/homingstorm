const basic = [
  {
    id: -3,
    title: 'Build whatever you want, seriously.',
    text: "Because Tailwind is so low-level, it never encourages you to design the same site twice. Even with the same color palette and sizing scale, it's easy to build the same component with a completely different look in the next project.",
    author_id: -1,
  },
  {
    id: -2,
    title: 'Calamity',
    text: `
    The Calamity Mod is a large content mod for Terraria which adds many hours of endgame content
    and dozens of enemies and bosses dispersed throughout the vanilla game's progression.
    The Calamity Mod also features several harder difficulty modes, five new biomes and new
    structures, a new class, a new leveling mechanic, more than thirty new songs, over fifty
    recipes for previously uncraftable vanilla items and other assorted changes to
    vanilla gameplay.`,
    author_id: -1,
  },
  {
    id: -1,
    title: 'Lead Article',
    text: 'Some really long zzZ text about anything',
    author_id: -2,
  },
];

export const extra = [
  {
    id: -10,
    title: 'Catastrophe',
    text: `
  Learned At Level:55.
  Description:All the magical elements are summoned to
  collide with all enemies. While the MP cost is incredibly
  high so is the damage!`,
    author_id: -2,
  },
  {
    id: -9,
    title: 'SWR',
    text: 'The name “SWR” is derived from stale-while-revalidate, a HTTP cache invalidation strategy popularized by HTTP RFC 5861(opens in a new tab). SWR is a strategy to first return the data from cache (stale), then send the fetch request (revalidate), and finally come with the up-to-date data.',
    author_id: -4,
  },
  {
    id: -8,
    title: 'It’s tiny — never ship unused CSS again.',
    text: 'Tailwind automatically removes all unused CSS when building for production, which means your final CSS bundle is the smallest it could possibly be. In fact, most Tailwind projects ship less than 10kB of CSS to the client.',
    author_id: -1,
  },
  {
    id: -7,
    title: 'An API for your design system.',
    text: 'Utility classes help you work within the constraints of a system instead of littering your stylesheets with arbitrary values. They make it easy to be consistent with color choices, spacing, typography, shadows, and everything else that makes up a well-engineered design system.',
    author_id: -3,
  },
  {
    id: -6,
    title: 'Get started with Tailwind CSS',
    text: "Tailwind CSS works by scanning all of your HTML files, JavaScript components, and any other templates for class names, generating the corresponding styles and then writing them to a static CSS file. It's fast, flexible, and reliable — with zero-runtime.",
    author_id: -2,
  },
  {
    id: -5,
    title: 'Water Walkning',
    text: "So I started to walk into the water. I won't lie to you boys, I was terrified. But I pressed on, and as I made my way past the breakers a strange calm came over me. I don't know if it was divine intervention or the kinship of all living things but I tell you Jerry at that moment, I was a marine biologist.",
    author_id: -2,
  },
  {
    id: -4,
    title: 'Setting the line-height',
    text: 'Set an element’s line-height at the same time you set the font size by adding a line-height modifier to any font size utility. For example, use text-xl/8 to set a font size of 1.25rem with a line-height of 2rem.',
    author_id: -3,
  },
];

export const full = [...extra, ...basic];

export default basic;
