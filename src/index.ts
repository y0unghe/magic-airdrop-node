import express, { Express, Request, Response } from "express";
import { whitelistAddresses } from "./whitelistAddresses";
import MerkleTree from 'merkletreejs'
import { keccak256 } from 'web3-utils'

const app: Express = express();
const port = process.env.PORT || 3000;

const buf2hex = (x: Buffer) => {
    return '0x' + x.toString('hex')
}

app.get("/proof", (req: Request, res: Response) => {
    const { address } = req.query

    if (address && typeof address === 'string') {
        const leaves = whitelistAddresses.map((x) => keccak256(x))
        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })

        const leaf = keccak256(address)
        const proof = tree.getProof(leaf).map((x) => buf2hex(x.data))

        res.json({
            proof
        })
    } else {
        res.json({
            error: "Invalid address"
        })
    }
});

app.listen(port, () => {
    console.log(`[server]: Server is running at ${port}`);
});
