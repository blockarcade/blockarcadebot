const validIOSTAccount = (account) => {
  const validREGEX = /^[a-z0-9_]{5,11}$/;

  return validREGEX.test(account);
}

module.exports = validIOSTAccount;