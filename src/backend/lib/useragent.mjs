const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
];

export default function () {
  return USER_AGENTS[~~(Math.random() * USER_AGENTS.length)];
};
