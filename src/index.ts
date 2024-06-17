import "@logseq/libs" //https://plugins-doc.logseq.com/
import { BlockEntity, BlockUUID, LSPluginBaseInfo, } from "@logseq/libs/dist/LSPlugin.user"
import { setup as l10nSetup, t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { addPropertyToTheBlock, modeInsertBlock, modeUpdateBlock, overwriteToProperty, pushDONE } from "./block"
import { flagSameDay, removeDialog, renamePage, typeDateFromInputDate } from "./lib"
import { settingsTemplate } from "./settings"
import { provideStyleMain } from "./style"
import af from "./translations/af.json"
import de from "./translations/de.json"
import es from "./translations/es.json"
import fr from "./translations/fr.json"
import id from "./translations/id.json"
import it from "./translations/it.json"
import ja from "./translations/ja.json"
import ko from "./translations/ko.json"
import nbNO from "./translations/nb-NO.json"
import nl from "./translations/nl.json"
import pl from "./translations/pl.json"
import ptBR from "./translations/pt-BR.json"
import ptPT from "./translations/pt-PT.json"
import ru from "./translations/ru.json"
import sk from "./translations/sk.json"
import tr from "./translations/tr.json"
import uk from "./translations/uk.json"
import zhCN from "./translations/zh-CN.json"
import zhHant from "./translations/zh-Hant.json"
export const keySmallDONEproperty = "not-smallDONEproperty"
export const key = "DONEdialog"
let onBlockChangedToggle: boolean = false
let processing: boolean = false

let configPreferredDateFormat: string
export const getConfigPreferredDateFormat = (): string => configPreferredDateFormat


const getUserConfig = async () => {
  const { preferredDateFormat } = await logseq.App.getUserConfigs() as { preferredDateFormat: string }
  configPreferredDateFormat = preferredDateFormat
}


export interface TaskBlockEntity {
  // id: EntityID;
  uuid: BlockUUID
  // left: IEntityID;
  // format: 'markdown' | 'org';
  // parent: IEntityID;
  content: string
  // page: IEntityID;
  properties?: Record<string, any>
  // anchor?: string;
  // body?: any;
  // children?: Array<BlockEntity | BlockUUIDTuple>;
  // container?: string;
  // file?: IEntityID;
  // level?: number;
  // meta?: {
  //     timestamps: any;
  //     properties: any;
  //     startPos: number;
  //     endPos: number;
  // };
  // title?: Array<any>;
  marker?: string
  // [key: string]: unknown;
}

/* main */
const main = async () => {
  await l10nSetup({
    builtinTranslations: {//Full translations
      ja, af, de, es, fr, id, it, ko, "nb-NO": nbNO, nl, pl, "pt-BR": ptBR, "pt-PT": ptPT, ru, sk, tr, uk, "zh-CN": zhCN, "zh-Hant": zhHant
    }
  })

  await getUserConfig()

  /* user settings */
  logseq.useSettingsSchema(settingsTemplate())
  if (!logseq.settings) setTimeout(() => logseq.showSettingsUI(), 300)


  provideStyleMain()


  //ページ読み込み時
  logseq.App.onPageHeadActionsSlotted(() => startOnBlock())
  logseq.App.onRouteChanged(() => startOnBlock())

  //グラフ変更時
  logseq.App.onCurrentGraphChanged(() => startOnBlock())

  const startOnBlock = () => {
    removeDialog()
    if (onBlockChangedToggle === false) {
      onBlockChanged()
      onBlockChangedToggle = true
    }
  }


  onBlockChanged()
  onBlockChangedToggle = true
  //end

  //プロパティの中に、日付を連続で追加する
  logseq.Editor.registerBlockContextMenuItem(`💪 ${t("Add into DONE property")}`, async ({ uuid }) => {
    const block = await logseq.Editor.getBlock(uuid) as TaskBlockEntity | null
    if (!block) return
    // 条件
    if (block.marker === "DONE" // DONEタスク
      && block.properties // プロパティがある
      && block.properties[logseq.settings!.customPropertyName as string] // プロパティに指定のプロパティがある
    ) showDialog(block, true, `💪 ${t("Add into DONE property")}`)
    else
      logseq.UI.showMsg(t("This is not a DONE task with the \"completed\" property"), "warning")
  })

  //Set to DONE
  logseq.Editor.registerBlockContextMenuItem(`💪 ${t("Set to DONE")}`, async ({ uuid }) => {
    const block = (await logseq.Editor.getBlock(uuid)) as TaskBlockEntity | null
    if (!block) return
    if (block.marker === "DONE")
      showDialog(block, false, `💪 ${t("Set to DONE")}`)
    else {
      //DONEタスクではなかった場合、DONEにする
      pushDONE(block)
      logseq.UI.showMsg(t("Set to DONE"), "success", { timeout: 3000, })
    }
  })

  if (logseq.settings!.smallDONEproperty === false)
    parent.document.body.classList.add(keySmallDONEproperty)

  // プラグイン設定の項目変更時
  logseq.onSettingsChanged((newSet: LSPluginBaseInfo["settings"], oldSet: LSPluginBaseInfo["settings"]) => {
    //見た目の変更
    if (oldSet.smallDONEproperty === false
      && newSet.smallDONEproperty === true)
      parent.document.body.classList!.remove(keySmallDONEproperty)
    else
      if (oldSet.smallDONEproperty === true
        && newSet.smallDONEproperty === false)
        parent.document.body.classList!.add(keySmallDONEproperty)

    //プロパティの変更
    if (oldSet.customPropertyName !== newSet.customPropertyName)
      renamePage(oldSet.customPropertyName as string, newSet.customPropertyName as string)
  })

  logseq.provideModel({
    settingsButton: () => logseq.showSettingsUI(),
  })

} /* end_main */



//add completed property to done task
//https://github.com/DimitryDushkin/logseq-plugin-task-check-date
const onBlockChanged = () => logseq.DB.onChanged(async ({ blocks, txMeta }) => {
  if (logseq.settings!.onlyFromBulletList === true //ブロック操作でDONEではなくなった場合
    || processing === true //処理中の場合 
    || (txMeta
      && (txMeta["transact?"] === false //ユーザー操作ではない場合 (transactは取引の意味)
        || txMeta?.outlinerOp === "delete-blocks")) //ブロックが削除された場合
  ) return //処理しない

  processing = true

  //DONEタスクではないのに、completedプロパティ(それに相当する)をもつ場合は削除する
  if (logseq.settings!.removePropertyWithoutDONEtask === true) {
    const CompletedOff: TaskBlockEntity | undefined = blocks.find(({ marker, properties }) =>
      marker !== "DONE"// DONEタスクではない
      && properties
      && properties[logseq.settings!.customPropertyName as string || "completed"] // プロパティに指定のプロパティがあるか、completedプロパティがあるか
    ) as BlockEntity | undefined

    //見つかった場合は削除する
    if (CompletedOff) {
      //プロパティを削除する
      logseq.Editor.removeBlockProperty(CompletedOff.uuid, logseq.settings!.customPropertyName as string || "completed")
      //stringプロパティも削除する
      if (CompletedOff.properties!.string)
        logseq.Editor.removeBlockProperty(CompletedOff.uuid, "string")
    }
  }

  const taskBlock: TaskBlockEntity | undefined = blocks.find(({ marker }) => marker === "DONE") //DONEタスクを取得する
  //saveBlock以外は処理しない
  if (!taskBlock) {
    setTimeout(() => processing = false, 100)
    return
  }

  //チェックボタンからの場合は、現在のブロックと一致しない

  //ダイアログを表示
  showDialog(taskBlock, false)

  setTimeout(() => processing = false, 100)
})



const showDialogProcess = async (taskBlock: TaskBlockEntity, addTitle: string | undefined, additional: Boolean) => {

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
      button.onclick = async () => {
        if (processing) return
        processing = true
        const dialogElement = parent.document.getElementById(logseq.baseInfo.id + `--${key}`) as HTMLDivElement | null
        if (!dialogElement) return

        const block = (await logseq.Editor.getBlock(taskBlock.uuid)) as { page: BlockEntity["page"] } | null
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
              const emphasis: string = logseq.settings!.emphasisTime === "*"
                || logseq.settings!.emphasisTime === "**" ?
                logseq.settings!.emphasisTime
                : ""
              addTime = `${emphasis}${inputTime}${emphasis}`
            }
          } else
            addTime = ""

          const modeSelect = (
            parent.document.getElementById("DONEpropertyModeSelect") as HTMLSelectElement).value

          //日付と時間を結合 順序を変更する
          const dateAndTime = logseq.settings!.timeStampPosition === "before" ?
            addTime + " " + FormattedDateUser
            : FormattedDateUser + " " + addTime

          if (modeSelect === "UpdateBlock") //ブロックを更新する
            modeUpdateBlock(taskBlock, dateAndTime, inputDateString)
          else
            if (modeSelect === "insertBlock") //新しいブロックを挿入する
              modeInsertBlock(taskBlock, dateAndTime, inputDateString)
            else //プロパティを追加する
              if (additional === true)
                await overwriteToProperty(taskBlock, dateAndTime, inputDateString) //skipもしくはoverwrite
              else
                addPropertyToTheBlock(taskBlock, dateAndTime, inputDateString) //DONEのブロックに、プロパティを追加する
        } else
          logseq.UI.showMsg(t("Error: Block not found"), "warning")

        //実行されたらポップアップを削除
        removeDialog()

        setTimeout(() => processing === false, 1000)
      }
  }, 100)
}
let processingShowDialog: Boolean = false
const showDialog = async (taskBlock: TaskBlockEntity, additional: Boolean, addTitle?: string) => {
  if (additional === false
    && taskBlock.properties![logseq.settings!.customPropertyName as string || "completed"]) return //すでにプロパティがある場合は追加しない



  //ブロック操作でDONEではなくなった場合
  logseq.DB.onBlockChanged(taskBlock.uuid, async (block: TaskBlockEntity) => {
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


logseq.ready(main).catch(console.error)