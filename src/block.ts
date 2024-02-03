import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { hiddenProperty } from "./lib"

export const overwriteToProperty = async (taskBlock: BlockEntity, dateAndTime: string, inputDateString: string) => {
  let propertyValue = (await logseq.Editor.getBlockProperty(taskBlock.uuid, logseq.settings!.customPropertyName as string)) as string
  if (typeof propertyValue === "string")
    propertyValue += " , "
  else
    propertyValue = ""

  logseq.Editor.upsertBlockProperty(taskBlock.uuid, logseq.settings!.customPropertyName as string, propertyValue + dateAndTime)
  hiddenProperty(inputDateString, taskBlock)
  logseq.UI.showMsg(`💪 ${t("Updated block property")}`, "success")
}

export const addPropertyToTheBlock = (taskBlock: BlockEntity, dateAndTime: string, inputDateString: string) => {
  logseq.Editor.upsertBlockProperty(taskBlock.uuid, logseq.settings!.customPropertyName as string, dateAndTime)
  //隠しプロパティにも追加
  hiddenProperty(inputDateString, taskBlock)
  logseq.UI.showMsg(`💪 ${t("Inserted block property")}`, "success")
}

export const modeInsertBlock = (taskBlock: BlockEntity, dateAndTime: string, inputDateString: string) => {
  logseq.Editor.insertBlock(taskBlock.uuid, `${dateAndTime}`, { focus: false })
  if (logseq.settings!.insertBlockCollapsed === true)
    logseq.Editor.setBlockCollapsed(taskBlock.uuid, true)
  hiddenProperty(inputDateString, taskBlock)
  logseq.UI.showMsg(`💪 ${t("Inserted new block")}`, "success")
}

export const modeUpdateBlock = (taskBlock: BlockEntity, dateAndTime: string, inputDateString: string) => {
  if (logseq.settings!.updateBlockContentPosition === "before")
    // "before"の場合
    //DONEの後ろに、日付や時刻を挿入する
    taskBlock.content = taskBlock.content.replace(/^(#+\s)?DONE\s/, `DONE ${dateAndTime} ${logseq.settings!.updateBlockSeparator} `)
  else // "after"の場合
    if (taskBlock.content.includes("\n"))
      //1行目の内容の後ろ(一つ目の\nの前)に、日付や時刻を挿入する
      taskBlock.content = taskBlock.content.replace(/\n/, `- ${dateAndTime}\n`)
    else
      //1行目の内容の最後に、日付や時刻を挿入する
      taskBlock.content += ` ${logseq.settings!.updateBlockSeparator} ${dateAndTime}`

  logseq.Editor.updateBlock(taskBlock.uuid, taskBlock.content)
  hiddenProperty(inputDateString, taskBlock)
  logseq.UI.showMsg(`💪 ${t("Updated block")}`, "success")
}
