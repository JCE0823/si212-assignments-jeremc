import { readFileSync } from 'node:fs';

// Parse CSV fields, including quoted commas, escaped quotes, and newlines.
function readCSV(name) {
  const text = readFileSync(new URL(`movielens/${name}`, import.meta.url), 'utf8').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && (c === ',' || c === '\n' || c === '\r')) {
      row.push(field); field = '';
      if (c !== ',') {
        if (row.some(value => value !== '')) rows.push(row);
        row = [];
        if (c === '\r' && text[i + 1] === '\n') i++;
      }
    } else field += c;
  }
  if (quoted) throw new Error(`Unclosed CSV quote in ${name}`);
  if (field || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift();
  if (!header) throw new Error(`Missing header in ${name}`);
  return rows.map(values => {
    if (values.length !== header.length) throw new Error(`Invalid CSV row in ${name}`);
    return Object.fromEntries(header.map((key, i) => [key, values[i]]));
  });
}

function id(value) {
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
    throw new Error(`Invalid numeric ID: ${value}`);
  }
  return Number(value);
}

const movies = new Map(readCSV('movies.csv').map(movie => [
  id(movie.movieId), movie.genres.split('|').filter(g => g && g !== '(no genres listed)'),
]));
const users = new Map();
for (const rating of readCSV('ratings.csv')) {
  const userId = id(rating.userId), movieId = id(rating.movieId);
  if (!movies.has(movieId)) throw new Error(`Missing movie ${movieId}`);
  if (!users.has(userId)) users.set(userId, new Set());
  users.get(userId).add(movieId);
}
const answer = [];
for (const [userId, rated] of users) {
  if (rated.size > 25) continue;
  const genres = new Set();
  for (const movieId of rated) for (const genre of movies.get(movieId)) genres.add(genre);
  answer.push({ userId, genre_count: genres.size });
}
// User ID provides a reproducible choice when users tie at the cutoff.
answer.sort((a, b) => b.genre_count - a.genre_count || a.userId - b.userId);
console.log(JSON.stringify(answer.slice(0, 3)));
