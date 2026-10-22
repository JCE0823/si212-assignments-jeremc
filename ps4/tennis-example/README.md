# Tennis simulator

A worked example of a complete Problem Set 4. Yours will be about something else, but it should
have every section this one has.

## Question

In a 2024 graduation speech at Dartmouth, Roger Federer said he won only 53% of the points he
played in his career. Yet he reached the final, which means winning six matches in a row, in 31
of the 81 Grand Slams he played: 38%.

**Is a 53% edge on each point enough to reach a Grand Slam final that often, or did he have to
play better at the Grand Slams than everywhere else?**

## How to run

Open `ps4/tennis-example/index.html` in a browser. Nothing to install.

To run it without the page, with Node:

```
cd ps4/tennis-example
node run.js --serveA 68 --serveB 62 --bestOf 5
npm test
```

`run.js` takes the same parameters as the page, and any left out take their defaults.

## The model

Each point is a weighted coin flip: the server wins it with a fixed chance, whatever happened on
the points before. On top of that, the simulator plays real tennis scoring:

- **A game** is first to four points, ahead by two. One player serves the whole game, and serve
  alternates every game.
- **A set** is first to six games, ahead by two. At 6-6 there is a tie-break: first to 7 points,
  ahead by two, or first to 10 in the deciding set. In a tie-break one player serves one point,
  then the players take turns serving two.
- **A match** is best of three or best of five sets. Who serves first is a coin toss.

The simplifications, each of which could change the answer:

- **A player is equally good on every point**, except for the pressure edge below. No fatigue, no
  momentum, no off days.
- **A pressure point is a point that can end a game or a tie-break**: game point, break point, or
  set point in a tie-break. The pressure edge is added to A's chance on those points, whoever is
  serving.
- **The chance of winning a point is kept between 1% and 99%.** Without that, two players who
  never lose serve would play a tie-break that never ends.
- **"Six matches in a row" means six matches against the same opponent.** A real draw has weaker
  players early and stronger ones late.

## Parameters and outputs

| parameter   | range              | default | meaning                                                                                                      |
| ----------- | ------------------ | ------- | ------------------------------------------------------------------------------------------------------------ |
| `serveA`    | 1 to 99            | 64      | % of points A wins when A serves                                                                             |
| `serveB`    | 1 to 99            | 64      | % of points B wins when B serves                                                                             |
| `pressureA` | -20 to 20          | 0       | percentage points added to A's chance on a pressure point, on either player's serve; negative means A chokes |
| `bestOf`    | 3 or 5             | 3       | sets in a match                                                                                              |
| `matches`   | 10 to 20000, whole | 2000    | how many matches to simulate                                                                                 |

| output                                 | what it is                                                       | spread shown                    |
| -------------------------------------- | ---------------------------------------------------------------- | ------------------------------- |
| A wins the match                       | % of simulated matches A won                                     | 95% interval for that estimate  |
| A wins six matches in a row against B  | the match-win chance to the sixth power                          | 95% interval for that estimate  |
| A's share of the points played         | % of points A won, averaged over matches                         | middle 80% of matches           |
| Sets that go to a tie-break            | % of all sets played that reached 6-6                            | 95% interval for that estimate  |
| Points in a match                      | points played in a match, averaged over matches                  | middle 80% of matches           |

## One suspicious outcome

**`serveA` 64, `serveB` 64, `pressureA` 0, `bestOf` 3, `matches` 20000.** The two players are
identical, so I expect A to win close to 50% of matches, with 50% inside the 95% interval. If A
won 53%, something would be favouring A that the model doesn't say should, such as a bug that
always has A serve first, and I would go looking for it.

## Answer

**Yes, 53% is about enough.**

The main run: `serveA` 68, `serveB` 62, `pressureA` 0, `bestOf` 5, `matches` 20000. A took 53% of
the points and won 83% of the matches, which makes six in a row about 32%. Federer's 38% is a
little higher, and that is what I would expect, since his early opponents were weaker than his
average opponent and the model plays the same opponent six times. He did not have to play better
at the Grand Slams.

The reason is that the scoring multiplies a small edge: 53% of points becomes 83% of matches.
Longer matches multiply it more. The same run with `bestOf` 3 gives A 78% of matches, and only
22% for six in a row.

Within any one match, though, 53% is not a sure thing. In the main run the middle 80% of matches
ran from 49% to 57% of points for A, so in more than one match in ten A won fewer than half the
points.
