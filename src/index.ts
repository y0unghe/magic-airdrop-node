import express, { Express, Request, Response } from "express";
import { whitelistAddresses } from "./whitelistAddresses";
import MerkleTree from 'merkletreejs'
import { keccak256 } from 'web3-utils'
import cors from "cors";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { readFileSync } from "fs";

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors())

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

app.get('/b2/proof', (req: Request, res: Response) => {
    const { address } = req.query

    let proof: string[] = [];

    if (address && typeof address === 'string') {
        const tree = StandardMerkleTree.load(JSON.parse(readFileSync("tree.json", "utf8")));
        for (const [i, v] of tree.entries()) {
            const treeAddress: string = v[0]
            if (treeAddress.toLowerCase() === address.toLowerCase()) {
                proof = tree.getProof(i);
                break
            }
        }

        res.json({
            proof
        })
    } else {
        res.json({
            error: "Invalid address"
        })
    }
})

app.listen(port, () => {
    console.log(`[server]: Server is running at ${port}`);
});
