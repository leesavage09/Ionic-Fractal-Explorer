import { Component, Input, OnInit, ViewChild, ElementRef } from "@angular/core";

import { SocialSharing } from '@ionic-native/social-sharing';

import { ExplorerComponent } from "../../angularComponents/explorer/explorer.component";
import { Fractals } from "../../fractal/fractal.module";
import { FractalEquations } from "../../fractal/fractalEquations.module"
import { CompiledStylesheet } from "@angular/compiler";
import { error } from "util";
import { ComplexNumber } from "../../fractal/complexNumbers";
import { FractalColor } from "../../fractal/fractalColouring";

@Component({
  selector: "ExplorerIonicComponent",
  templateUrl: "../../angularComponents/explorer/explorer.component.html",
})
export class ExplorerIonicComponent extends ExplorerComponent {

  constructor(private socialSharing: SocialSharing) {
    super();
  }

  ngOnInit() {
    console.log("ExplorerIonicComponent ngOnInit")
    this.maximized = "true"
    this.HTMLfullScreenControls.nativeElement.style.display = "none";
    this.HTMLzoomControls.nativeElement.style.display = "none";
    super.ngOnInit();
  }

  share(event) {
    var host = location.protocol + "//" + window.location.hostname + ":" + location.port + "/?"

    let theme = this.theme
    let equation = this.fractal.getCalculationFunction().getName();
    let color = this.fractal.getColor().encodeJSON()
    let iterations = this.fractal.iterations.toString()
    let complexCenter = this.fractal.complexPlain.getSquare().center.toString();
    let complexWidth = this.fractal.complexPlain.getSquare().width.toString();
    let complexJuliaPicker = new ComplexNumber(0, 0).toString();

    let fun = this.fractal.getCalculationFunction();
    if (fun instanceof FractalEquations.Julia) {
      let julia = <FractalEquations.Julia>fun;
      complexJuliaPicker = new ComplexNumber(julia.juliaReal, julia.juliaImaginary).toString()
    }

    let content = host + "theme=" + theme + "&equation=" + equation + "&color=" + color + "&iterations=" + iterations + "&complexCenter=" + complexCenter + "&complexWidth=" + complexWidth + "&complexJuliaPicker=" + complexJuliaPicker;
    content = encodeURI(content);

    this.socialSharing.share("message", "subject", null, content)

  }
}
