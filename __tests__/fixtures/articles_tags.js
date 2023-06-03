const basic = [
  { article_id: -1, tag_id: -1 },
  { article_id: -2, tag_id: -1 },
  { article_id: -2, tag_id: -2 },
];

export const extra = [
  { article_id: -3, tag_id: -4 },
  { article_id: -4, tag_id: -4 },
  { article_id: -4, tag_id: -3 },
  { article_id: -6, tag_id: -2 },
  { article_id: -6, tag_id: -4 },
  { article_id: -7, tag_id: -1 },
  { article_id: -8, tag_id: -3 },
  { article_id: -9, tag_id: -1 },
  { article_id: -9, tag_id: -2 },
  { article_id: -9, tag_id: -3 },
];

export const full = [...extra, ...basic];

export default basic;
