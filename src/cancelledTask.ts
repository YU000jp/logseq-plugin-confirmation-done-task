import { TaskBlockEntity, getConfigPreferredDateFormat } from "."
import { addPropertyToTheBlock } from "./block"
import { formatDateForLink } from "./lib"

export const cancelledTask = async (taskBlock: TaskBlockEntity) => {
  const today = new Date()

  let FormattedDateUser: string = logseq.settings!.addDate === true ?
    await formatDateForLink(today, getConfigPreferredDateFormat()) : ""

  let addTime: string = ""
  if (logseq.settings!.cancelledTaskTime === true) {
    const inputTime: string = today.getHours() + ":" + today.getMinutes()
    if (inputTime !== "") {
      //時刻を囲み文字で強調する
      const emphasis: string = logseq.settings!.emphasisTime === "*"
        || logseq.settings!.emphasisTime === "**" ?
        logseq.settings!.emphasisTime
        : ""
      addTime = `${emphasis}${inputTime}${emphasis}`
    }
  }
  else
    addTime = ""

  addPropertyToTheBlock(
    taskBlock,
    //日付と時間を結合 順序を変更する
    logseq.settings!.timeStampPosition === "before" || logseq.settings!.timeStampPosition === "front" ?
      addTime + " " + FormattedDateUser
      : FormattedDateUser + " " + addTime,
    //CANCELLEDのブロックに、プロパティを追加する
    today,
    logseq.settings!.cancelledTaskPropertyName as string || "cancelled")
}
