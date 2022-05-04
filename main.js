const axios = require("axios");
const r = require("readline-sync");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const util = require("util");
const setTitle = require("console-title");

let counters = {
    downloaded: 0,
    failed: 0,
    guild: 0,
    total: 0
}

setTitle("Discord Server Emoji Downloader | @Automized on github")

console.clear()

console.log = function(e) {
    let formatter = util.format(e)
    formatter = formatter.replace(/[+]/g, chalk.redBright("+"))
    formatter = formatter.replace(/I#/g, chalk.blueBright("I"))
    formatter = formatter.replace(/COMPLETE/g, chalk.greenBright("COMPLETE"))
    formatter = formatter.replace(/@Automized/g, chalk.redBright("@Automized"))
    if(formatter.includes("##")){
        const other = formatter.split("##")[0]
        const insideString = formatter.split("##")[1].split("##")[0]
        formatter.replace(insideString, "##" + chalk.redBright(insideString) + "##")
        return process.stdout.write("    " + chalk.whiteBright(other) + chalk.redBright(insideString) + "\n")
    }

    process.stdout.write(chalk.whiteBright("    " + formatter + "\n"))
}

console.log(`╔═╗┌─┐┬─┐┬  ┬┌─┐┬─┐  ╔═╗┌┬┐┌─┐ ┬┬┌─┐  ╔╦╗┌─┐┬ ┬┌┐┌┬  ┌─┐┌─┐┌┬┐┌─┐┬─┐`)
console.log(`╚═╗├┤ ├┬┘└┐┌┘├┤ ├┬┘  ║╣ ││││ │ ││└─┐   ║║│ ││││││││  │ │├─┤ ││├┤ ├┬┘`)
console.log(`╚═╝└─┘┴└─ └┘ └─┘┴└─  ╚═╝┴ ┴└─┘└┘┴└─┘  ═╩╝└─┘└┴┘┘└┘┴─┘└─┘┴ ┴─┴┘└─┘┴└─`)
console.log(`                   Developed by @Automized`)
console.log(``)
const Token = r.question("    Token: ");
const Guild = r.question("    Guild ID: ");
console.log(" ");

(async() => {
    const GetGuildEmojis = await axios({
        method: "GET",
        url: `https://discord.com/api/v9/guilds/${Guild}/emojis`,
        headers: {
            "Authorization": Token,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0"
        }
    }).catch((err) => {
        err = err.response

        if(err.status == 401){
            return console.log("You have provided an invalid token")
        }else if(err.status == 404 || err.status == 400){
            return console.log("You have provided an invalid guild ID")
        }else{
            console.log("There was an error, this error will most likly be because you have provided an invalid token or guild ID.")
            console.log(err)
        }
    })

    const GetGuild = (await axios({
        method: "GET",
        url: `https://discord.com/api/v9/guilds/${Guild}`,
        headers: {
            "Authorization": Token,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0"
        }
    })).data

    const request_emojis = GetGuildEmojis.data
    const guild_name = GetGuild.name

    counters.guild = guild_name
    counters.total = request_emojis.length
    if(!request_emojis || !request_emojis.length || request_emojis.length == 0){
        return console.log(`[-] I found no emojis inside ${guild_name.name}`)
    }

    console.log(`[I#] Found a total of ${request_emojis.length} emojis inside ${guild_name}`)
    console.log(`[I#] Downloading all ${request_emojis.length} emojis to ${path.join("Output")} folder.`)
    console.log("")

    for(const emoji of request_emojis) {
        const Endix = emoji.animated ? "gif" : "png" 
        const BuiltUrl = `https://cdn.discordapp.com/emojis/${emoji.id}.${Endix}`
        const DownloadedFile = await DownloadFile(BuiltUrl, path.join("Output", `${emoji.name}.${Endix}`))
        if(DownloadFile.location){
            counters.downloaded += 1
            console.log(`[+] Downloaded emoji ${emoji.name} <> ##${DownloadedFile.location}##`)
        }
        
        UpdateTitle()
    }

    console.log("")
    console.log("[COMPLETE] Downloaded all emojis")
    r.question("    Check the output folder to get your downloaded emojis (click enter to exit) ")
})()

async function DownloadFile(source, destination) {
    return new Promise(async(resolve, reject) => {
        const stream = fs.createWriteStream(destination)

        return axios({
            method: "GET",
            url: source,
            responseType: "stream"
        }).then((res) => {
            res.data.pipe(stream)
            stream.on("close", () => {
                resolve({
                    location: destination
                })
            })

            stream.on("error", () => {
                counters.failed += 1
                resolve()
            })
        })
    })
}

function UpdateTitle() {
    setTitle(`Discord Server Emoji Downloader | @Automized on github | Server: ${counters.guild} | Downloaded: ${counters.downloaded}/${counters.total} | Failed: ${counters.failed}`)
}