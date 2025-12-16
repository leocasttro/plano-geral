import { Component } from '@angular/core';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faBarsProgress, faCalendarDays, faChartBar, faGear, faPeopleGroup, faStethoscope, faTableCellsLarge, faTableList } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-side-bar',
  imports: [FontAwesomeModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss'
})
export class SideBar {
  faStethoscope = faStethoscope;
  faTable = faTableList;
  faPeople = faPeopleGroup;
  faCalender = faCalendarDays
  faGear = faGear;
  faChart = faChartBar
  faBarProgess = faBarsProgress;
}
