import axios from "axios"; // used to make HTTP requests from node. js or XMLHttpRequests from the browser

let apiPrefix = "https://blockstream.info/api"; // testing purposes using mainnet, but should be tstnet

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

  for (let i = 0; i < txids.length; i += 1) {
    const blockTxid = `${apiPrefix}/tx/${txids[i]}`;
    const response = await axios.get(blockTxid);
    arr.push(response.data);
  }

  console.log(arr);
  return arr;
}

async function main() {
  const url = `${apiPrefix}/blocks/tip/height`;
  const response = await axios.get(url);
  let numberOfBlocks = response.data;

  console.log("-----------NUMBER OF BLOCKS------------");
  console.log(numberOfBlocks);

  // const satoshiBlock =
  //   `${apiPrefix}/block/000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f`;
  // const blockResponse = await axios.get(satoshiBlock);

  // const responseData = response.data;
  // const blockData = blockResponse.data;

  //  console.log(responseData);

  console.log("----------------BLOCK----------------");
  // console.log(blockData);

  let apiEndpoint = "/parsed_block";
  const APIresponse = await axios.get(apiEndpoint);

  let start = 779832; // testing purposes, should be API endpoint:
  let end = 779833; // testing purposes, number of blocks

  for (let i = start; i < end; i += 1) {
    console.log("------------------GET BLOCK'S HASH----------------");
    let hash = await getBlockHash(i);
    console.log(hash);

    console.log("------------------GET BLOCK----------------");
    let block = await getBlock(hash.toString());
    console.log(block);

    console.log("------------------GET BLOCK TX IDs----------------");
    let txids = await getBlockTxids(hash);
    console.log(txids);

    console.log("------------TX ID-----------");
    // b61b0172d95e266c18aea0c624db987e971a5d6d4ebc2aaed85da4642d635735
    // console.log(await response2.data.witness);
  }
}

main();

/*
-------------------- Footnotes --------------------

-------------------- References --------------------
Blocksteam Esplora API - https://github.com/Blockstream/esplora/blob/master/API.md
*/
