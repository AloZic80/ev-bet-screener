# Read your bet history from Chrome (Mac)

`read-books.mjs` reads the text of your Bovada, PrizePicks, Underdog, Kalshi and Novig pages that are open in a Chrome window,
and saves it to `~/Desktop/books-dump.json`. It only reads what is on screen: no clicks, no typing, no passwords, nothing sent anywhere.

## Once
1. Node 22 or newer: `node -v` in Terminal. If it is older or missing, install the LTS from nodejs.org.
2. Get the script:
   ```bash
   mkdir -p ~/0xbeta && curl -fsSL https://raw.githubusercontent.com/AloZic80/ev-bet-screener/main/tools/read-books.mjs -o ~/0xbeta/read-books.mjs
   ```

## Each time
1. Quit Chrome completely (Cmd+Q).
2. Start Chrome with reading turned on, in its own profile (Chrome only allows this outside your everyday profile):
   ```bash
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222 --user-data-dir="$HOME/.0xbeta-chrome"
   ```
   The first time, log in to each book in this window. It remembers you after that.
3. Open each book's bet history (settled and open bets) in a tab of that window.
4. In a second Terminal window:
   ```bash
   node ~/0xbeta/read-books.mjs
   ```
5. Open `books-dump.json` on your Desktop, cross out anything you want (balance, account number), and send it to Claude.
