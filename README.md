# BlockArcade Telegram Bot

> This is a work in progress.

## Usage

Start by cloning this repository using git:

```
git clone https://github.com/blockarcade/blockarcadebot.git
```

Now cd into the repository:

```
cd blockarcadebot
```

Then install the Node.js dependencies:

```
npm install
```

You'll need to get an API key for our bot, you can get this from [@botfather](https://tm.me/botfather). Once you have this I recommend sticking it in a bash  called `config.sh` so you can easily set the required environment variable:

```
export TELEGRAM_BOT="bot..."
```

With this file created you can load the environment variable:

```
source ./config.sh
```

Now you're ready to run the bot!

