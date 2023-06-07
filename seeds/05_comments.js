module.exports.seed = async knex => {
  await knex('comments').delete();
  await knex('comments').insert([
    {
      id: -1,
      guest_name: '',
      text: 'Lead article? huh, what it means? Is somebody knows it? for me it is complete mystery =/',
      article_id: -1,
      author_id: -1,
    },
    {
      id: -2,
      guest_name: 'Errant soldier',
      text: 'Calamity... like calamity coyot? Anyway it sounds cool :)',
      article_id: -2,
      author_id: null,
    },
    {
      id: -3,
      guest_name: '',
      text: 'Wow, i remember it is a good game. I played in it in my childhood',
      article_id: -3,
      author_id: -1,
    },
    {
      id: -4,
      guest_name: '',
      text: 'Yep, it is Lunar 2. My first cool rpg on PS one <3',
      article_id: -3,
      author_id: -2,
    },
    {
      id: -5,
      guest_name: '',
      text: 'Wow, i remember it is a good game. I played in it in my childhood',
      article_id: -10,
      author_id: -2,
    },
    {
      id: -6,
      guest_name: '',
      text: 'Yep, it is Lunar 2. My first cool rpg on PS one <3',
      article_id: -10,
      author_id: -3,
    },
    {
      id: -7,
      guest_name: 'Terminator',
      text: "Aa, it's just child memories, the game is nothing special about",
      article_id: -10,
      author_id: null,
    },
    {
      id: -8,
      guest_name: 'Terminator',
      text: "Try new DQ 11, that's a real masterpiece!",
      article_id: -10,
      author_id: null,
    },
    {
      id: -9,
      guest_name: '',
      text: 'Not bad idea, but now i have more important things to do',
      article_id: -10,
      author_id: -1,
    },
    {
      id: -10,
      guest_name: '',
      text: 'Yep, Tailwind is really cool. I would say it even imalanced <3',
      article_id: -8,
      author_id: -5,
    },
    {
      id: -11,
      guest_name: '',
      text: "Agree with you bro. Don't know how i lived without it :)",
      article_id: -8,
      author_id: -7,
    },
  ]);
};
