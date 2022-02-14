import {existsSync, mkdirSync, readFileSync, writeFile, writeFileSync} from "fs";
import chalk from 'chalk'
import config from "./config/config.json";
import {join} from "path";

const request = require('request');

const ABSOLUTE_PATH: string = join(__dirname, '..')

if (!existsSync(`${ABSOLUTE_PATH}/output`)) {
    mkdirSync(`${ABSOLUTE_PATH}/output`);
    console.log(`${chalk.red('output')} directory was being created`)
}

writeFile(`${ABSOLUTE_PATH}/output/nitro.txt`, '', {encoding: "utf-8"}, (err) => {
    if (err) {
        console.log(`${chalk.red(err.message)}`)
    }
});
writeFile(`${ABSOLUTE_PATH}/output/invalid.txt`, '', {encoding: "utf-8"}, (err) => {
    if (err) {
        console.log(`${chalk.red(err.message)}`)
    }
});
writeFile(`${ABSOLUTE_PATH}/output/verified.txt`, '', {encoding: "utf-8"}, (err) => {
    if (err) {
        console.log(`${chalk.red(err.message)}`)
    }
});
writeFile(`${ABSOLUTE_PATH}/output/unverified.txt`, '', {encoding: "utf-8"}, (err) => {
    if (err) {
        console.log(`${chalk.red(err.message)}`)
    }
});

const tokens: string[] = readFileSync(`${ABSOLUTE_PATH}/tokens.txt`, 'utf-8').replace(/\r/gi, '').split("\n");

let verifiedArr: string[] = [];
let unverifiedArr: string[] = [];
let invalidArr: string[] = [];
let nitroArr: string[] = [];


let i: number = 0;

setInterval(() => {
    if (i >= tokens.length) {
        writeFileSync(`${ABSOLUTE_PATH}/output/nitro.txt`, nitroArr.toString().split(",").join(""));
        writeFileSync(`${ABSOLUTE_PATH}/output/invalid.txt`, invalidArr.toString().split(",").join(""));
        writeFileSync(`${ABSOLUTE_PATH}/output/verified.txt`, verifiedArr.toString().split(",").join(""));
        writeFileSync(`${ABSOLUTE_PATH}/output/unverified.txt`, unverifiedArr.toString().split(",").join(""));
        console.log("Finished!");
        process.exit(0);
    }
    check(tokens[i]);
    console.clear();
    console.log("[" + chalk.yellow("Nitro: ") + nitroArr.length + "] " + "[" + chalk.blue("Verified: ") + verifiedArr.length + "] [" + chalk.red("Invalid: ") + invalidArr.length + "] [" + chalk.gray("Unverified: ") + unverifiedArr.length + "] ");
    i++;
}, config.interval);


const check = (token: string) => {
    request({
        method: "GET",
        url: "https://discordapp.com/api/v9/users/@me",
        headers:
            {
                authorization: token
            }
    }, (error: string, response: string, body: string) => {
        if (!body) return;
        let json = JSON.parse(body);
        if (!json.id) {
            invalidArr.push(token + "\n");
        } else if (!json.verified) {
            unverifiedArr.push(token + "\n");
        } else {
            if (config.usernames) verifiedArr.push(token + " | username: " + json.username + "#" + json.discriminator + "\n");
            else verifiedArr.push(token + "\n");
        }
    });

    request({
        method: "GET",
        url: "https://discord.com/api/v9/users/@me/billing/subscriptions",
        headers:
            {
                authorization: token
            }
    }, (error: string, response: string, body: string) => {
        if (!body) return;
        let json = JSON.parse(body);
        if (json.length == 1) {
            if (config.usernames) nitroArr.push(token + " | username: " + json.username + "#" + json.discriminator + "\n");
            else nitroArr.push(token + "\n");
        }
    });
}