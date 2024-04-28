const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const { secp256k1 } = require('ethereum-cryptography/secp256k1');
const { keccak256 } = require('ethereum-cryptography/keccak');
const { hexToBytes, toHex } = require('ethereum-cryptography/utils');

const balances = {
  "794249bbeb4ad75efdf8dcf7b3695e8faf21c771": 100,
  "ffc7c038ba2367d5b520f435e293d2540a03c9ea": 50,
  "eb8fe308ca07f3359e14902466160aea8051da5c": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { hashedMessage, signatureHex, recovery, recipient, amount } = req.body;

  let signature = secp256k1.Signature.fromCompact(signatureHex)
  signature = signature.addRecoveryBit(recovery)
  const publicKey = signature.recoverPublicKey(hexToBytes(hashedMessage)).toRawBytes();
  const hashedPublicKey = keccak256(publicKey.slice(1,65));
  const sender = toHex(hashedPublicKey.slice(-20));

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
