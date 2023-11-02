require('dotenv/config');

const app = require('express')();
const http = require('http');
const bodyParser = require('body-parser');
const { Webhook, MessageBuilder } = require('discord-webhook-node');

const whURL = process.env.WEBHOOK_URL; // Discord Webhook URL from .env
const PORT = process.env.PORT || 8080; // Server Port

const wh = new Webhook(whURL); // new Webhook Client

app.use(bodyParser.urlencoded({ extended: true })); // Body parser encoded
app.use(bodyParser.json()); // JSON body parser

app.use('/post', async (req, res) => {
    const data = req.body.data;
    if (!data) return res.json({ success: false, error: 'Missing Payload' }); // if there is no payload do return

    try {
        const obj = JSON.parse(data); // JSON Parse

        if (obj.verification_token != process.env.TOKEN) return res.json({ success: false, error: 'Access Denied' }); // If there is no valid token do return

        /**
         * Classic Embed Builder from DiscordJS
         */

        const mbed = new MessageBuilder()
            .setTitle('Ko-Fi')
            .setColor(0xFF0000)
            .addField('From', `${obj.from_name}`, true)
            .addField('Amount', `${obj.amount}`, true)
            .addField('Message', `${obj.message}`)
            .setTimestamp();

        await wh.send(mbed); // Send webhook embed
    } catch (e) {
        console.error(e);
        return res.json({ success: false, error: e });
    }

    return res.json({ success: true }); // return true on success
});

app.use('/', async (_, res) => {
    res.json({ message: `Ko-Fi Webhook Integration.` });
    return;
});

const httpServer = http.createServer(app);
httpServer.listen(PORT, () => {
    console.log(`> Listening on port ${PORT}`);
});