type Input = {
  shareUrl: string
  projectName: string
  senderName: string | null
}

export const externalShareMailtoHref = ({ shareUrl, projectName, senderName }: Input) => {
  const subject = `Ihr Zugang zu den Projektunterlagen von ${projectName}`
  const body = [
    `Über den folgenden Link erhalten Sie Zugriff auf die Anwendung „Trassenscout“ für den Radschnellweg „${projectName}“.`,
    "",
    shareUrl,
    "",
    "Die dort bereitgestellten Informationen und Daten sind ausschließlich für den internen Gebrauch und nur im Zusammenhang mit diesem Vorhaben bestimmt. Der Link sowie die darüber zugänglichen Inhalte und Dokumente dürfen nicht ohne unsere schriftliche Freigabe an Dritte weitergegeben werden.",
    "",
    "Mit freundlichen Grüßen",
    ...(senderName ? [senderName] : []),
  ].join("\r\n")

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
