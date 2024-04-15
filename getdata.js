require("dotenv").config();
const fs = require("fs");
const { Parser } = require("json2csv");

const api_key = process.env.API_KEY;
const network_id = process.env.NETWORK_ID;
const token_addr = process.env.TOKEN_ADDRESS;

const totalItem = 1000;
const itemPerPage = 100;
const numPages = Math.ceil(totalItem / itemPerPage);

const fetchAllPages = async () => {
  let allData = [];
  let currentPage = 1;

  while (currentPage <= numPages) {
    const response = await fetch(
      `https://api.chainbase.online/v1/token/top-holders?chain_id=${network_id}&contract_address=${token_addr}&page=${currentPage}&limit=${itemPerPage}`,
      {
        method: "GET",
        headers: {
          "x-api-key": api_key,
          accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`Error fetching page ${currentPage}: ${response.status}`);
      break;
    }

    const data = await response.json();
    const filteredData = data.data.map((item) => ({
      amount: item.amount,
      wallet_address: item.wallet_address,
    }));

    allData.push(...filteredData);

    if (data.data.length < itemPerPage) {
      break;
    }

    currentPage++;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return allData;
};

fetchAllPages()
  .then((allData) => {
    let jsonData = JSON.stringify(allData, null, 2);
    jsonData = allData.flat();
    const parser = new Parser();
    const csv = parser.parse(jsonData);
    fs.writeFileSync("data.csv", csv, "utf8");
  })
  .catch((error) => console.error(error));
