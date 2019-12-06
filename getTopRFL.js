const { iostPOSTRequest } = require("./iost");

const getTopRFL = async () => {
  const users = await new Promise(resolve => {
    
    iostPOSTRequest(
    "/getContractStorage",
    {
      id: "Contract857r7Xc6fyLidKkW26vuDKvDVXZRx8SZbwYxpKfX8PV9",
      key: "allPledgers",
      by_longest_chain: true,
    },
    (err, response) => {
      resolve(JSON.parse(JSON.parse(response).data));
    });
  });

  const totals = await new Promise((resolve) => {
    const fields = users.map(user => {
      return { field: user, key: "pledge" };
    });

    iostPOSTRequest(
      "/getBatchContractStorage",
      {
        id: "Contract857r7Xc6fyLidKkW26vuDKvDVXZRx8SZbwYxpKfX8PV9",
        key_fields: fields,
        by_longest_chain: true,
      },
      (err, response) => {
        const amounts = JSON.parse(response).datas;
  
        resolve(amounts);

      });
  });

  let result = [];
  users.forEach((user, i) => {
    const value = JSON.parse(totals[i]);
    value.user = user;
    result.push(value);
  });

  result = result.filter((item) => Number(item.amount) > 0)

  result.sort((a, b) => {
    return Number(b.amount) - Number(a.amount);
  });
  
  result = result.slice(0, 10);

  return result;
};

module.exports = getTopRFL;