import { Component } from '@angular/core';
import { ApiService } from '../service/api.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-editprofile',
  imports: [CommonModule, FormsModule],
  templateUrl: './editprofile.component.html',
  styleUrl: './editprofile.component.css'
})
export class EditprofileComponent {


  user: any = null;
  error: any = null;
  successMessage: any = null;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  // Fetch user profile on component initialization
  fetchUserProfile(): void {
    this.apiService.myProfile().subscribe({
      next: (response: any) => {
        this.user = response.user;
        console.log(this.user); // Optional, for debugging
      },
      error: (err) => {
        this.showError(err?.error?.message || 'Error fetching user profile');
      },
    });
  }

  showError(message: string) {
    this.error = message;
    setTimeout(() => {
      this.error = null;
    }, 4000);
  }

  showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
    }, 4000);
  }

  // Handle profile update
  handleUpdateProfile(): void {
    if (!this.user.firstName || !this.user.lastName) {
      this.showError('First Name and Last Name are required');
      return;
    }

    const updateData = {
      firstName: this.user.firstName,
      lastName: this.user.lastName
    };

    this.apiService.updateProfile(updateData).subscribe({
      next: (response: any) => {
        this.showSuccess('Profile updated successfully!');
        // Update user object with response data if needed
        if (response.user) {
          this.user = response.user;
        }
      },
      error: (err: any) => {
        this.showError(err?.error?.message || 'Error updating profile');
      },
    });
  }

  // Navigate back to profile page
  goBackToProfile(): void {
    this.router.navigate(['/profile']);
  }

}
