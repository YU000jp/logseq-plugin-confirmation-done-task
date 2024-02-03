import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n

import { removeDialog } from "./lib"
import { typeDateFromInputDate } from "./lib"
import { flagSameDay } from "./lib"
import { modeUpdateBlock, modeInsertBlock, overwriteToProperty, addPropertyToTheBlock } from "./block"
import { key, getConfigPreferredDateFormat } from "."

export const setButtonAction = (button: HTMLButtonElement, processing: Boolean, taskBlock: BlockEntity, additional: Boolean) => {
  button.onclick = async () => {
    if (processing) return
    processing = true
    const dialogElement = parent.document.getElementById(logseq.baseInfo.id + `--${key}`) as HTMLDivElement | null
    if (!dialogElement) return

    const block = (await logseq.Editor.getBlock(taskBlock.uuid)) as BlockEntity | null
    if (block) {
      let inputDateString: string = ""
      let FormattedDateUser: string = ""
      if (logseq.settings!.addDate === true) {
        inputDateString = (parent.document.getElementById("DONEpropertyDate") as HTMLInputElement)!.value
        if (!inputDateString) return

        //inputDateをDate型に変換
        FormattedDateUser = await typeDateFromInputDate(
          logseq.settings!.onlyFromBulletList === true // onlyFromBulletListが有効
            || logseq.settings!.omitDateIfSameAsJournal === false // 設定がオンではない
            ? false
            : await flagSameDay(block, inputDateString) as boolean //同じ日付かどうかチェック(日付マッチ)
          ,

          inputDateString,
          getConfigPreferredDateFormat())
      }

      let addTime: string = ""
      if (logseq.settings!.addTime === true) {
        const inputTime: string = (parent.document.getElementById("DONEpropertyTime") as HTMLInputElement).value
        if (inputTime !== "") {
          //時刻を囲み文字で強調する
          const emphasis: string = logseq.settings!.emphasisTime === "*" || logseq.settings!.emphasisTime === "**" ? logseq.settings!.emphasisTime : ""
          addTime = `${emphasis}${inputTime}${emphasis}`
        }
      }

      else
        addTime = ""

      const modeSelect = (
        parent.document.getElementById("DONEpropertyModeSelect") as HTMLSelectElement).value

      //日付と時間を結合 順序を変更する
      const dateAndTime = logseq.settings!.timeStampPosition === "before" ?
        addTime + " " + FormattedDateUser
        : FormattedDateUser + " " + addTime

      if (modeSelect === "UpdateBlock")
        //ブロックを更新する
        modeUpdateBlock(taskBlock, dateAndTime, inputDateString)

      else
        if (modeSelect === "insertBlock")
          //新しいブロックを挿入する
          modeInsertBlock(taskBlock, dateAndTime, inputDateString)
        else {
          //プロパティを追加する
          if (additional === true) //skipもしくはoverwrite
            await overwriteToProperty(taskBlock, dateAndTime, inputDateString)
          else //DONEのブロックに、プロパティを追加する
            addPropertyToTheBlock(taskBlock, dateAndTime, inputDateString)
        }

    }

    else
      logseq.UI.showMsg(t("Error: Block not found"), "warning")

    //実行されたらポップアップを削除
    removeDialog()

    setTimeout(() => processing === false, 1000)
  }
  return processing
}

