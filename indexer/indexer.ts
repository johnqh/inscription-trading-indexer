import axios from "axios"; // used to make HTTP requests from node. js or XMLHttpRequests from the browser
import { BitcoinInscriptionService } from "./inscription";

let apiPrefix = "https://blockstream.info/api"; // testing purposes using mainnet, but should be tstnet

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

// Get a Block
async function getBlock(hash: string) {
  // Get the Block
  const curBlock = `${apiPrefix}/block/${hash}`;
  const response = await axios.get(curBlock);

  return await response.data;
}

// Get Block's TX IDs
async function getBlockTxids(hash: string) {
  // Get Block's Transaction
  const blockTxids = `${apiPrefix}/block/${hash}/txids`;
  const response = await axios.get(blockTxids);

  return await response.data;
}

// Getting an Array of the Details of each Transaction in the Block
async function getTransactions(txids: string[]) {
  let arr: any[] = [];

  // Looping through to Get the Data of each Transactions
  for (let i = 0; i < txids.length; i += 1) {
    const blockTxid = `${apiPrefix}/tx/${txids[i]}`;
    const response = await axios.get(blockTxid);
    arr[i] = response.data;
  }

  // console.log(arr);
  return arr;
}

// Loop through a Block's Transactions and Looking for Inscriptions
async function getInscriptions(txids: string[]) {
  let arr: any[] = [];

  // For testing purposes it is looping from 400 - 800, but should be 0 - txids.length
  for (let i = 0; i < txids.length; i += 1) {
    try {
      console.log(i);
      console.log(txids[i]);
      let inscription = await service.getInscription(txids[i]);
      console.log(inscription);
      arr.push(inscription);
    } catch (e) {
      continue;
    }
  }

  // console.log(arr);
  return arr;
}

async function main() {
  const url = `${apiPrefix}/blocks/tip/height`;
  const response = await axios.get(url);
  let numberOfBlocks: number = response.data;

  console.log("-----------NUMBER OF BLOCKS------------");
  // console.log(numberOfBlocks);

  // const satoshiBlock =
  //   `${apiPrefix}/block/000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f`;
  // const blockResponse = await axios.get(satoshiBlock);

  // const responseData = response.data;
  // const blockData = blockResponse.data;

  //  console.log(responseData);

  console.log("----------------BLOCK----------------");
  // console.log(blockData);

  let apiEndpoint = serverURL + "/parsed_block";
  const APIresponse = await axios.get(apiEndpoint);

  let start: number = APIresponse.data.last_parsed_block;
  console.log(start);

  if (!start) {
    start = 779832;
  } else {
    start++;
  }

  // 779832

  //start = 831087; // testing purposes, should be API endpoint:
  let end = numberOfBlocks; // testing purposes, number of blocks

  for (let block = start; block < end; block += 1) {
    console.log("------------------GET BLOCK'S HASH----------------");
    let hash = await getBlockHash(block);
    // console.log(hash);

    console.log("------------------GET BLOCK----------------");
    // let block = await getBlock(hash.toString());
    // console.log(block);

    console.log("------------------GET BLOCK TX IDs----------------");
    let txids = await getBlockTxids(hash);
    // console.log(txids);

    console.log("------------------BLOCK INSCRIPTIONS----------------");

    const inscriptions = await getInscriptions(txids);
    // console.log(inscriptions);

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

          console.log(response.data);

          // Mint/Transfer Operation
        } else if (json.op == "mint" || json.op == "transfer") {
          let action = json.op == "mint" ? 0 : 1;

          // Retrieve Sender & Destination from Transaction Associated with Current Inscription
          let txresponse = await axios.get(`${apiPrefix}/tx/${inscription.txId}`);
          let transaction = txresponse.data;
          console.log(inscription);
          console.log(transaction);
          console.log(transaction.vin[0]);
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
            console.log(actionResponse.data);

          // update holding
          let holding = await axios.get(serverURL + `/holdings?address=${sender}&tick=${json.tick}`);
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
            updated_at_block: block
          });
            console.log(holdingResponse.data);

        }
      } catch (e) {
        continue;
      }

      
    }

    console.log("------------TX ID-----------");
    // b61b0172d95e266c18aea0c624db987e971a5d6d4ebc2aaed85da4642d635735
    // console.log(await response2.data.witness);

    let transactions = await getTransactions([
      "f133976ad4518df63c404d8d5cddc3aae6c5d431b6beddb1a1bc8d69ba3d2111",
    ]);
    // console.log(transactions[0].vin[0]);
    //  console.log(transactions[0].vout[0]);
    //   console.log(transactions[0].vout[1]);

    console.log("------------PARSED BLOCK-----------");

    // Logging Last Block We Parsed In Case We Need to Restart the Indexer
    const lastParsedBlockResponse = await axios.post(
      serverURL + "/parsed_block",
      {
        last_parsed_block: block
      }
    );
    console.log(lastParsedBlockResponse.data);
  }
}

main();

/*
-------------------- Footnotes --------------------

-------------------- References --------------------
Blocksteam Esplora API - https://github.com/Blockstream/esplora/blob/master/API.md
getInscription() - https://gist.github.com/ordinalOS/ae725bde82f9943a3b1e0911210765e8
Blockchain Explorer - https://www.blockchain.com/explorer
Magic Eden -  https://magiceden.io/ordinals/item-details/f133976ad4518df63c404d8d5cddc3aae6c5d431b6beddb1a1bc8d69ba3d2111i0
*/
