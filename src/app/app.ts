import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { LoadingOverlay } from './components/loading-overlay/loading-overlay';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingOverlay, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