export const showDialogProcess = async (taskBlock: BlockEntity, addTitle: string | undefined, additional: Boolean) => {

  const today: Date = new Date()
  const year: number = today.getFullYear()
  const month: string = ("0" + ((today.getMonth() as number) + 1)).slice(-2)
  const day: string = ("0" + (today.getDate() as number)).slice(-2)
  const printAddTime = logseq.settings!.addTime === true
    ? `<label><input id="DONEpropertyTime" type="time" value="${("0" + (today.getHours() as number)).slice(-2)}:${("0" + (today.getMinutes() as number)).slice(-2)}" title="${t("Time picker")}\n\n${t("Click on the mark on the right to select")}" style="width:110px"/></label>`
    : '<input id="DONEpropertyTime" type="hidden" value=""/>'
  const printAddDate = logseq.settings!.addDate === true
    ? `<label><input id="DONEpropertyDate" type="date" value="${`${year}-${month}-${day}`}" title="${t("Date picker")}\n\n${t("Actually, the date format set in Logseq is applied.")}\n\n${t("Click on the mark on the right to select")}" style="width:160px"/></label>`
    : '<input id="DONEpropertyDate" type="hidden" value=""/>'
  const blockElement = parent.document.getElementsByClassName(taskBlock.uuid)[0] as HTMLElement
  let top = ""
  let left = ""
  let right = ""
  //エレメントから位置を取得する
  const rect = blockElement ? (blockElement.getBoundingClientRect() as DOMRect | undefined) : null

  if (blockElement
    && rect) {
    const offsetTop = Number(rect.top - 130)
    top = offsetTop > 0 ? Number(offsetTop) + "px" : Number(rect.top + 40) + "px"
    left = String(Number(rect.left - 10)) + "px"
    const offsetRight = Number(rect.right - 350)
    right = offsetRight > 0 ? String(rect.right) + "px" : "1em"
    right = ""
  } else {
    top = "2em"
    right = "1em"
  }

  logseq.provideUI({
    attrs: {
      title: addTitle
        ? addTitle
        : `"${logseq.settings!.customPropertyName || "completed"}" ${t("property")}`,
    },
    key,
    replace: true,
    template: `
          <div id="addProperty" title="">
            <div>
              ${printAddDate}${printAddTime}
              <button id="DONEpropertyButton" class="ls-button-primary" title="${t("Record the date or time")}">☑️</button>
            </div>
            <div>
              <small>${t("Mode")}</small><select id="DONEpropertyModeSelect">
              <option value="blockProperty"${logseq.settings!.modeSelect === "Block property"
        ? " selected"
        : ""}>${t(additional === true ? "Add into property" : "Block property")}</option>
          ${additional === true ? "" : `
              <option value="insertBlock"${logseq.settings!.modeSelect === "Insert block" ? " selected" : ""}>${t("Insert new block")}</option>
              <option value="UpdateBlock"${logseq.settings!.modeSelect === "Update block" ? " selected" : ""} title='${t("Mode > \"Update block\" > Before or after the content of the first line, insert the date and time")}'>${t("Update block")}</option>
          `}
              </select>
              <small><button data-on-click="settingsButton" class="ls-button-primary" title="${t("Plugin Settings")}">⚙️</button></small>
            </div>
          </div>
          <style>
            body>div#root>div {
              &.light-theme>main>div span#dot-${taskBlock.uuid}{
                outline: 2px solid var(--ls-link-ref-text-color);
              }
              &.dark-theme>main>div span#dot-${taskBlock.uuid}{
                outline: 2px solid aliceblue;
              }
            }
          </style>
        `,
    style: {
      width: "unset",
      maxWidth: "420px",
      height: "unset",
      maxHeight: "130px",
      right: right !== "" ? right : "unset",
      bottom: "unset",
      left: left !== "" ? left : "unset",
      top,
      paddingLeft: "1.2em",
      backgroundColor: "var(--ls-primary-background-color)",
      color: "var(--ls-primary-text-color)",
      boxShadow: "1px 2px 5px var(--ls-secondary-background-color)",
    },
  })
  //selectで選択
  setTimeout(() => {
    let processing: Boolean = false
    const element = parent.document.getElementById(logseq.baseInfo.id + `--${key}`) as HTMLDivElement
    if (additional === false && element) {
      element.onclick = () => {
        const dialogElement = parent.document.getElementById(logseq.baseInfo.id + `--${key}`) as HTMLDivElement | null
        if (!dialogElement) return
        //const element = dialogElement.querySelector("div.th h3") as HTMLHeadElement | null;
        //if (element) element.innerText = "";
      }
    }
    const button = parent.document.getElementById("DONEpropertyButton") as HTMLButtonElement
    if (button)
      processing = setButtonAction(button, processing, taskBlock, additional)
  }, 100)
}

let processingShowDialog: Boolean = false
export const showDialog = async (taskBlock: BlockEntity, additional: Boolean, addTitle?: string) => {
  if (additional === false
    && taskBlock.properties![logseq.settings!.customPropertyName as string || "completed"]) return //すでにプロパティがある場合は追加しない


  //ブロック操作でDONEではなくなった場合
  logseq.DB.onBlockChanged(taskBlock.uuid, async (block: BlockEntity) => {
    //DONEを入力してからブロックでキャンセルした場合にダイアログを消す
    if (block.marker !== "DONE") removeDialog()
  })

  if (processingShowDialog === true
    || parent.document.getElementById(`${logseq.baseInfo.id}--${key}`) as HTMLDivElement) return //すでにダイアログがある場合は追加しない
  processingShowDialog = true
  //ダイアログを表示
  await showDialogProcess(taskBlock, addTitle, additional) //ロック解除
  processingShowDialog = false

} //end showDialog

