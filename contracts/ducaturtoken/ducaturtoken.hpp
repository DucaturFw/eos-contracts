/**
 *  @file
 *  @copyright defined in eos/LICENSE.txt
 */
#pragma once

#include <eosiolib/asset.hpp>
#include <eosiolib/eosio.hpp>
#include <eosiolib/singleton.hpp>
#include <boost/container/flat_set.hpp>

#include <string>

namespace eosiosystem
{
class system_contract;
}

namespace ducatur
{
using boost::container::flat_set;
using eosio::asset;
using eosio::contract;
using eosio::symbol_name;
using std::string;

//@abi table accounts i64
struct account
{
  asset balance;

  uint64_t primary_key() const { return balance.symbol.name(); }
  EOSLIB_SERIALIZE(account, (balance))
};

//@abi table stat i64
struct stat
{
  asset supply;
  asset max_supply;
  account_name issuer;

  uint64_t primary_key() const { return supply.symbol.name(); }

  EOSLIB_SERIALIZE(stat, (supply)(max_supply)(issuer))
};

//@abi table holders i64
struct holder
{
  account_name holder_name;

  uint64_t primary_key() const { return holder_name; }

  EOSLIB_SERIALIZE(holder, (holder_name))
};

typedef eosio::multi_index<N(holders), holder> holders;
typedef eosio::multi_index<N(accounts), account> accounts;
typedef eosio::multi_index<N(stat), stat> stats;

class ducaturtoken : public contract
{
public:
  ducaturtoken(account_name s) : contract(s){};

  void create(account_name issuer,
              asset maximum_supply);

  void issue(account_name to, asset quantity, string memo);

  void transfer(account_name from,
                account_name to,
                asset quantity,
                string memo);

  inline asset get_supply(symbol_name sym) const;

  inline asset get_balance(account_name owner, symbol_name sym) const;

  void sub_balance(account_name owner, asset value);
  void add_balance(account_name owner, asset value, account_name ram_payer);

  void add_holder(account_name holder_name, account_name payer, uint64_t token);

  struct transfer_args
  {
    account_name from;
    account_name to;
    asset quantity;
    string memo;
  };
};

asset ducaturtoken::get_supply(symbol_name sym) const
{
  stats statstable(_self, sym);
  const auto &st = statstable.get(sym);
  return st.supply;
}

asset ducaturtoken::get_balance(account_name owner, symbol_name sym) const
{
  accounts accountstable(_self, owner);
  const auto &ac = accountstable.get(sym);
  return ac.balance;
}

} /// namespace eosio
