# Problem Set 3: Deploying to Public Infrastructure

## What you are doing

**Put a web app of yours on the public internet, with real sign-in.** It has a frontend, a
backend and a relational database, all three running on public hosts, and it deploys itself
every time you push to `main`. At the end you add it to the class showcase with a pull request.

There are two parts, both due at the same time. Part A gets the app online behind a single
password. You'll do that first. Part B replaces that password with sign-in through Google or GitHub, and decides who
is allowed to do what; you'll do that after Tuesday 10/13's class.

Use the hosts you chose and signed up for in Tuesday 10/6's lab. (complete the activities and lab described in the l-11 and l-12 lecture slides first before you do this problem set.)

If you're still using the U-M API key, I strongly encourage you to switch over to a private ChatGPT account before doing this problem set. It will go faster and with less frustration. See the Canvas announcement about how to do that.

## Which app

**Any app with a frontend, a backend and a relational database.** The simplest is to  deploy your
PS2 app, and copying it across wholesale is a fine way to start this problem set. You can also change it first, or build
something new. Leave `ps2-web-app/` as you handed it in; PS3 happens in a copy.

## Where it lives

You choose one of these two:

| option                            | where the app goes                                                                | who can see the code      |
| --------------------------------- | --------------------------------------------------------------------------------- | ------------------------- |
| **in this repository**            | a `ps3/` folder here, beside `ps2-web-app/`                                        | you and the teaching team |
| **in a new public repository**    | the root of a repository of your own, which you create                            | everyone                  |

**What the public option buys you:** a repository you can point to from a resume or a portfolio,
whose history is the real history of building it. Copying the app out to a public repository
later is not the same thing: either the copy drags along this repository's history (PS1, PS2,
everything) or it starts with no history at all.

**What it costs you: a secret pushed to a public repository is public forever.** Bots scan GitHub
for keys and passwords and find them within minutes, and deleting the file afterwards does not
remove it from the history. The same mistake in this repository is embarrassing and fixable. If
you go public, the secrets rules under Part A are not advice.

**If you stay in this repository**, tell your host that the app is in `ps3/`. Every host has a
root-directory setting for it. Your host will also redeploy on every push to this repository,
including pushes for later problem sets. That's harmless, and most hosts have a watch-paths or
ignored-build setting to stop it if it bothers you.

## Part A: online, behind one password

**This part carries no marks.** It's the recommended first step, because it gets the deploy
working with the sign-in question made as small as possible. You can do it this weekend, before you are ready to do Part B. Part B replaces it.

**Start with Superpowers**, in Thursday's lab: a design for deploying your app, all three parts,
then a plan. Stop before it builds anything.

**Before you approve the plan, ask your agent these four questions**, and read each answer against
the plan. If the plan doesn't say, that is the answer, and the plan needs changing.

1. Will the data survive a redeploy?
2. Does production get a database of its own?
3. Where does each secret live?
4. Does a deploy wait for the tests?

Then let it build. The plan should get you to these:

1. **Deploy all three parts**: frontend, backend and database, each where your plan from Tuesday
   puts it. If your PS2 app keeps its data in a SQLite file, as most of yours did, re-read the database-hosting topic
   before you deploy. A host that wipes its disk on every redeploy wipes that file with it. I encourage you to switch from using SQLite to using a hosted DBMS such as Postgres.
2. **Make it deploy itself on every push to `main`.**
3. **Put every backend route behind HTTP basic auth**: one username and one password. The
   frontend's pages may load without it; they hold no data.

**Once it's live, check it yourself**, rather than taking the agent's or the host's word for it:

1. Push a small visible change, and see it show up in the live app.
2. Add something through the live app, push a change, and see that it is still there.
3. Connect your agent to your host, through the host's CLI or MCP server, signing in yourself.
   Then do something in the live app and have the agent show you the host's log lines for that
   request. When something breaks later, this is what lets the agent find out why from the host,
   instead of guessing from your code.

**Passwords are secret, and secrets never go in a file or in the chat.** This is the
deploy-config topic, applied to your own app:

- **You** put each secret into your host's settings yourself, in the host's web dashboard, then tell
  the agent the name of the setting it is in.
- **Never paste a secret into the chat** with your agent. The chat is kept, and it can be shared.
- **Never let the agent write a secret into a file**, including a `.env` file that git will
  commit. For running locally, a `.env` file is fine only if `.gitignore` covers it. Check that
  it does before your first commit.

## Part B: real sign-in

**Study the authentication topic for Tuesday 10/13's class before you start this part.**

**Start with Superpowers again**, in Tuesday's lab: a design for adding sign-in and your levels,
then a plan. Stop before it builds anything.

**Before you approve the plan, ask your agent these four questions**, and read each answer against
the plan:

1. Who registers the app with Google or GitHub?
2. What are the redirect URLs, for localhost and for the live app?
3. Where does the client secret go?
4. What does the app ask the provider for, and does it need all of it?

Then let it build. The plan should get you to these:

