const fs = require("fs");
const eosic = require("eosic");
const Eos = require("eosjs");
const base58 = require("bs58");
const crypto = require("crypto");
const { ecc } = Eos.modules;
const { assert } = require("chai");

const [pub, wif] = [
  "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
  "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"
];

const eos = Eos({
  keyProvider: wif
});

describe("exchange", () => {
  let tokenAccount, tokenContract;

  it("deploy token contract", async () => {
    const { account, contract } = await eosic.createContract(
      pub,
      eos,
      "ducaturtoken"
    );
    tokenAccount = account;
    tokenContract = contract;

    console.log(
      await eos.getTableRows({
        code: tokenAccount,
        scope: tokenAccount,
        table: "holders",
        json: true,
        limit: 999
      })
    );
  });

  it("create and issue tokens", async () => {
    await tokenContract.create("eosio", `1000000.0000 DUCAT`, {
      authorization: ["eosio", tokenAccount]
    });
    await tokenContract.issue("eosio", `1000000.0000 DUCAT`, "memo", {
      authorization: ["eosio", tokenAccount]
    });

    console.log(
      await eos.getTableRows({
        code: tokenAccount,
        scope: "DUCAT",
        table: "holders",
        json: true,
        limit: 999
      })
    );
  });

  it("balance", async () => {
    console.log(
      await eos.getTableRows({
        code: tokenAccount,
        scope: "eosio",
        table: "accounts",
        json: true,
        limit: 999
      })
    );
  });

  it("transfer tokens", async () => {
    const accs = [
      "holder1",
      "holder2",
      "holder3",
      "testacc",
      "alerdenisov",
      "ducatur"
    ];
    await Promise.all(
      accs.map(acc =>
        eos.newaccount({
          creator: "eosio",
          name: acc,
          owner: pub,
          active: pub
        })
      )
    );

    await Promise.all(
      accs.map(acc =>
        tokenContract.transfer("eosio", acc, "1000.0000 DUCAT", acc, {
          authorization: ["eosio", tokenAccount]
        })
      )
    );
  });

  it("holders list", async () => {
    console.log(
      await eos.getTableRows({
        code: tokenAccount,
        scope: "DUCAT",
        table: "holders",
        json: true,
        limit: 999
      })
    );
  });
});
