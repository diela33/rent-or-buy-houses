import { Component } from '@angular/core';
import { Header } from './header/header';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [Header],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {}
