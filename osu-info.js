const fetch = require("node-fetch");
const yargs = require('yargs');
var config = require('./config.json');
var argv = yargs // yargs configuration
    .usage('Usage: $0 <command> [option]')
    .help('help')
    .alias('h', 'help')
    // User info command
    .command('info', 'Fetch user infomation', function (yargs) {
        argv = yargs
            .usage('Usage: $0 info [option]')
            .help('help')
            .alias('h', 'help')
            .option('name', {
                alias: 'n',
                describe: 'Search by username',
                type: 'string'
            })
            .option('id', {
                alias: 'i',
                describe: 'Search by ID',
                type: 'int'
            })
            .conflicts('id', 'name')
            .check(function (argv) {
                if (!argv.id && !argv.name) {
                    throw(new Error("At least one option needs to be passed."));
                }
                else if (argv.id) {
                    let id = parseInt(argv.id);
                    if (isNaN(id))
                        throw(new Error("ID needs to be a number."));
                    else 
                        return true;
                }
                else {
                    return true;
                }
            })
            .argv;

            if (argv.i) {
                getUser(argv.i, 'id');
            }
            else getUser(argv.n, 'string');
    })
    // Beatmap command
    .command('bm', 'Fetch beatmap information', function (yargs) {
        argv = yargs
            .usage("Usage $0 bm [option]")
            .help('help')
            .alias('h', 'help')
            .option('id', {
                alias: 'i',
                describe: 'Search by beatmap ID',
                type: 'int'
            })
            .demandOption('i')
            .argv;

            getBm(argv.i, 's');
    })
    .demandCommand(1)
    .argv;

// extract the first 2 decimal from a number
function exDec(num) {
    let n = parseFloat(num);
    return Math.floor(num * 100) % 100;
}

// Get user information
async function getUser (user, type) {
    const url = new URL("https://osu.ppy.sh/api/get_user");

    let params = {
        "k": config.apikey,
        "u": user,
        "type": type,
    };
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    let headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    let response = await fetch(url, {
        method: "GET",
        headers: headers,
    })
    let data = await response.json();

    if (Object.entries(data).length === 0) {
        console.log('Error: User not found.');
        return;
    }

    console.log("####################################\n");
    console.log("osu! profile for " + data[0].username + "\n");
    console.log("- Rank: #" + data[0].pp_rank + " (" + data[0].country + " #" + data[0].pp_country_rank + ")");
    console.log("- Level: " + data[0].level + " (" + exDec(data[0].level) + "%" + ")");
    console.log("- PP: " + parseFloat(data[0].pp_raw).toFixed(2));
    console.log("- Accuracy: " + parseFloat(data[0].accuracy).toFixed(2) + "%");
    console.log("- Play count: " + data[0].playcount)
    console.log("\n####################################");
}

async function getBm(id, type) {
    const url = new URL("https://osu.ppy.sh/api/get_beatmaps");

    let params = {
        "k": config.apikey,
        "s" : id,
        "limit": "1",
    };
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    let headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    let response = await fetch(url, {
        method: "GET",
        headers: headers,
    })
    let data = await response.json();

    if (Object.entries(data).length === 0) {
        console.log('Error: User or Beatmap not found.');
        return;
    }

    console.log("####################################\n");
    console.log("osu! beatmap info for " + data[0].title);
    console.log("- Mapped by: " + data[0].creator);
    console.log("- Length: " + parseInt(data[0].total_length) / 60 + 
                    "m" + parseInt(data[0].total_length) % 60);
    console.log("\n####################################");
}