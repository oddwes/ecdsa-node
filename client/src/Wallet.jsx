import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex } from "ethereum-cryptography/utils.js";

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    const privateKey = evt.target.value
    setPrivateKey(evt.target.value)
    if (privateKey) {
      const publicKey = secp256k1.getPublicKey(privateKey).slice(1);
      const hashedPublicKey = keccak256(publicKey);
      const ethereumAddress = toHex(hashedPublicKey.slice(-20));
      setAddress(ethereumAddress)
      const {
        data: { balance },
      } = await server.get(`balance/${ethereumAddress}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input placeholder="Type in your private key, for example: 0x1" value={privateKey} onChange={onChange}></input>
      </label>

      <div className="balance">Address: {address}</div>
      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
