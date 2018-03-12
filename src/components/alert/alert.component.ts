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
  @Input() downloadStr: string = "close";
  @Input() yesStr: string = "yes";
  @Input() noStr: string = "no";
  @ViewChild('download') downloadElm: ElementRef;
  @ViewChild('yes') yesElm: ElementRef;
  @ViewChild('no') noElm: ElementRef;

  private callback: Function;
  private readonly YES = 'yes'
  private readonly NO = 'no'
  public yesHREF: string

  constructor() {
  }

  yesClick() {
    this.callback(this.YES)
  }

  noClick() {
    this.callback(this.NO)
  }

  enableOptions(download: boolean, yes: boolean, no: boolean) {
    if (download) this.downloadElm.nativeElement.style.display = 'inline-block'
    else this.downloadElm.nativeElement.style.display = 'none'

    if (yes) this.yesElm.nativeElement.style.display = 'inline-block'
    else this.yesElm.nativeElement.style.display = 'none'

    if (no) this.noElm.nativeElement.style.display = 'inline-block'
    else this.noElm.nativeElement.style.display = 'none'
  }

  setCallback(f: Function) {
    this.callback = f;
  }

  setYesHref(s: string) {
    this.yesHREF = s;
  }

}