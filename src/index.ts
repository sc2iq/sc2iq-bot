import * as dotenv from 'dotenv'
import * as path from 'path'
import * as express from 'express'
import getDolRouter from './directline'
import { BotFrameworkAdapter } from 'botbuilder'
import { MyBot } from './bot'
import chalk from 'chalk'

const ENV_FILE = path.join(__dirname, '..', '.env')
dotenv.config({ path: ENV_FILE })

const port = parseInt(process.env.PORT, 10)
const server = express()

const isDevelopment = process.env.NODE_ENV === 'development'
if (isDevelopment) {
    console.log(chalk.yellowBright(`Adding /directline routes`))
    server.use(getDolRouter(port))
}

server.listen(port, () => {
    console.log(`Server listening at: http://localhost:${port}`)
})

const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppID,
    appPassword: process.env.MicrosoftAppPassword,
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${ error }`)
    // Send a message to the user
    await context.sendActivity(`Oops. Something went wrong!`)
};

// Create the main dialog.
const myBot = new MyBot()

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        await myBot.run(context)
    })
})
