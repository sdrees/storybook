import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    //
    BrowserModule,
    BrowserAnimationsModule,
  ],
})
export class WithAnimationsModule {}

@NgModule({
  imports: [CommonModule, HttpClientModule],
})
export class WithOfficialModule {}
