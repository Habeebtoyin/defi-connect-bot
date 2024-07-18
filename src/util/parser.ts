export const customZetaPrice = 0.85;

export const priceMapper = {
	"3": {
	   "1": 1400,
	   "2": 1300,
	   "3": 1200,
	   "4": 1100,
	   "5": 1000,
	   "6": 900,
	   "7": 800,
	   "8": 700,
	   "9": 600,
	   "10": 500,
	   "11": 400,
	   "12": 300,
	   "13": 200
   },
   "6": {
	   "1": 1500,
	   "2": 1400,
	   "3": 1300,
	   "4": 1200,
	   "5": 1100,
	   "6": 1000,
	   "7": 900,
	   "8": 800,
	   "9": 700,
	   "10": 600,
	   "11": 500,
	   "12": 400,
	   "13": 300
   },
   "12": {
	   "1": 1600,
	   "2": 1500,
	   "3": 1400,
	   "4": 1300,
	   "5": 1200,
	   "6": 1100,
	   "7": 1000,
	   "8": 900,
	   "9": 800,
	   "10": 700,
	   "11": 600,
	   "12": 500,
	   "13": 400
   },
   "24": {
	   "1": 1700,
	   "2": 1600,
	   "3": 1500,
	   "4": 1400,
	   "5": 1300,
	   "6": 1200,
	   "7": 1100,
	   "8": 1000,
	   "9": 900,
	   "10": 800,
	   "11": 700,
	   "12": 600,
	   "13": 500
   }
}



export const initTaxObject = {
	"2-%": 2,
	"6-%": 6,
	"10-%": 10,
};
export const finalTaxObject = {
	"2-%": 2,
	"6-%": 6,
	"10-%": 10,
};
export const DecimalObject = {
	"9": 9,
	"18": 18,
	"10": 10,
	"8": 8,
};

export const TotalSupplyObject = {
	"1-billion": 1000000000,
	"1-million": 1000000,
	"10-million": 10000000,
	"100-million": 100000000,
};

export const boldenText = (text: string) => `<b>${text}</b>`;
export const makeCopiable = (text: string) => `<code>${text}</code>`;
export const addHyperLink = (body: string, link: string) =>
	`<a href="` + `${link}` + `">${body}</a>`;
export const codeBlock = (text: string) => `<code>${text}</code>`;
export const addSpoiler = (text: string) =>
`<span class="tg-spoiler">${text}</span>`;

export function trimAddress(walletAddress: string, length = 8) {
	if (walletAddress.length <= length) {
		return walletAddress; // No need to trim if it's shorter than the specified length
	}
	const start = walletAddress.slice(0, length);
	const end = walletAddress.slice(-length);
	const trimmedAddress = `${start}...${end}`;
	return trimmedAddress;
}

export const zetaScanParser = (tokenName: string, address: string) => `<a href="https://explorer.zetachain.com/address/${address}">${tokenName}</a>`;
export const groupLinkParser = (link: string, groupName: string) => `<a href="${link}">${groupName}</a>`;
export const dexToolParser = (text: string, address: string) => `<a href="https://www.dextools.io/app/en/zeta/pair-explorer/${address}">${text}</a>`;
export const dexScreenerParser = (text: string, address: string) => `<a href="https://dexscreener.com/zetachain/${address}">${text}</a>`;


export const modeDexScreenerParser = (text: string, address: string) => `<a href="https://dexscreener.com/mode/${address}">${text}</a>`;

export function addCommasToNumber(number: number): string {
    // Convert the number to a string
    let numberString: string = number.toString();

    // Split the string into integer and decimal parts (if any)
    const parts: string[] = numberString.split('.');

    // Add commas to the integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Join the integer and decimal parts back together
    const result: string = parts.join('.');

    return result;
}

