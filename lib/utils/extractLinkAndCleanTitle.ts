export function extractLinkAndCleanTitle(title: string) {
  const urlRegex = /https?:\/\/[^\s]+/g
  const match = title.match(urlRegex)

  return {
    link: match ? match[0] : null,
    cleanTitle: title.replace(urlRegex, "").replace(/:\s*$/, "").trim(),
  }
}
