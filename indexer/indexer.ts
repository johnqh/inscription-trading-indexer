import axios from "axios"; // used to make HTTP requests from node. js or XMLHttpRequests from the browser
import { BitcoinInscriptionService } from "./inscription";
import sleep from "sleep";

let apiPrefix = "https://blockstream.info/testnet/api";

// Class to Get Insctiptions
const service = new BitcoinInscriptionService();

// Database API
const serverURL = "http://localhost:3000";

// Get a Block's Hash
async function getBlockHash(block: number) {
  // Block's Hash
  const getBlockHash = `${apiPrefix}/block-height/${block}`;
  const response = await axios.get(getBlockHash);

  return await response.data;
}

// Get Block's TX IDs
async function getBlockTxids(hash: string) {
  // Get Block's Transaction
  const blockTxids = `${apiPrefix}/block/${hash}/txids`;
  const response = await axios.get(blockTxids);

  return await response.data;
}

// Loop through a Block's Transactions and Looking for Inscriptions
async function getInscriptions(txids: string[]) {
  let arr: any[] = [];

  // Looping through All the Transactions of the Current Block
  for (let i = 0; i < txids.length; i += 1) {
    try {
      console.log("\tTRANSACTION: ", i, ": ", txids[i]);
      let inscription = await service.getInscription(txids[i]);
      console.log("INSCRIPTION: ", inscription);
      arr.push(inscription);
    } catch (e) {
      continue;
    }
  }

  return arr;
}

async function main() {
  const url = `${apiPrefix}/blocks/tip/height`;
  const response = await axios.get(url);
  let numberOfBlocks: number = response.data;

  // BRC-20's didn't start until March 2023, thus doesn't make sense to start
  // from 0, so starting from the most recent block around that time
  let start: number = 2420000;

  try {
    let apiEndpoint = serverURL + "/parsed_block";
    const APIresponse = await axios.get(apiEndpoint);

    start = APIresponse.data.last_parsed_block + 1;
  } catch (err) {
    console.error(err);
  }

  // Mainnet Block #: 779832 - Testing Mint
  // Mainnet Block #: 831085 - Testing Transfer

  const end = numberOfBlocks;
  console.log("Scraping from " + start + " to " + end);

  for (let block = start; block < end; block += 1) {
    console.log("BLOCK HEIGHT: ", block);

    // Current Block's Hash
    const hash = await getBlockHash(block);
    console.log("BLOCK HASH: ", hash);
    sleep.msleep(255); // Sleeping to avoid 429 Error - Too Many Requests from Blockstream API

    // Current Block's Transactions
    const txids = await getBlockTxids(hash);
    sleep.msleep(255); // Sleeping to avoid 429 Error - Too Many Requests from Blockstream API

    // Current Block's Array of Inscriptions
    const inscriptions = await getInscriptions(txids);

    // Loop through Inscriptions Array
    for (let inscription of inscriptions) {
      try {
        // Payload
        const json = JSON.parse(inscription.contentString);

        // Deploy Operation
        if (json.op == "deploy") {
          // Poopulating the Table
          const response = await axios.post(serverURL + "/deploy", {
            tick: json.tick,
            max: parseInt(json.max),
            lim: parseInt(json.lim),
            block: block,
          });

          // Mint/Transfer Operation
        } else if (json.op == "mint" || json.op == "transfer") {
          let action = json.op == "mint" ? 0 : 1;

          // Retrieve Sender & Destination from Transaction Associated with Current Inscription
          let txresponse = await axios.get(
            `${apiPrefix}/tx/${inscription.txId}`
          );
          sleep.msleep(255); // Sleeping to avoid 429 Error - Too Many Requests from Blockstream API
          let transaction = txresponse.data;
          let sender = transaction.vin[0].prevout.scriptpubkey_address;
          let destination = transaction.vout[0].scriptpubkey_address;
          let amt = parseInt(json.amt);

          // Populating the Table
          const actionResponse = await axios.post(serverURL + "/actions", {
            address: sender || null,
            tick: json.tick || null,
            action: action,
            amt: amt || null,
            destination: destination || null,
            block: block,
          });

          // Update Holding
          let holding = await axios.get(
            serverURL + `/holdings?address=${sender}&tick=${json.tick}`
          );
          let holdingData = holding.data;
          let balance = 0;
          if (holdingData.length != 0) {
            balance = holdingData[0].amt;
          }

          if (action == 1) {
            amt *= -1;
          }

          const holdingResponse = await axios.post(serverURL + "/holdings", {
            address: sender || null,
            tick: json.tick || null,
            amt: balance + amt,
            updated_at_block: block,
          });
        }
      } catch (e) {
        continue;
      }
    }

    // Logging Last Block We Parsed In Case We Need to Restart the Indexer
    const lastParsedBlockResponse = await axios.post(
      serverURL + "/parsed_block",
      {
        last_parsed_block: block,
      }
    );
  }
}

main();

/*
-------------------- References --------------------
Blocksteam Esplora API - https://github.com/Blockstream/esplora/blob/master/API.md
getInscription() - https://gist.github.com/ordinalOS/ae725bde82f9943a3b1e0911210765e8
Blockchain Explorer - https://www.blockchain.com/explorer
Magic Eden -  https://magiceden.io/ordinals/item-details/f133976ad4518df63c404d8d5cddc3aae6c5d431b6beddb1a1bc8d69ba3d2111i0
Blockchain Explorer for Sample Transfer - https://www.blockchain.com/explorer/transactions/btc/f133976ad4518df63c404d8d5cddc3aae6c5d431b6beddb1a1bc8d69ba3d2111
Testnet Explorer - https://blockstream.info/testnet/
Blockstream 429 Error - https://github.com/Blockstream/esplora/issues/449
*/
