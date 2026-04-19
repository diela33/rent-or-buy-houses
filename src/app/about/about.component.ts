import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  imports: [CommonModule, RouterModule]
})
export class AboutComponent {
  features = [
    {
      icon: '🏠',
      title: 'Browse Listings',
      description: 'Explore thousands of properties for rent or sale in your area'
    },
    {
      icon: '🧮',
      title: 'Smart Calculator',
      description: 'Compare renting vs buying with our advanced financial calculator'
    },
    {
      icon: '✍️',
      title: 'List Properties',
      description: 'Property owners can easily create and manage listings'
    },
    {
      icon: '🔐',
      title: 'Secure Platform',
      description: 'Your personal information and listings are protected'
    }
  ];

  team = [
    {
      name: 'Development Team',
      role: 'Full Stack Developers',
      expertise: 'Angular, Node.js, MongoDB'
    }
  ];
}
