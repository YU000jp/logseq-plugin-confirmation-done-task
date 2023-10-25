import { key, keySmallDONEproperty } from "."

export const provideStyleMain = () => logseq.provideStyle(`
body {
  &>div {
    &#root>div>main>div div.block-properties>div {
      &:has(div>a[data-ref="string"].block-property),
      &:has(a[data-ref="string"].block-property) {
        display: none;
      }
    }
    &#${logseq.baseInfo.id}--${key} {
      & p{
        margin: 0;
      }

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
          font-size: 1.8em;
          margin-right: .5em;
          &:hover {
            background: var(--ls-secondary-background-color);
            color: var(--ls-secondary-text-color);
          }
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
}
`)
