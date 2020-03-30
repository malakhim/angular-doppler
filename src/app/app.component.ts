import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

const BASE_CONSTANT = 1.02;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit{
  velocity = 0;


  /*
    This defines what colours we're filtering the initial star-small.png image by.

    We get the feColorMatrix 
    (https://www.w3.org/TR/filter-effects/#feColorMatrixElement) 
    primitive, consisting of colour channels as rows:

    R, 0, 0, 0
    0, G, 0, 0
    0, 0, B, 0
    0, 0, 0, A

    We'll call this matrix C. 
    By default, this is an identity matrix i.e. all RGBA values are 1.

    We then add a "multiplier" column vector M    

    0,
    0,
    0,
    0

    to the matrix C such that we get a 5x4 filter matrix F = M+C. 
    This is part of the spec, but we won't be using this.

    F is the "colour shift" matrix that we manipulate to show the
    Doppler hue shift.

    We'll call F dopplerHue, and it will be bound using one-way binding
    to the svg feColorMatrix element.

    We then get the RGBA vector of the image, let's call it M.
    By doing a dot product of F with M, we end up with a 1x4 vector
    and this final output represents the resulting RGBA hue values of the image
    after F has been applied to the hues of M. 
    
    This is what feColorMatrix does.
    
    We'll also break out each row of C into its own separate row,
    for manipulation of a particular hue directly.

    */

    dopplerHue = '';

    readonly feColorIdentityMatrix: FeColorMatrix =  {
      R: [1, 0, 0, 0, 0],
      G: [0, 1, 0, 0, 0],
      B: [0, 0, 1, 0, 0],
      A: [0, 0, 0, 1, 0],
    };

    ngOnInit(){
      this.dopplerHue = this.transformFeColorMatrixToString(this.feColorIdentityMatrix);
    }

    updateDopplerHue(velocity:number){
        this.velocity = velocity;

        const channelsCopy:FeColorMatrix = JSON.parse(JSON.stringify(this.feColorIdentityMatrix));

        if(velocity >= 0){
          channelsCopy.G[1] = 1 - velocity/100;
          channelsCopy.B[2] = 1 - velocity/100;
        } else if(velocity < 0){
          channelsCopy.R[0] = 1 + velocity/100;
          channelsCopy.G[1] = 1 + velocity/100;
        }

        this.dopplerHue = this.transformFeColorMatrixToString(channelsCopy);
    }

    transformFeColorMatrixToString(colourChannels: FeColorMatrix){
      return [
        colourChannels.R.join(' '), 
        colourChannels.G.join(' '),
        colourChannels.B.join(' '),
        colourChannels.A.join(' '),
      ].join('\n');
    }

    getSliderStepSize(sliderValue: number){
      return +Math.pow(BASE_CONSTANT, sliderValue).toFixed(2);
    }

    formatLabel(e) {
      return `${e} km/s`;
    }
}

interface FeColorMatrix {
  R: number[],
  G: number[],
  B: number[],
  A: number[]
}
