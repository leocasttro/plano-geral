import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faBarsProgress, faCalendarDays, faChartBar, faGear, faListCheck, faPeopleGroup, faStethoscope, faTableCellsLarge, faTableList } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../domain/auth/auth.service';

@Component({
  selector: 'app-side-bar',
  imports: [CommonModule, FontAwesomeModule, RouterModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss'
})
export class SideBar {
  constructor(private authService: AuthService) {}

  faStethoscope = faStethoscope;
  faTable = faTableList;
  faListCheck = faListCheck;
  faCalender = faCalendarDays
  faGear = faGear;
  faChart = faChartBar
  faBarProgess = faBarsProgress;

  get isAdmin(): boolean {
    return this.authService.usuario()?.perfil === 'ADMIN';
  }
}
