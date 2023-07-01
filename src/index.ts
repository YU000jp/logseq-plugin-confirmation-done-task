import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { AppGraphInfo, AppUserConfigs, BlockEntity, LSPluginBaseInfo, SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';
import { format } from 'date-fns';
const keySmallDONEproperty = "not-smallDONEproperty";
const key = "DONEdialog";
const TASK_MARKERS = new Set(["DONE"]);
const contextmenuItemName = "💪Add to DONE property";

/* main */
const main = () => {
  // (async () => {
  //   try {
  //     await l10nSetup({ builtinTranslations: { ja } });
  //   } finally {
  /* user settings */
  logseq.useSettingsSchema(settingsTemplate);
  if (!logseq.settings) setTimeout(() => logseq.showSettingsUI(), 300);
  //   }
  // })();
  logseq.provideStyle(`
div#addProperty button#DONEpropertyButton {
  font-size: 1.7em;
}
div#addProperty input {
  background: var(--ls-primary-background-color);
  color: var(--ls-primary-text-color);
  boxShadow: 1px 2px 5px var(--ls-secondary-background-color);
}
div#addProperty button {
  border: 1px solid var(--ls-secondary-background-color);
  boxShadow: 1px 2px 5px var(--ls-secondary-background-color);
}
div#addProperty button:hover {
  background: var(--ls-secondary-background-color);
  color: var(--ls-secondary-text-color);
}
body:not(.${keySmallDONEproperty}) main div.block-properties:has(a[data-ref="${logseq.settings!.customPropertyName || "completed"}"]){
  display: flex;
  justify-content: flex-end;
  background: unset;
}
body:not(.${keySmallDONEproperty}) main div.block-properties:has(a[data-ref="${logseq.settings!.customPropertyName || "completed"}"])>div {
  font-size: 0.8em;
  display: inline-block;
  border-radius: 2em;
  background: var(--ls-secondary-background-color);
  padding: 0.1em 0.5em;
}
body:not(.${keySmallDONEproperty}) main div.block-properties:has(a[data-ref="${logseq.settings!.customPropertyName || "completed"}"])>div:hover {
  font-size: unset;
  background: var(--ls-secondary-background-color);
}
`);

  //add completed property to done task
  //https://github.com/DimitryDushkin/logseq-plugin-task-check-date
  let blockSet = "";
  logseq.DB.onChanged(async ({ blocks }) => {
    //check current graph
    const graph = await logseq.App.getCurrentGraph() as AppGraphInfo | null;
    if (graph === null) return;//デモグラフの場合は返り値がnull
    const taskBlock = blocks.find(({ marker }) => TASK_MARKERS.has(marker));
    if (!taskBlock) return;
    if (blockSet !== taskBlock.uuid) {
      blockSet = "";//ほかのブロックを触ったら解除する
      if (taskBlock.marker === "DONE") showDialog(taskBlock as BlockEntity, false);
    }
  });
  //end

  //Additional to DONE property
  logseq.Editor.registerBlockContextMenuItem(contextmenuItemName, async ({ uuid }) => {
    const block = await logseq.Editor.getBlock(uuid) as BlockEntity;
    if (block.marker === "DONE") {
      showDialog(block, true, contextmenuItemName);
    } else {
      logseq.UI.showMsg("This block is not DONE", "warning", { timeout: 3000 });
    }

  });


  async function showDialog(taskBlock: BlockEntity, additional: Boolean, addTitle?: string) {
    if (additional === false && taskBlock.properties![logseq.settings?.customPropertyName || "completed"]) return; //すでにプロパティがある場合は追加しない
    logseq.DB.onBlockChanged(taskBlock.uuid, async (block: BlockEntity) => {
      //DONEを入力してからブロックでキャンセルした場合にダイアログを消す
      if (block.marker !== "DONE") removeDialog();
    });
    const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
    const today: Date = new Date();
    const year: number = today.getFullYear();
    const month: string = ("0" + ((today.getMonth() as number) + 1)).slice(-2);
    const day: string = ("0" + (today.getDate() as number)).slice(-2);
    const printAddTime = (logseq.settings?.addTime === true) ?
      `<input id="DONEpropertyTime" title="Time picker" type="time" value="${("0" + (today.getHours() as number)).slice(-2)}:${("0" + (today.getMinutes() as number)).slice(-2)}"/>`
      : '<input id="DONEpropertyTime" type="hidden" value=""/>';
    const printAddDate = (logseq.settings?.addDate === true) ?
      `<input id="DONEpropertyDate" title="Date picker" type="date" value="${`${year}-${month}-${day}`}"/>`
      : '<input id="DONEpropertyDate" type="hidden" value=""/>';
    const blockElement = parent.document.getElementsByClassName(taskBlock.uuid) as HTMLCollectionOf<HTMLElement>;
    let top = "";
    let left = "";
    let right = "";
    //エレメントから位置を取得する
    const rect = (blockElement[0]) ? blockElement[0]!.getBoundingClientRect() as DOMRect | undefined : null;

    if (blockElement && rect) {
      const offsetTop = Number(rect.top - 120);
      top = (offsetTop > 0) ?
        Number(offsetTop) + "px"
        : Number(rect.top + 40) + "px";

      left = String(Number(rect.left - 10)) + "px";
      const offsetRight = Number(rect.right - 350);
      right = (offsetRight > 0) ?
        String(rect.right) + "px"
        : "1em";
      right = "";
    } else {
      top = "2em";
      right = "1em";
    }

    logseq.provideUI({
      attrs: {
        title: (additional === false && logseq.settings!.timeoutMode === true) ? `Timeout ${logseq.settings!.timeout}ms` : "",
      },
      key,
      reset: true,
      template: `
          <h3>${(addTitle) ? addTitle : `Add "${(logseq.settings?.customPropertyName || "completed")}" property to the block`}</h3>
          <div id="addProperty">
          ${printAddDate}${printAddTime}
          <button id="DONEpropertyButton" class="ls-button-primary"${(addTitle) ? ` title="${addTitle}"` : ""}>☑️</button>
          </div>
          <style>
          div.light-theme span#dot-${taskBlock.uuid}{
            outline: 2px solid var(--ls-link-ref-text-color);
          }
          div.dark-theme span#dot-${taskBlock.uuid}{
            outline: 2px solid aliceblue;
          }
          </style>
        `,
      style: {
        width: "340px",
        height: "110px",
        right: (right !== "") ? right : "unset",
        bottom: "unset",
        left: (left !== "") ? left : "unset",
        top,
        paddingLeft: "1.2em",
        backgroundColor: 'var(--ls-primary-background-color)',
        color: 'var(--ls-primary-text-color)',
        boxShadow: '1px 2px 5px var(--ls-secondary-background-color)',
      },
    });
    //selectで選択
    setTimeout(() => {

      let processing: Boolean = false;
      let focusElement: Boolean = false;
      let closeElement: Boolean = false;
      const element = parent.document.getElementById(logseq.baseInfo.id + `--${key}`) as HTMLDivElement;
      if (additional === false && element) {
        element.onclick = () => {
          focusElement = true;
          const dialogElement = parent.document.getElementById(logseq.baseInfo.id + `--${key}`) as HTMLDivElement | null;
          if (!dialogElement) return;
          const element = dialogElement.querySelector("div.th h3") as HTMLHeadElement | null;
          if (element) element.innerText = "";
        }
        //クリックしたら、タイムアウトモードを解除する
        element.onclose = () => {
          blockSet = taskBlock.uuid;
          closeElement = true;
        };
      }
      const button = parent.document.getElementById("DONEpropertyButton") as HTMLButtonElement;
      if (button) {

        if (additional === false && logseq.settings!.timeoutMode === true) {
          setTimeout(() => {
            if (closeElement === true) return;
            if (focusElement === false) button?.click();
          }, logseq.settings!.timeout as number);
          //タイムアウト直前
          setTimeout(() => {
            const dialogElement = parent.document.getElementById(logseq.baseInfo.id + `--${key}`) as HTMLDivElement | null;
            if (!dialogElement) return;
            const element = dialogElement.querySelector("div.th h3") as HTMLHeadElement | null;
            if (element) element.style.color = "red";
          }, (logseq.settings!.timeout as number) - 2000);
        }

        button.onclick = async () => {
          if (processing) return;
          processing = true;
          const dialogElement = parent.document.getElementById(logseq.baseInfo.id + `--${key}`) as HTMLDivElement | null;
          if (!dialogElement) return;

          const block = await logseq.Editor.getBlock(taskBlock.uuid) as BlockEntity | null;
          if (block) {
            let inputDate: string = "";
            let FormattedDateUser: string = "";
            if (logseq.settings?.addDate === true) {
              inputDate = (parent.document.getElementById("DONEpropertyDate") as HTMLInputElement)!.value;
              if (!inputDate) return;
              FormattedDateUser = (logseq.settings!.createDateLink === true) ?
                "[[" + format(new Date(inputDate).setHours(0, 0, 0, 0), preferredDateFormat) + "]]"
                : format(new Date(inputDate).setHours(0, 0, 0, 0), preferredDateFormat);
            }
            let addTime;
            if (logseq.settings?.addTime === true) {
              const inputTime: string = (parent.document.getElementById("DONEpropertyTime") as HTMLInputElement).value;
              if (inputTime !== "") {
                let emphasis: string;
                if (logseq.settings.emphasisTime === "*") {
                  emphasis = "*";
                } else if (logseq.settings.emphasisTime === "**") {
                  emphasis = "**";
                } else {
                  emphasis = "";
                }
                addTime = ` ${emphasis}${inputTime}${emphasis}`;
              }
            } else {
              addTime = "";
            }
            if (additional === true) {
              let propertyValue = await logseq.Editor.getBlockProperty(taskBlock.uuid, logseq.settings?.customPropertyName) as string;
              if (typeof propertyValue === "string") {
                propertyValue += " , ";
              } else {
                propertyValue = "";
              }
              logseq.Editor.upsertBlockProperty(taskBlock.uuid, logseq.settings?.customPropertyName || "completed", propertyValue + FormattedDateUser + addTime);
            } else {
              //skipもしくはoverwrite
              logseq.Editor.upsertBlockProperty(taskBlock.uuid, logseq.settings?.customPropertyName || "completed", FormattedDateUser + addTime);
            }
          } else {
            logseq.UI.showMsg("Error: Block not found", "warning");
          }
          //実行されたらポップアップを削除
          removeDialog();

          processing = false;
        };

      }
    }, 100);
  }//end showDialog


  if (logseq.settings?.smallDONEproperty === false) parent.document.body.classList.add(keySmallDONEproperty);

  logseq.onSettingsChanged((newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
    if (oldSet.smallDONEproperty === false && newSet.smallDONEproperty === true) {
      parent.document.body.classList!.remove(keySmallDONEproperty);
    } else
      if (oldSet.smallDONEproperty === true && newSet.smallDONEproperty === false) {
        parent.document.body.classList!.add(keySmallDONEproperty);
      }
  });

};/* end_main */




function removeDialog() {
  const element = parent.document.getElementById(logseq.baseInfo.id + `--${key}`) as HTMLDivElement | null;
  if (element) element.remove();
}


/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
const settingsTemplate: SettingSchemaDesc[] = [
  {
    key: "customPropertyName",
    title: "Custom property name",
    type: "string",
    default: "completed",
    description: "default: `completed`",
  },
  {
    key: "addDate",
    title: "Use the function to add the date to the property",
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {
    key: "createDateLink",
    title: "Create the date link",
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {
    key: "addTime",
    title: "Use the function to add a timestamp to the property",
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {
    key: "emphasisTime",
    title: "Emphasis on time in property (like below *10:00* or **10:00**)",
    type: "enum",
    default: "*",
    enumChoices: ["*", "**", "none"],
    description: "default: `*`",
  },
  {
    //DONEプロパティの表示サイズを小さくして右側に配置する Logseq v0.9.11以降
    key: "smallDONEproperty",
    title: "Small DONE property and right align",
    type: "boolean",
    default: true,
    description: "default: `true` (⚠️Logseq v0.9.11 or later)",
  },
  {
    //timeoutモード
    key: "timeoutMode",
    title: "Timeout mode",
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {
    //timeoutモードの時間
    key: "timeout",
    title: "Timeout (ms) when timeout mode is enabled",
    type: "enum",
    enumChoices: ["3000", "5000", "7000", "9000"],
    default: "5000",
    description: "default: `5000`",
  },
];


logseq.ready(main).catch(console.error);