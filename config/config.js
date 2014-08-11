'use strict';

var network = process.env.INSIGHT_NETWORK || 'testnet';
var currency = process.env.INSIGHT_CURRENCY || 'btc';
var apiPrefix = process.env.INSIGHT_APIPREFIX || '/api';
var frontendPrefix = process.env.INSIGHT_FRONTENDPREFIX || '/';
var socketioPath = process.env.INSIGHT_SOCKETIOPATH || '/socket.io';

var config_currency = {
    btc:{
      db:'.insight',
      name:'bitoin',
      nameCamel:'Bitcoin',
      livenet: {
        port:3000,
        rpc_port:8332,
        p2p_port:8333
      },
      testnet:{
        port:3001,
        rpc_port:18332,
        p2p_port:18333
      }
    },
    ltc:{
      db:'.insight_litecoin',
      name:'litecoin',
      nameCamel:'Litecoin',
      livenet: {
        port:3002,
        rpc_port:9332,
        p2p_port:9333
      },
      testnet:{
        port:3003,
        rpc_port:19332,
        p2p_port:19333
      }
    },
    doge:{
      db:'.insight_dogecoin',
      name:'dogecoin',
      nameCamel:'Dogecoin',
      livenet: {
        port:3004,
        rpc_port:22555,
        p2p_port:22556
      },
      testnet:{
        port:3005,
        rpc_port:44555,
        p2p_port:44556
      }
    }
}
var path = require('path'),
  fs = require('fs'),
  rootPath = path.normalize(__dirname + '/..'),
  env,
  db;

var packageStr = fs.readFileSync('package.json');
var version = JSON.parse(packageStr).version;


function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

var home = process.env.INSIGHT_DB || (getUserHome() + '/' + config_currency[currency].db);

if (network === 'livenet') {
  env = 'livenet';
  db = home;
} else {
  env = 'testnet';
  db = home + '/testnet';
}


switch (process.env.NODE_ENV) {
  case 'production':
    env += '';
    break;
  case 'test':
    env += ' - test environment';
    break;
  default:
    env += ' - development';
    break;
}



var dataDir = process.env.BITCOIND_DATADIR;
var isWin = /^win/.test(process.platform);
var isMac = /^darwin/.test(process.platform);
var isLinux = /^linux/.test(process.platform);
if (!dataDir) {
  if (isWin) dataDir = '%APPDATA%\\' + config_currency[currency].nameCamel + '\\';
  if (isMac) dataDir = process.env.HOME + '/Library/Application Support/' + config_currency[currency].nameCamel + '/';
  if (isLinux) dataDir = process.env.HOME + '/.' + config_currency[currency].name + '/';
}
dataDir += network === 'testnet' ? 'testnet3' : '';

var safeConfirmations = process.env.INSIGHT_SAFE_CONFIRMATIONS || 6;
var ignoreCache = process.env.INSIGHT_IGNORE_CACHE || 0;


var bitcoindConf = {
  protocol: process.env.BITCOIND_PROTO || 'http',
  user: process.env.BITCOIND_USER || 'user',
  pass: process.env.BITCOIND_PASS || 'pass',
  host: process.env.BITCOIND_HOST || '127.0.0.1',
  port: process.env.BITCOIND_PORT || config_currency[currency][network].rpc_port,
  p2pPort: process.env.BITCOIND_P2P_PORT || config_currency[currency][network].p2p_port,
  p2pHost: process.env.BITCOIND_P2P_HOST || process.env.BITCOIND_HOST || '127.0.0.1',
  dataDir: dataDir,
  // DO NOT CHANGE THIS!
  disableAgent: true
};

/*jshint multistr: true */
console.log(
  '\n\
    ____           _       __    __     ___          _ \n\
   /  _/___  _____(_)___ _/ /_  / /_   /   |  ____  (_)\n\
   / // __ \\/ ___/ / __ `/ __ \\/ __/  / /\| \| / __ \\/ / \n\
 _/ // / / (__  ) / /_/ / / / / /_   / ___ |/ /_/ / /  \n\
/___/_/ /_/____/_/\\__, /_/ /_/\\__/  /_/  |_/ .___/_/   \n\
                 /____/                   /_/           \n\
\n\t\t\t\t\t\tv%s\n\
  # Configuration:\n\
\t\tNetwork: %s\tINSIGHT_NETWORK\n\
\t\tDatabase Path:  %s\tINSIGHT_DB\n\
\t\tSafe Confirmations:  %s\tINSIGHT_SAFE_CONFIRMATIONS\n\
\t\tIgnore Cache:  %s\tINSIGHT_IGNORE_CACHE\n\
 # Bicoind Connection configuration:\n\
\t\tRPC Username: %s\tBITCOIND_USER\n\
\t\tRPC Password: %s\tBITCOIND_PASS\n\
\t\tRPC Protocol: %s\tBITCOIND_PROTO\n\
\t\tRPC Host: %s\tBITCOIND_HOST\n\
\t\tRPC Port: %s\tBITCOIND_PORT\n\
\t\tP2P Host: %s\tBITCOIND_P2P_HOST\n\
\t\tP2P Port: %s\tBITCOIND_P2P_PORT\n\
\t\tData Dir: %s\tBITCOIND_DATADIR\n\
\t\t%s\n\
\t\tCurrency: %s\tINSIGHT_CURRENCY\n\
\t\tApi prefix: %s\tINSIGHT_APIPREFIX\n\
\t\tFront End prefix: %s\tINSIGHT_FRONTENDPREFIX\n\
\t\tSocket.io path: %s\tINSIGHT_SOCKETIOPATH\n\
\nChange setting by assigning the enviroment variables in the last column. Example:\n\
 $ INSIGHT_NETWORK="testnet" BITCOIND_HOST="123.123.123.123" ./insight.js\
\n\n',
  version,
  network, home, safeConfirmations, ignoreCache ? 'yes' : 'no',
  bitcoindConf.user,
  bitcoindConf.pass ? 'Yes(hidden)' : 'No',
  bitcoindConf.protocol,
  bitcoindConf.host,
  bitcoindConf.port,
  bitcoindConf.p2pHost,
  bitcoindConf.p2pPort,
  dataDir + (network === 'testnet' ? '*' : ''), 
  (network === 'testnet' ? '* (/testnet3 is added automatically)' : ''),
  currency,
  apiPrefix,
  frontendPrefix,
  socketioPath
);


if (!fs.existsSync(db)) {
  var err = fs.mkdirSync(db);
  if (err) {
    console.log(err);
    console.log("## ERROR! Can't create insight directory! \n");
    console.log('\tPlease create it manually: ', db);
    process.exit(-1);
  }
}

module.exports = {
  root: rootPath,
  publicPath: process.env.INSIGHT_PUBLIC_PATH || false,
  appName: 'Insight ' + config_currency[currency].nameCamel + " " + env,
  apiPrefix: apiPrefix,
  frontendPrefix: frontendPrefix,
  socketioPath: socketioPath,
  port: config_currency[currency][network].port,
  leveldb: db,
  bitcoind: bitcoindConf,
  network: network,
  disableP2pSync: false,
  disableHistoricSync: false,
  poolMatchFile: rootPath + '/etc/minersPoolStrings.json',

  // Time to refresh the currency rate. In minutes
  currencyRefresh: 10,
  keys: {
    segmentio: process.env.INSIGHT_SEGMENTIO_KEY
  },
  safeConfirmations: safeConfirmations, // PLEASE NOTE THAT *FULL RESYNC* IS NEEDED TO CHANGE safeConfirmations
  ignoreCache: ignoreCache,
  currency: currency
};
