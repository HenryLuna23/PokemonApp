import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-team-selection',
  standalone: true,
  templateUrl: './team-selection.html',
  styleUrl: './team-selection.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamSelection {}
