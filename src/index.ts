import "@logseq/libs"; //https://plugins-doc.logseq.com/
import {
  AppUserConfigs,
  BlockEntity,
  LSPluginBaseInfo,
} from "@logseq/libs/dist/LSPlugin.user";
import { format, parse } from "date-fns";
import { setup as l10nSetup } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
import ja from "./translations/ja.json";
import { checkDemoGraph, removeDialog } from "./lib";
import { settingsTemplate } from "./settings";
const keySmallDONEproperty = "not-smallDONEproperty";
export const key = "DONEdialog";
const contextmenuItemName = "💪Add to DONE property";
let blockSet = "";
let demoGraph: boolean = false;
let onBlockChangedToggle: boolean = false;

/* main */
const main = async () => {
  await l10nSetup({ builtinTranslations: { ja } });

  /* user settings */
  logseq.useSettingsSchema(settingsTemplate());
  if (!logseq.settings) setTimeout(() => logseq.showSettingsUI(), 300);
  //   }
  // })();
  provideStyleMain();

  //ページ読み込み時
  logseq.App.onPageHeadActionsSlotted(async () => {
    demoGraph = (await checkDemoGraph()) as boolean;
    if (demoGraph === true && onBlockChangedToggle === false) {
      onBlockChanged();
      onBlockChangedToggle = true;
    }
  });

  //グラフ変更時
  logseq.App.onCurrentGraphChanged(async () => {
    demoGraph = (await checkDemoGraph()) as boolean;
    if (demoGraph === true && onBlockChangedToggle === false) {
      onBlockChanged();
      onBlockChangedToggle = true;
    }
  });

  if (demoGraph === false) {
    onBlockChanged();
    onBlockChangedToggle = true;
  }
  //end

  //Additional to DONE property
  logseq.Editor.registerBlockContextMenuItem(
    contextmenuItemName,
    async ({ uuid }) => {
      const block = (await logseq.Editor.getBlock(uuid)) as BlockEntity;
      if (block.marker === "DONE") showDialog(block, true, contextmenuItemName);
      else
        logseq.UI.showMsg("This block is not DONE", "warning", {
          timeout: 3000,
        });
    }
  );

  if (logseq.settings?.smallDONEproperty === false)
    parent.document.body.classList.add(keySmallDONEproperty);

  logseq.onSettingsChanged(
    (
      newSet: LSPluginBaseInfo["settings"],
      oldSet: LSPluginBaseInfo["settings"]
    ) => {
      if (
        oldSet.smallDONEproperty === false &&
        newSet.smallDONEproperty === true
      )
        parent.document.body.classList!.remove(keySmallDONEproperty);
      else if (
        oldSet.smallDONEproperty === true &&
        newSet.smallDONEproperty === false
      )
        parent.document.body.classList!.add(keySmallDONEproperty);
    }
  );
}; /* end_main */


const provideStyleMain = () => logseq.provideStyle(`
body {
  &>div#${logseq.baseInfo.id}--${key} {
    & div.th h3 {
      max-width: 80%;
      text-overflow: ellipsis;
    }
    
    & div#addProperty {
    & :is(input, select) {
      background: var(--ls-primary-background-color);
      color: var(--ls-primary-text-color);
      box-shadow: 1px 2px 5px var(--ls-secondary-background-color);
      border-radius: 0.5em;
    }
    
    & select {
      font-size: 0.95em;
    }
    
    & button#DONEpropertyButton {
      font-size: 1.85em;
      padding: 0.1em 0.25em;  
      &:hover {
        background: var(--ls-secondary-background-color);
        color: var(--ls-secondary-text-color);
      }
    }
    }
  }
  &:not(.${keySmallDONEproperty})>div#root>div>main>div div.block-properties:has(a[data-ref="${logseq.settings!.customPropertyName || "completed"}"]){
    display: flex;
    justify-content: flex-end;
    background: unset;
    &>div {
      font-size: 0.8em;
      display: inline-block;
      border-radius: 2em;
      background: var(--ls-secondary-background-color);
      padding: 0.1em 0.5em;
    }
  }
  &>div#root>div>main>div div.block-properties>div:has(a[data-ref="string"]){
    display: none;
  }
}
`);