1. **Replace basic auth with sign-in through Google or GitHub**, using OAuth. You register your
   app with Google or GitHub, which gives you a client ID and a client secret. The client secret
   is a secret, under the same rules as above. Signing in on localhost and signing in on the live
   app need different redirect URLs. Add both to the one registration: Google and GitHub each
   accept several (GitHub raised its limit to 10 in August 2026, so older advice to register a
   second app for production is out of date).

   **Pick one provider, not both.** Think about who will use your app, and which they are more
   likely to have already: a Google account or a GitHub account. Supporting both earns nothing
   extra.
2. **Decide on at least two levels of authorization**, and enforce them **on the server**. What
   the levels are is your design. For example: you, as the owner, can add, change and remove the
   app's content, and anyone else who signs in can use it and sees only their own activity.

   **A rule enforced only in React is not enforced.** Anyone can open the browser's developer
   tools and send the request React would have refused to send. The server has to enforce.
3. **Write the levels down** as a table in `DEPLOY.md`, below.

**Adding users changes your database's shape**: a table of users, and probably a user id on what
the app records. Your production database won't change on its own when you deploy. Ask your agent
how the new tables and columns get there without losing the rows already in them, and after the
deploy, check that the data you added in Part A is still there.

**Once it's live, check it yourself** by sending requests, not by looking at the page:

1. A request to your `Protected:` path without signing in is refused, with 401.
2. A classmate signs in, tries one of the owner's actions, and is refused, with 403.

## The three things that are fixed

Everything else about how you organize this is yours. These three are not, because a program
checks them.

### `DEPLOY.md`, with three fixed first lines

It sits beside your app: in `ps3/`, or at the root of your public repository. Its first three
lines are exactly these, with your values filled in:

```
App: https://the-url-a-visitor-opens
API: https://your-backends-base-url
Protected: /api/some-path-that-needs-sign-in
```

`Protected` is one path on your API that refuses a request that isn't signed in. The grader
requests it without signing in and expects to be turned away.

Below those lines, in whatever form you like, descriptions of:

- **each host**, and which part of the app runs on it
- **every setting** the deployed app needs, **by name**, and where it is set (which host, or the
  frontend's build). **Never the value.** `DATABASE_URL, set on the backend host` is right; the
  connection string itself is a leaked secret
- **who may do what**: your levels from Part B, and what each one is allowed to do

### `GET /api/version`

Your backend answers `GET /api/version`, without sign-in, with the commit it is running:

```json
{ "commit": "3f1c2a9e..." }
```

Every mainstream host hands the running commit to your app as an environment variable; ask your
agent which one yours uses, and check the host's own documentation. This is how the grader tells
that auto-deploy works: if the commit matches the latest one on your `main`, your last push
reached the live app. It is also the first thing to look at when a change does not show up.

### A pull request to the class showcase

Add your app to [the class showcase](https://umsi212f2026.github.io/student-showcase/) with a
pull request to `umsi212F2026/student-showcase`. Its
[README](https://github.com/umsi212F2026/student-showcase#readme) has the steps. Your card's
`projectUrl` is the same URL as the `App:` line in `DEPLOY.md`.

**Your card's `githubUrl` depends on where your app lives.** If it's in a public repository of
your own, `githubUrl` is that repository's URL, the same one you submit on Canvas. If it's in
`ps3/` in this repository, leave `githubUrl` out: this repository is private, so anyone
following the link would get a 404. Getting this wrong either way costs 5 of the showcase row's
20 points.

**The showcase is public.** Use whatever name you are comfortable having on the public internet.

**The pull request runs checks, and they have to pass.** If one fails, read its log, fix it, and
push to the same branch. Do not open a second pull request.

## What you hand in

| what                       | where                                                        |
| -------------------------- | ------------------------------------------------------------ |
| the app                    | `ps3/` here, or the root of your public repository            |
| `DEPLOY.md`                | beside the app                                               |
| the live app               | at the `App:` URL, deployed from `main`                       |
| the showcase pull request  | open on `umsi212F2026/student-showcase`                       |

There is no reflection file this time.

## Grading

Keep the
app running, and keep auto-deploy working, until grades are out. A free tier that sleeps when
nobody is using it is fine. The grader will wait after hitting the URL of your app.

| criterion                                                                                  | share |
| ------------------------------------------------------------------------------------------ | ----- |
| the `App:` URL loads over HTTPS, and the `Protected:` path turns away a request not signed in | 20%   |
| `/api/version` returns the latest commit on your `main`                                    | 10%   |
| no secret anywhere in your app's history, checked by a secret scanner over every commit    | 15%   |
| real sign-in through Google or GitHub, and at least two levels enforced on the server      | 25%   |
| `DEPLOY.md`: the three lines, the hosts, every setting by name and where it is set, the levels | 10%   |
| showcase pull request open, with its checks passing, its `projectUrl` matching `App:`, and its `githubUrl` right for where your app lives | 20% |

**An app without a frontend, a backend and a database, all deployed, gets nothing on the sign-in
row.** Without a server there is nothing to enforce who may do what.

**Bring it to Thursday 10/15's class.** At your table you'll show off the app.

## Submitting

Commit as you go, and push. On Canvas, submit the URL of the repository your app is in: this
one, or your new public one. What gets graded is whatever is on `main` when it gets graded.

Due **Wed Oct 14, 11:59 PM**.
