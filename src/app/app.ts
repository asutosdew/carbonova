import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { MobileNavComponent } from './components/mobile-nav/mobile-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, MobileNavComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'CARBONOVA';
}

