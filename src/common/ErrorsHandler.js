export const handleCreateOfferError = event => {
    console.log(`createOffer() error: ${event}.`);
}

export const onCreateSessionDescriptionError = error => {
    throw new Error(`Failed to create session description:  ${error}.`);
}

export const onCreatePeerConnectionError = error => {
    throw new Error(`Failed to create PeerConnection, exception: ${error.message}`)
}