let processingShowDialog: Boolean = false;
async function showDialog(
  taskBlock: BlockEntity,
  additional: Boolean,
  addTitle?: string
) {
  if (
    additional === false &&
    taskBlock.properties![logseq.settings?.customPropertyName || "completed"]
  )
    return; //すでにプロパティがある場合は追加しない
  blockSet = taskBlock.uuid;

  //ブロック操作でDONEではなくなった場合
  logseq.DB.onBlockChanged(taskBlock.uuid, async (block: BlockEntity) => {
    //DONEを入力してからブロックでキャンセルした場合にダイアログを消す
    if (block.marker !== "DONE") removeDialog();
    blockSet = taskBlock.uuid;
    setTimeout(() => (blockSet = ""), 1000); //ロック解除
  });

  if (
    parent.document.getElementById(
      `${logseq.baseInfo.id}--${key}`
    ) as HTMLDivElement
  )
    return; //すでにダイアログがある場合は追加しない
  if (processingShowDialog === true) return;
  processingShowDialog = true;
  //ダイアログを表示
  await showDialogProcess(taskBlock, addTitle, additional); //ロック解除
  processingShowDialog = false;
} //end showDialog

async function showDialogProcess(
  taskBlock: BlockEntity,
  addTitle: string | undefined,
  additional: Boolean
) {
  const { preferredDateFormat } =
    (await logseq.App.getUserConfigs()) as AppUserConfigs;
  const today: Date = new Date();
  const year: number = today.getFullYear();
  const month: string = ("0" + ((today.getMonth() as number) + 1)).slice(-2);
  const day: string = ("0" + (today.getDate() as number)).slice(-2);
  const printAddTime =
    logseq.settings?.addTime === true
      ? `<input id="DONEpropertyTime" title="Time picker" type="time" value="${(
        "0" + (today.getHours() as number)
      ).slice(-2)}:${("0" + (today.getMinutes() as number)).slice(-2)}"/>`
      : '<input id="DONEpropertyTime" type="hidden" value=""/>';
  const printAddDate =
    logseq.settings?.addDate === true
      ? `<input id="DONEpropertyDate" title="Date picker" type="date" value="${`${year}-${month}-${day}`}"/>`
      : '<input id="DONEpropertyDate" type="hidden" value=""/>';
  const blockElement = parent.document.getElementsByClassName(
    taskBlock.uuid
  )[0] as HTMLElement;
  let top = "";
  let left = "";
  let right = "";
  //エレメントから位置を取得する
  const rect = blockElement
    ? (blockElement.getBoundingClientRect() as DOMRect | undefined)
    : null;

  if (blockElement && rect) {
    const offsetTop = Number(rect.top - 130);
    top =
      offsetTop > 0 ? Number(offsetTop) + "px" : Number(rect.top + 40) + "px";

    left = String(Number(rect.left - 10)) + "px";
    const offsetRight = Number(rect.right - 350);
    right = offsetRight > 0 ? String(rect.right) + "px" : "1em";
    right = "";
  } else {
    top = "2em";
    right = "1em";
  }

  logseq.provideUI({
    attrs: {
      title: addTitle
        ? addTitle
        : `Add "${logseq.settings?.customPropertyName || "completed"
        }" property`,
      //(additional === false && logseq.settings!.timeoutMode === true) ? `Timeout ${logseq.settings!.timeout}ms` : "",
    },
    key,
    replace: true,
    template: `
          <div id="addProperty" title="">
          ${printAddDate}${printAddTime}
          <button id="DONEpropertyButton" class="ls-button-primary"${addTitle ? ` title="${addTitle}"` : ""
      }>☑️</button></br>
          Mode: <select id="DONEpropertyModeSelect">
          <option value="blockProperty"${logseq.settings!.modeSelect === "As block property"
        ? " selected"
        : ""
      }>As block property</option>
          <option value="insertBlock"${logseq.settings?.modeSelect === "Insert block" ? " selected" : ""
      }>Insert new block</option>
          <option value="UpdateBlock"${logseq.settings?.modeSelect === "Update block" ? " selected" : ""
      }>Update block</option>
          </select>
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
      width: "360px",
      height: "125px",
      right: right !== "" ? right : "unset",
      bottom: "unset",
      left: left !== "" ? left : "unset",
      top,
      paddingLeft: "1.2em",
      backgroundColor: "var(--ls-primary-background-color)",
      color: "var(--ls-primary-text-color)",
      boxShadow: "1px 2px 5px var(--ls-secondary-background-color)",
    },
  });
  //selectで選択
  setTimeout(() => {
    let processing: Boolean = false;
    let focusElement: Boolean = false;
    let closeElement: Boolean = false;
    const element = parent.document.getElementById(
      logseq.baseInfo.id + `--${key}`
    ) as HTMLDivElement;
    if (additional === false && element) {
      element.onclick = () => {
        focusElement = true;
        const dialogElement = parent.document.getElementById(
          logseq.baseInfo.id + `--${key}`
        ) as HTMLDivElement | null;
        if (!dialogElement) return;
        //const element = dialogElement.querySelector("div.th h3") as HTMLHeadElement | null;
        //if (element) element.innerText = "";
        if (additional === false && logseq.settings!.timeoutMode === true)
          dialogElement.style.borderColor = "unset";
      };
      //クリックしたら、タイムアウトモードを解除する
      element.onclose = () => {
        blockSet = taskBlock.uuid;
        closeElement = true;
      };
    }
    const button = parent.document.getElementById(
      "DONEpropertyButton"
    ) as HTMLButtonElement;
    if (button) {
      if (additional === false && logseq.settings!.timeoutMode === true) {
        setTimeout(() => {
          if (closeElement === true) return;
          if (focusElement === false) button?.click();
        }, logseq.settings!.timeout as number);
        //タイムアウト直前
        setTimeout(() => {
          const dialogElement = parent.document.getElementById(
            logseq.baseInfo.id + `--${key}`
          ) as HTMLDivElement | null;
          if (!dialogElement) return;
          // const element = dialogElement.querySelector("div.th h3") as HTMLHeadElement | null;
          //if (element) element.style.color = "red";
          dialogElement.style.borderColor = "red";
        }, (logseq.settings!.timeout as number) - 2000);
      }

      button.onclick = async () => {
        if (processing) return;
        processing = true;
        const dialogElement = parent.document.getElementById(
          logseq.baseInfo.id + `--${key}`
        ) as HTMLDivElement | null;
        if (!dialogElement) return;

        const block = (await logseq.Editor.getBlock(
          taskBlock.uuid
        )) as BlockEntity | null;
        if (block) {
          let inputDate: string = "";
          let FormattedDateUser: string = "";
          if (logseq.settings?.addDate === true) {
            inputDate = (parent.document.getElementById(
              "DONEpropertyDate"
            ) as HTMLInputElement)!.value;
            if (!inputDate) return;
            //inputDateをDate型に変換
            FormattedDateUser =
              logseq.settings!.createDateLink === true
                ? "[[" +
                format(
                  parse(inputDate, 'yyyy-MM-dd', new Date()),
                  preferredDateFormat
                ) +
                "]]"
                : format(
                  parse(inputDate, 'yyyy-MM-dd', new Date()),
                  preferredDateFormat
                );
          }
          let addTime;
          if (logseq.settings?.addTime === true) {
            const inputTime: string = (
              parent.document.getElementById(
                "DONEpropertyTime"
              ) as HTMLInputElement
            ).value;
            if (inputTime !== "") {
              const emphasis: string = logseq.settings.emphasisTime === "*" || logseq.settings.emphasisTime === "**" ? logseq.settings.emphasisTime : "";
              addTime = ` ${emphasis}${inputTime}${emphasis}`;
            }
          } else {
            addTime = "";
          }

          const modeSelect = (
            parent.document.getElementById(
              "DONEpropertyModeSelect"
            ) as HTMLSelectElement
          ).value;

          if (modeSelect === "UpdateBlock") {
            //同じブロックの「DONE 」を置換する
            taskBlock.content = taskBlock.content.replace(
              /DONE\s/,
              `DONE ${FormattedDateUser + addTime} - `
            );
            logseq.Editor.updateBlock(taskBlock.uuid, taskBlock.content);
            logseq.UI.showMsg("Updated block", "success");
          } else if (
            modeSelect === "insertBlock"
          ) {
            logseq.Editor.insertBlock(
              taskBlock.uuid,
              `${FormattedDateUser + addTime}`,
              { focus: false }
            );
            if (logseq.settings!.insertBlockCollapsed === true)
              logseq.Editor.setBlockCollapsed(taskBlock.uuid, true);
            logseq.UI.showMsg("Inserted new block", "success");
          } else {
            if (additional === true) { //skipもしくはoverwrite
              let propertyValue = (await logseq.Editor.getBlockProperty(
                taskBlock.uuid,
                logseq.settings?.customPropertyName
              )) as string;
              if (typeof propertyValue === "string") {
                propertyValue += " , ";
              } else {
                propertyValue = "";
              }
              logseq.Editor.upsertBlockProperty(
                taskBlock.uuid,
                logseq.settings?.customPropertyName,
                propertyValue + FormattedDateUser + addTime
              );
              hiddenProperty(inputDate, taskBlock);
              logseq.UI.showMsg("Updated block property", "success");
            } else {
              //DONEのブロックに、プロパティを追加する
              logseq.Editor.upsertBlockProperty(
                taskBlock.uuid,
                logseq.settings?.customPropertyName,
                FormattedDateUser + addTime
              );
              //隠しプロパティにも追加
              hiddenProperty(inputDate, taskBlock);
              logseq.UI.showMsg("Insert block property", "success");
            }
          }
          blockSet = taskBlock.uuid;
          setTimeout(() => (blockSet = ""), 1000); //ロック解除
        } else {
          logseq.UI.showMsg("Error: Block not found", "warning");
        }
        //実行されたらポップアップを削除
        removeDialog();

        processing = false;
      };
    }
  }, 100);
  setTimeout(() => (blockSet = ""), 1000);
}


const hiddenProperty = (inputDate: string, taskBlock: BlockEntity) => {
  //20230929のような形式で保存する
  const hiddenProperty = parse(inputDate, 'yyyy-MM-dd', new Date());

  logseq.Editor.upsertBlockProperty(
    taskBlock.uuid,
    "string",
    format(hiddenProperty, 'yyyyMMdd')
  );
  logseq.Editor.restoreEditingCursor();
  setTimeout(async () => {
    logseq.Editor.editBlock(taskBlock.uuid);
    if (taskBlock.properties?.string) logseq.Editor.removeBlockProperty(taskBlock.uuid, "string"); //2重にならないように削除
    setTimeout(() => logseq.Editor.insertAtEditingCursor(`\nstring:: ${format(hiddenProperty, 'yyyyMMdd')}`), 100);
  }, 500);
}

//add completed property to done task
//https://github.com/DimitryDushkin/logseq-plugin-task-check-date
function onBlockChanged() {
  logseq.DB.onChanged(async ({ blocks, txMeta }) => {
    if (demoGraph === true) return;
    if (logseq.settings!.removePropertyWithoutDONEtask === true) {
      const CompletedOff = blocks.find(({ marker, properties }) => marker !== "DONE" && properties && properties[logseq.settings?.customPropertyName || "completed"]);
      if (CompletedOff) {
        logseq.Editor.removeBlockProperty(CompletedOff.uuid, logseq.settings?.customPropertyName || "completed");
        if (CompletedOff.properties?.string) logseq.Editor.removeBlockProperty(CompletedOff.uuid, "string"); //2重にならないように削除
      }
    }
    const taskBlock = blocks.find(
      ({ marker, uuid }) => marker === "DONE" && blockSet !== uuid
    );
    if (!taskBlock || txMeta?.outlinerOp !== "saveBlock") return;
    showDialog(taskBlock as BlockEntity, false);
  });
}

logseq.ready(main).catch(console.error);
