import { PublicKey } from "@solana/web3.js"

export default function shortString(str?: string, len:number=4): string {
    if (str === undefined) return ""
    if (str.length < 2*len+3) return str
    return str !== undefined ?
    `${str.slice(0, len)}...${str.slice(-len)}` : ""
}

export function short(addressFull?: PublicKey): string {
    return shortString(addressFull?.toString())
}
