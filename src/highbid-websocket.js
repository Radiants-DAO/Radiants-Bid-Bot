require('dotenv').config();

const WebSocket = require('ws');
const { Client, IntentsBitField, EmbedBuilder, hyperlink } = require("discord.js");
const { Connection, PublicKey } = require('@solana/web3.js');
const anchor = require('@coral-xyz/anchor');
const IDL = require('../idl/nft-bidding.json');
const BOT = process.env.BOT;
const CHANNEL_ID = process.env.CHANNEL_ID;
const bs58 = require('bs58');
const config = require('../src/assets/discords.json');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

const BIDDING_CODER = new anchor.BorshCoder(IDL);
const confirmTransactionInitialTimeout = 120 * 1000;
const providerUrl = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

const providerOptions = {
    preflightCommitment: 'confirmed',
    commitment: 'confirmed',
};
const providerConnection = new Connection(providerUrl, {
    commitment: providerOptions.commitment,
    confirmTransactionInitialTimeout
});

const readOnlyWallet = {
    publicKey: anchor.web3.Keypair.generate().publicKey,
    signTransaction: async (tx) => {
        throw new Error(
            "Can't call signTransaction() on read only wallet"
        );
    },
    signAllTransactions: async (txs) => {
        throw new Error(
            "Can't call signAllTransactions() on read only wallet"
        );
    },
};
// Set the provider
// Returns a provider read from the ANCHOR_PROVIDER_URL environment variable
const provider = new anchor.AnchorProvider(providerConnection, readOnlyWallet, providerOptions)
anchor.setProvider(provider);

// Generate the program client from IDL
const program = new anchor.Program(IDL, new PublicKey("bidoyoucCtwvPJwmW4W9ysXWeesgvGxEYxkXmoXTaHy"), provider);
// Function to initiate or reinitiate WebSocket connection
function initiateHighBidWebSocketConnection(program = "bidoyoucCtwvPJwmW4W9ysXWeesgvGxEYxkXmoXTaHy") {
    // const ws = new WebSocket(`wss://atlas-devnet.helius-rpc.com?api-key=${process.env.HELIUS_API_KEY}`); // DEVNET
    const ws = new WebSocket(`wss://atlas-mainnet.helius-rpc.com?api-key=${process.env.HELIUS_API_KEY}`); // MAINNET
    ws.on('open', () => handleWebSocketOpen(ws, program));
    ws.on('message', handleWebSocketMessage);
    ws.on('error', handleWebSocketError);
    ws.on('close', () => handleWebSocketClose(program));
}

function handleWebSocketOpen(ws, program) {
    console.log('High Bid WebSocket is open, program: ', program);
    sendRequest(ws, program);
}

function handleWebSocketMessage(data) {
    processIncomingMessage(data).catch(console.error);
}

function handleWebSocketError(err) {
    console.error('High Bid WebSocket error:', err);
}

function handleWebSocketClose() {
    console.log('High Bid WebSocket is closed. Attempting to reconnect...');
    setTimeout(() => initiateHighBidWebSocketConnection(), 5000); // Reconnect after 5 seconds
}

// Function to send a request to the WebSocket server
function sendRequest(ws, program) {
    const request = {
        jsonrpc: "2.0",
        id: 420,
        method: "transactionSubscribe",
        params: [
            {
                accountInclude: [program]
            },
            {
                commitment: "finalized",
                encoding: "jsonParsed",
                transactionDetails: "full",
                showRewards: false,
                maxSupportedTransactionVersion: 0
            }
        ]
    };
    ws.send(JSON.stringify(request));
}

