import { Component } from "@angular/core";

import { SocialSharing } from '@ionic-native/social-sharing';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';

import { ExplorerComponent } from "../../angularComponents/explorer/explorer.component";
import { Fractals } from "../../fractal/fractal.module";
import { FractalEquations } from "../../fractal/fractalEquations.module";
import { ComplexNumber } from "../../fractal/complexNumbers";

@Component({
  selector: "ExplorerIonicComponent",
  templateUrl: "../../angularComponents/explorer/explorer.component.html",
})
export class ExplorerIonicComponent extends ExplorerComponent {

  constructor(private socialSharing: SocialSharing, private photoLibrary: PhotoLibrary, private androidFullScreen: AndroidFullScreen) {
    super();
    this.socialSharing = socialSharing;
    this.photoLibrary = photoLibrary;
    console.log("this.photoLibrary",this.photoLibrary);

    androidFullScreen.isImmersiveModeSupported()
      .then(() => androidFullScreen.immersiveMode())
      .catch((error: any) => console.log(error));

  }

  ngOnInit() {
    console.log("ExplorerIonicComponent ngOnInit")
    this.maximized = "true"
    this.HTMLfullScreenControls.nativeElement.style.display = "none";
    this.HTMLzoomControls.nativeElement.style.display = "none";
    super.ngOnInit();
  }

  share(event) {
    var host = "http://www.leesavage.co.uk/?";


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

    this.socialSharing.share("", "", null, content)

  }


  protected platformSave(width: number, height: number) {
    var element = {
      base: <Fractals.ChangeObserver>{
        explorer: this,
        changed(fractal: Fractals.Fractal) {
          fractal.unsubscribe(element.base)
          this.explorer.imageToDownload = fractal.complexPlain.getViewCanvas().toDataURL("image/png");
          console.log("this.photoLibrary",this.explorer.photoLibrary);  
          this.explorer.photoLibrary.requestAuthorization().then(() => {
            var album = 'Fractal Explorer';            
            this.explorer.photoLibrary.saveImage(this.explorer.imageToDownload, album, function (libraryItem) { }, function (err) { });

            this.explorer.HTMLalertComponent.titleStr = "All Done"
            this.explorer.HTMLalertComponent.textStr = "Image Saved."
            this.explorer.HTMLalertComponent.closeStr = "Close"
            this.explorer.HTMLalertComponent.enableOptions(true, false, false, false)
            this.explorer.HTMLalertComponent.setCallback(this.explorer.closeAlert.bind(this.explorer))
            this.explorer.HTMLalert.nativeElement.style.visibility = "visible";

            this.explorer.HTMLsaveIcon.nativeElement.style.display = "block"
            this.explorer.HTMLsaveSelect.nativeElement.setAttribute("class", "select");
          }).catch(err => {
            console.log('permissions weren\'t granted '+err)
            this.explorer.HTMLsaveIcon.nativeElement.style.display = "block"
            this.explorer.HTMLsaveSelect.nativeElement.setAttribute("class", "select");
          });

          this.explorer.HTMLsaveIconText.nativeElement.innerHTML = "Saving"

        }
      }
    }
    this.mainFractalView.downloadImage(width, height, element.base);

    this.updateSaveProgress();
  }
}
