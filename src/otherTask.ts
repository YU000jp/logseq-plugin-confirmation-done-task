import exp from "constants"
import { TaskBlockEntity, getConfigPreferredDateFormat } from "."
import { addPropertyToTheBlock } from "./block"
import { formatDateForLink } from "./lib"
import { format } from "date-fns"

export const cancelledTask = async (taskBlock: TaskBlockEntity) =>
  otherTask(taskBlock, logseq.settings!.cancelledTaskTime as boolean, logseq.settings!.cancelledTaskPropertyName as string || "cancelled")

export const waitingTask = async (taskBlock: TaskBlockEntity) =>
  otherTask(taskBlock, logseq.settings!.waitingTaskTime as boolean, logseq.settings!.waitingTaskPropertyName as string || "waiting")

export const doingTask = async (taskBlock: TaskBlockEntity) =>
  otherTask(taskBlock, logseq.settings!.doingTaskTime as boolean, logseq.settings!.doingTaskPropertyName as string || "during")

export const todoTask = async (taskBlock: TaskBlockEntity) =>
  otherTask(taskBlock, logseq.settings!.todoTaskTime as boolean, logseq.settings!.todoTaskPropertyName as string || "created")

export const doneTask = async (taskBlock: TaskBlockEntity) =>
  otherTask(taskBlock, logseq.settings!.addTime as boolean, logseq.settings!.customPropertyName as string || "completed")

export const otherTask = async (taskBlock: TaskBlockEntity, taskTime: boolean, propertyName: string) => {
  const today = new Date()

  let FormattedDateUser: string = logseq.settings!.addDate === true ?
    await formatDateForLink(today, getConfigPreferredDateFormat()) : ""

  let addTime: string = ""
  if (taskTime === true) {
    const inputTime: string = format(today, "HH:mm")
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
    propertyName
  )
}
