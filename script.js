// Solana wallet connection
let walletConnection = null;
let connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'));

// Reference to the Connect Wallet button
const connectWalletButton = document.getElementById('connect-wallet-btn');
const connectWalletRightButton = document.getElementById('connect-wallet-right-btn');
const walletMessage = document.getElementById('wallet-message');
const beastList = document.getElementById('beast-list');

// Event listeners for both Connect Wallet buttons
connectWalletButton.addEventListener('click', connectWallet);
connectWalletRightButton.addEventListener('click', connectWallet);

// Function to connect the wallet
async function connectWallet() {
    // Check if a Solana wallet is installed
    if (window.solana) {
        try {
            // Request connection to the Solana wallet
            const response = await window.solana.connect({ onlyIfTrusted: false });
            const publicKey = response.publicKey.toString();
            console.log('Wallet connected:', publicKey);
            walletConnection = publicKey;  // Store the wallet public key

            // Update UI to show beasts after successful connection
            walletMessage.style.display = 'none'; // Hide the "Please Connect" message
            beastList.style.display = 'flex';    // Show the beast list container

            // Update the top-right button with the wallet address
            connectWalletButton.textContent = publicKey;  
            connectWalletButton.removeEventListener('click', connectWallet);
            connectWalletButton.addEventListener('click', disconnectWallet);

            // Fetch NFTs from the connected wallet
            await fetchNFTsFromWallet(publicKey);

        } catch (err) {
            console.error('Error connecting to wallet:', err);
        }
    } else {
        alert('Solana wallet not found! Please install a Solana-compatible wallet like Phantom.');
    }
}

// Fetch NFTs from wallet (mock for now, replace with actual API calls later)
async function fetchNFTsFromWallet(publicKey) {
    // Here you'd make a call to the Solana blockchain or use an NFT API like Metaplex
    // For now, let's mock some NFTs for display
    const nfts = [
        { name: 'Beast 1', image: 'images/minted_beast1.png' },
        { name: 'Beast 2', image: 'images/minted_beast2.png' },
        { name: 'Beast 3', image: 'images/minted_beast3.png' },
        { name: 'Beast 4', image: 'images/minted_beast4.png' },
        { name: 'Beast 5', image: 'images/minted_beast5.png' }
    ];

    // Filter NFTs based on collection (you'd implement actual filtering here)
    const filteredNFTs = nfts.filter(nft => nft.name.includes('Beast'));

    // Clear any existing beasts
    beastList.innerHTML = '';

    // Load each beast into the beast list
    filteredNFTs.forEach((nft, index) => {
        const beastElement = document.createElement('img');
        beastElement.src = nft.image;
        beastElement.alt = nft.name;
        beastList.appendChild(beastElement);
    });
}

// Disconnect wallet functionality
function disconnectWallet() {
    walletConnection = null;
    connectWalletButton.textContent = 'Connect Wallet';  // Revert the button text
    connectWalletButton.removeEventListener('click', disconnectWallet);
    connectWalletButton.addEventListener('click', connectWallet);
    walletMessage.style.display = 'block'; // Show the "Please Connect" message
    beastList.style.display = 'none'; // Hide the beast list
}

// Mint button event listener
document.getElementById('mint-btn').addEventListener('click', () => {
    // Check if the wallet is connected
    if (!walletConnection) {
        alert("Please connect your wallet first.");
        return;
    }

    // Minting logic (mocked for now)
    mintBeast();
});

// Mint Beast function
function mintBeast() {
    // Add a new minted beast to the inventory list
    const newBeast = document.createElement('img');
    newBeast.src = 'images/minted_beast1.png';  // Placeholder beast image
    newBeast.alt = 'Minted Beast';
    beastList.appendChild(newBeast);

    alert('Beast minted successfully!');
}