async function processIncomingMessage(data) {
    const messageStr = data.toString('utf8');
    try {
        const messageObj = JSON.parse(messageStr);

        if (messageObj && messageObj.method == "transactionNotification") { // change to === in prod

            const transaction = [messageObj.params.result.transaction];

            const acceptedCollections = {
              '2SBsLb5CwstwxxDmbanRdvV9vzeACRdvYEJjpPSFjJpE': {
                name: 'Bears Reloaded',
                image: '',
                twitter: 'https://twitter.com/BearsReloaded',
                decoration: '🐻',
                link: hyperlink(
                  'Bears Reloaded',
                  'https://twitter.com/BearsReloaded'
                ),
                floorValue: 0,
                count: 0,
              },
              BEArZkWNAB8xGRzsKzyQy6orjeZqMefMfmMWbJPqRr6o: {
                name: 'Solbears',
                image: '',
                twitter: 'https://twitter.com/WeAreBuilders_',
                decoration: '🐻',
                link: hyperlink(
                  'Solbears',
                  'https://twitter.com/BearsReloaded'
                ),
                floorValue: 0,
                count: 0,
              },
              Ah8Jvc4pLq2WCV3MCAme2viDoavmqc7PskUkhrhiF3m8: {
                name: 'People Nipple Cats',
                image: '',
                twitter: 'https://twitter.com/WeAreBuilders_',
                decoration: '😼',
                link: hyperlink(
                  'People Nipple Cats',
                  'https://twitter.com/BearsReloaded'
                ),
                floorValue: 0,
                count: 0,
              },
              GxPPZB5q1nsUTPw8Kkp4qUpbegrGxHiJfgzm3V43zjAy: {
                name: 'Ded Monkes',
                image: '',
                twitter: 'https://twitter.com/DegenMonkes',
                decoration: '💀',
                link: hyperlink(
                  'Ded Monkes',
                  'https://twitter.com/DegenMonkes'
                ),
                floorValue: 0,
                count: 0,
              },
              '5f2zrjBonizqt6LiHSDfbTPH74sHMZFahYQGyPNh825G': {
                name: 'BAPE',
                image: '',
                twitter: 'https://twitter.com/WeAreBuilders_',
                decoration: '🐵',
                link: hyperlink('BAPE', 'https://twitter.com/WeAreBuilders_'),
                floorValue: 0,
                count: 0,
              },
              BiwemBos3Su9QcNUiwkZMbSKi7m959t5oVpmPnM9Z3SH: {
                name: 'LIFINITY Flares',
                image: '',
                twitter: 'https://twitter.com/Lifinity_io',
                decoration: '🔥',
                link: hyperlink(
                  'LIFINITY Flares',
                  'https://twitter.com/Lifinity_io'
                ),
                floorValue: 0,
                count: 0,
              },
              '1qYQboR1jkeDZdbwBCpXbBcNGPTPh9T5iHWmkvyrtAh': {
                name: 'Netrunner',
                image: '',
                twitter: 'https://twitter.com/NetrunnerTax',
                decoration: '🪙',
                link: hyperlink(
                  'Netrunner',
                  'https://twitter.com/NetrunnerTax'
                ),
                floorValue: 0,
                count: 0,
              },
              A9UQNRecVBGzokYvXr9A727VCHjp3LZMcQXKxqTqY1Zd: {
                name: 'Ape Energy Labs',
                image: '',
                twitter: 'https://twitter.com//Gleam_dApp',
                decoration: '🔌',
                link: hyperlink(
                  'Ape Energy Labs',
                  'https://twitter.com//Gleam_dApp'
                ),
                floorValue: 0,
                count: 0,
              },
              EBZXnEpDU2JQpPDdmUC8T9NJgD1RU1vxDZFCEj4MmtjL: {
                name: 'Phase Passports',
                image: '',
                twitter: 'https://twitter.com/phaselabs_',
                decoration: '⚡️',
                link: hyperlink(
                  'Phase Passports',
                  'https://twitter.com/phaselabs_'
                ),
                floorValue: 0,
                count: 0,
              },
              '596Ts1WPD3rTUfTvow4rgnMgFvreuJQbQw9YA8Rgg21t': {
                name: 'Sketchy Scales',
                image: '',
                twitter: 'https://twitter.com/SketchyScales',
                decoration: '🦎',
                link: hyperlink(
                  'Sketchy Scales',
                  'https://twitter.com/SketchyScales'
                ),
                floorValue: 0,
                count: 0,
              },
            };
            (async () => {
                for (const txResponse of transaction) {

                    // console.log("txResponse: ", txResponse);
                    const signature = txResponse.transaction.signatures[0];
                    console.log(`Processing tx: ${signature}`);

                    if (txResponse.meta && txResponse.meta.err !== null) {
                    continue;
                    }

                    const instructions = txResponse.transaction.message.instructions;
                    // console.log("instructions: ", instructions);

                    for (const ix of instructions) {
                        const ixProgram = ix.programId;

                        if (ixProgram !== "bidoyoucCtwvPJwmW4W9ysXWeesgvGxEYxkXmoXTaHy") {
                            continue;
                        }

                        const decodedIx = BIDDING_CODER.instruction.decode(bs58.decode(ix.data));
                        if (!decodedIx) {
                            console.log(`Failed to decode instruction for signature ${signature}`);
                            continue;
                        }

                        console.log('Decoded Ix name: ', decodedIx.name);

                        if (decodedIx.name === 'updateHighBid') {
                            console.log('Update High Bid Transaction');
                            const highBidIx = decodedIx.data;

                            // Auction ID from IX
                            // const nftEscrowAccount = new PublicKey(ix.accounts[1]);

                            // Timestamp of HighestBid
                            // const highestBidTs = Number(highBidIx.args.highestBidTs);
                            const highestBidderPubkey = highBidIx.args.highestBidder;
                            const highestBidPubkey = highBidIx.args.highestBid;
                            let bidData = await program.account.bidEscrow.fetch(highestBidPubkey);
                            let collectionsInBid = await bidData.collections;
                            let oracles = await program.account.oracle.all();
                            let discordStringBuilder = '';
                            let totalFloorPrice = 0;
                            let totalNftsCount = 0;
                            for(let i = 0; i < collectionsInBid.length; i++) {
                                let currentCollectionObject = collectionsInBid[i];
                                let currentCollectionCount = Number(currentCollectionObject.count);
                                let currentCollectionId = currentCollectionObject.value.toString();
                                // let currentCollectionOracle = oracles.find((oracle) => oracle.account.collection.toString() === currentCollectionId);
                                let currentCollectionOracle = oracles.find((oracle) => oracle && oracle.account && oracle.account.collection && oracle.account.collection.toString() === currentCollectionId);
                                // console.log(Number(currentCollectionOracle?.account?.floorPrice)/1000000000);
                                let currentCollectionFloorPrice = Number(currentCollectionOracle.account.floorPrice)/1000000000; // this has 9 decimals
                                if(currentCollectionId !== "SUB1orE6jSMF8K627BPLXyJY5LthVyDriAxTXdCF4Cy") {
                                    let currentCollectionName = acceptedCollections[currentCollectionId];
                                    acceptedCollections[currentCollectionId]['count'] = currentCollectionCount;
                                    acceptedCollections[currentCollectionId]['floorValue'] = currentCollectionFloorPrice;
                                    let currentCollectionValue = currentCollectionCount * currentCollectionFloorPrice;
                                    totalFloorPrice += currentCollectionValue;
                                    totalNftsCount += currentCollectionCount;
                                    if (currentCollectionCount > 0) {
                                        discordStringBuilder += `${acceptedCollections[currentCollectionId]['decoration']} ${acceptedCollections[currentCollectionId]['link']}: **${currentCollectionCount}** NFTs | Floor: **${currentCollectionFloorPrice.toFixed(2)}** | Value: **${currentCollectionValue.toFixed(2)}**\n`;
                                    }
                                }
                            }

                            discordStringBuilder += `🏆 **Total:** **${totalNftsCount}** NFTs 💛 | Value: **${totalFloorPrice.toFixed(
                              2
                            )}** SOL `;
                            // After the loop, log the occurrence counts
                            // console.log("Occurrences by Collection Name:", occurrenceCounter);

                            mainImg = 'https://i.ibb.co/r3zBxc2/rad-Ticket.png';

                            // Discord displaying
                            (async () => {
                                const solscan = hyperlink('Solscan', `https://solscan.io/account/${highestBidderPubkey}`);
                                const solanafm = hyperlink('SolanaFM', `https://solana.fm/address/${highestBidderPubkey}`);

                                const newBid = new EmbedBuilder()
                                    .setTitle(`**_Prepare the incinerator..._**`)
                                    .setDescription(`**A new high bid has been set!** 🔥`) // can change the emoji when inside the said service, right click on the emoji, copy text
                                    .setColor('#fce184')
                                    .setImage(`${mainImg}`)
                                    .addFields(
                                        {
                                            name: 'Offerings:', 
                                            value: discordStringBuilder, 
                                            inline: true
                                            // name: 'Offerings:', value: `💀 ${DM}: **${dedMonkesCount}x** NFTs\n🐻 ${BR}: **${bearsReloadedCount}x** NFTs\n🐵 ${BP}: **${bapeCount}x** NFTs\n🔥 ${LF}: **${lifinityCount}x** NFTs\n🏆 Total: **${totalNftsCount}** NFTs 💛`, inline: true
                                        },
                                    )
                                    .addFields(
                                        { name: 'Bidder:', value: `\`${highestBidderPubkey.toString()}\``, inline: false }
                                    )
                                    .addFields(
                                        { name: 'Links:', value: `🔎 ${solscan} 🕵️ ${solanafm}`, inline: false }
                                    )
                                    .setFooter({ text: 'https://twitter.com/RadiantsDAO', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png' });

                                // Sending embed
                                for (const [guildId, guild] of client.guilds.cache) {
                                    if (config.guilds[guildId]) {
                                        const channelId = config.guilds[guildId];
                                        try {
                                            const channel = await client.channels.fetch(channelId.channelId); // Fetch the channel
                                            if (channel) {
                                                await channel.send({ embeds: [newBid] });
                                            } else {
                                                console.log(`Channel not found in guild: ${guildId}`);
                                            }
                                        } catch (error) {
                                            console.error(`Failed to send message in guild: ${guildId}, error: ${error}`);
                                        }
                                    } else {
                                        console.log(`No channel configured for guild: ${guildId}`);
                                    }
                                }
                            })();
                        }
                    }
                }
            })();

        } else {
            console.log('Whoops... Still not a DepositNft transaction.')
        }
    } catch (e) {
        console.error('Failed to parse JSON:', e);
    }
}

client.login(process.env.TOKEN);
//initiateHighBidWebSocketConnection();
module.exports = { initiateHighBidWebSocketConnection };