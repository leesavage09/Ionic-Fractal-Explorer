import { Component, Input, ViewChild, ElementRef } from '@angular/core';

import { Fractals } from "../../fractal/fractal.module";

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: []
})
export class AlertComponent {
  @Input() titleStr: string = "title";
  @Input() textStr: string = "text";
  @Input() closeStr: string = "close";
  @Input() yesStr: string = "yes";
  @Input() noStr: string = "no";
  @Input() inputStr: string = "no";
  @ViewChild('close') closeElm: ElementRef;
  @ViewChild('yes') yesElm: ElementRef;
  @ViewChild('no') noElm: ElementRef;
  @ViewChild('inputCopy') inputCopyElm: ElementRef;

  private callback: Function;
  //private juliaFractal: Fractals.Fractal = null;

  private readonly CLOSE = 'close'
  private readonly YES = 'yes'
  private readonly NO = 'no'
  public yesHREF: string

  constructor() {
  }

  closeClick() {
    this.callback(this.CLOSE)
  }

  yesClick() {
    this.callback(this.YES)
  }

  noClick() {
    this.callback(this.NO)
  }

  copyClick() {
    var textArea,
      copy;

    textArea = document.createElement('textArea');
    textArea.value = this.inputStr;
    textArea.style.fontSize = "xx-large";
    document.body.appendChild(textArea);

    var range,
      selection;

    if (navigator.userAgent.match(/ipad|iphone/i)) {
      range = document.createRange();
      range.selectNodeContents(textArea);
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      textArea.setSelectionRange(0, 999999);
    } else {
      textArea.select();
    }

    document.execCommand('copy');
    document.body.removeChild(textArea);



    //document.execCommand('copy');
    this.callback(this.CLOSE);
  }

  copy(event) {
    // console.log("copy event")
    // event.preventDefault();
    // if (event.clipboardData) {
    //   event.clipboardData.setData("text/plain", this.inputStr);
    // }
  }

  enableOptions(close: boolean, yes: boolean, no: boolean, input: boolean) {
    if (close) this.closeElm.nativeElement.style.display = 'inline-block'
    else this.closeElm.nativeElement.style.display = 'none'

    if (yes) this.yesElm.nativeElement.style.display = 'inline-block'
    else this.yesElm.nativeElement.style.display = 'none'

    if (no) this.noElm.nativeElement.style.display = 'inline-block'
    else this.noElm.nativeElement.style.display = 'none'

    if (input) {
      this.inputCopyElm.nativeElement.style.display = 'block'
    }
    else {
      this.inputCopyElm.nativeElement.style.display = 'none'
    }
  }

  setCallback(f: Function) {
    this.callback = f;
  }

  setYesHref(s: string) {
    this.yesHREF = s;
  }

}
