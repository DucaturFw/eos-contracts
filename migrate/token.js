const eosic = require("eosic");
const Eos = require("eosjs");

const [pub, wif] = [
  "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
  "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"
];

const eos = Eos({
  keyProvider: wif
});

async function execute() {
  // deploy contract
  const { account, contract } = await eosic.createContract(
    pub,
    eos,
    "ducaturtoken",
    {
      contractName: "ducaturtoken"
    }
  );

  await contract.create("eosio", "1000000000.0000 DUCAT", {
    authorization: ["eosio", account]
  });

  await contract.issue("eosio", "1000000000.0000 DUCAT", "ducat", {
    authorization: ["eosio", account]
  });

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
      contract.transfer(
        "eosio",
        acc,
        `${(Math.random() * 5000).toFixed(4)} DUCAT`,
        acc,
        {
          authorization: ["eosio", account]
        }
      )
    )
  );

  await new Promise(resolve => setTimeout(resolve, 10000));

  const accs2 = ["extra1", "extra2"];
  await Promise.all(
    accs2.map(acc =>
      eos.newaccount({
        creator: "eosio",
        name: acc,
        owner: pub,
        active: pub
      })
    )
  );
  await Promise.all(
    accs2.map(acc =>
      contract.transfer(
        "eosio",
        acc,
        `${(Math.random() * 5000).toFixed(4)} DUCAT`,
        acc,
        {
          authorization: ["eosio", account]
        }
      )
    )
  );
}

execute();
