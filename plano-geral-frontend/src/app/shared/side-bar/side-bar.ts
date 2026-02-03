import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faBarsProgress, faCalendarDays, faChartBar, faGear, faListCheck, faPeopleGroup, faStethoscope, faTableCellsLarge, faTableList } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-side-bar',
  imports: [FontAwesomeModule, RouterModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss'
})
export class SideBar {
  faStethoscope = faStethoscope;
  faTable = faTableList;
  faListCheck = faListCheck;
  faCalender = faCalendarDays
  faGear = faGear;
  faChart = faChartBar
  faBarProgess = faBarsProgress;
}
