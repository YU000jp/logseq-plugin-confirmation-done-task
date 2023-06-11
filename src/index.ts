import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { AppGraphInfo, AppUserConfigs, BlockEntity, SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';
import { format } from 'date-fns';


/* main */
const main = () => {
  // (async () => {
  //   try {
  //     await l10nSetup({ builtinTranslations: { ja } });
  //   } finally {
  /* user settings */
  logseq.useSettingsSchema(settingsTemplate);
  // if (!logseq.settings) {
  //   setTimeout(() => {
  //     logseq.showSettingsUI();
  //   }
  //     , 300);
  // }
  //   }
  // })();


  //add completed property to done task
  //https://github.com/DimitryDushkin/logseq-plugin-task-check-date
  let blockSet = "";
  logseq.DB.onChanged(async ({ blocks }) => {
    //check current graph
    const graph = await logseq.App.getCurrentGraph() as AppGraphInfo | null;
    if (graph === null) return;//デモグラフの場合は返り値がnull
    const TASK_MARKERS = new Set(["DONE", "NOW", "LATER", "DOING", "TODO", "WAITING"]);
    const taskBlock = blocks.find(({ marker }) => TASK_MARKERS.has(marker));
    if (!taskBlock) return;
    if (blockSet !== taskBlock.uuid) {
      blockSet = "";//ほかのブロックを触ったら解除する
      if (taskBlock.marker === "DONE") {
        if (taskBlock.properties![logseq.settings?.customPropertyName || "completed"]) return;
        const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
        const today: Date = new Date();
        const year: number = today.getFullYear();
        const month: string = ("0" + ((today.getMonth() as number) + 1)).slice(-2);
        const day: string = ("0" + (today.getDate() as number)).slice(-2);
        const todayFormatted = `${year}-${month}-${day}`;
        let addTime = "";
        if (logseq.settings?.addTime === true) {
          addTime = `<input id="DONEpropertyTime" type="time" value="${("0" + (today.getHours() as number)).slice(-2)}:${("0" + (today.getMinutes() as number)).slice(-2)}"/>`;
        } else {
          addTime = '<input id="DONEpropertyTime" type="hidden" value=""/>';
        }


        const blockElement = parent.document.getElementsByClassName(taskBlock.uuid) as HTMLCollectionOf<HTMLElement>;
        if (!blockElement) return;
        //エレメントから位置を取得する
        const rect = blockElement[0].getBoundingClientRect();
        if (!rect) return;
        const top: string = Number(rect.top + window.pageYOffset - 110) + "px";
        const left: string = Number(rect.left + window.pageXOffset + 100) + "px";
        const key = "confirmation-done-task";
        logseq.provideUI({
          key,
          reset: true,
          template: `
                <h3>Add ${(logseq.settings?.customPropertyName || "completed")} property to the block</h3>
                <div id="addProperty">
                <input id="DONEpropertyDate" type="date" value="${todayFormatted}"/>${addTime}
                <button id="DONEpropertyButton" class="ls-button-primary">Add</button>
                </div>
                <style>
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
                div.light-theme span#dot-${taskBlock.uuid}{
                  outline: 2px solid var(--ls-link-ref-text-color);
                }
                div.dark-theme span#dot-${taskBlock.uuid}{
                  outline: 2px solid aliceblue;
                }
                </style>
              `,
          style: {
            width: "420px",
            height: "110px",
            position: "fixed",
            left,
            top,
            paddingLeft: "1.8em",
            backgroundColor: 'var(--ls-primary-background-color)',
            color: 'var(--ls-primary-text-color)',
            boxShadow: '1px 2px 5px var(--ls-secondary-background-color)',
          },
        });
        //selectで選択
        setTimeout(() => {

          let processing: Boolean = false;
          const button = parent.document.getElementById("DONEpropertyButton") as HTMLButtonElement;
          if (button) {
            button.addEventListener("click", async () => {
              if (processing) return;
              processing = true;
              const block = await logseq.Editor.getBlock(taskBlock.uuid) as BlockEntity | null;
              if (block) {
                const inputDate: string = (parent.document.getElementById("DONEpropertyDate") as HTMLInputElement).value;
                if (!inputDate) return;
                const FormattedDateUser = format(new Date(inputDate).setHours(0, 0, 0, 0), preferredDateFormat);
                let addTime;
                if (logseq.settings?.addTime === true) {
                  const inputTime: string = (parent.document.getElementById("DONEpropertyTime") as HTMLInputElement).value;
                  if (inputTime !== "") {
                    if (logseq.settings.timeEmphasis === true) {
                      addTime = " 🕒**" + inputTime + "**";
                    } else {
                      addTime = " 🕒" + inputTime;
                    }
                  }
                } else {
                  addTime = "";
                }
                logseq.Editor.upsertBlockProperty(taskBlock.uuid, logseq.settings?.customPropertyName || "completed", FormattedDateUser + addTime);
              }else{
                logseq.UI.showMsg("Error: Block not found","warning");
              }
              //実行されたらポップアップを削除
              const element = parent.document.getElementById(logseq.baseInfo.id + `--${key}`) as HTMLDivElement | null;
              if (element) element.remove();

              processing = false;
            });
          }
        }, 100);

      }
    } else {
      blockSet = taskBlock.uuid;
    }
  });
  //end


};/* end_main */


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
    key: "addTime",
    title: "Use the function to add a timestamp to the property",
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {
    key: "timeEmphasis",
    title: "Emphasis on time in property (like below **10:00**)",
    type: "boolean",
    default: true,
    description: "default: `true`",
  }
];


logseq.ready(main).catch(console.error);