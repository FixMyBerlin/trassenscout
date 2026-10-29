export const formatEmailAddresses = (addresses: string) => addresses.replace(/"([^",]*)"/g, "$1")
