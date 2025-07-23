import { Component } from '@angular/core';
import { ApiService } from '../../service/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-editroom',
  imports: [CommonModule, FormsModule],
  templateUrl: './editroom.component.html',
  styleUrl: './editroom.component.css'
})
export class EditroomComponent {


  roomDetails = {
    roomNumber: '',
    type: '',
    price: '',
    capacity: '',
    description: '',
    imageUrl: '',
    isActive: true,
  };

  id: string = '';
  roomTypes: string[] = []; // Store room types
  file: File | null = null;
  preview: string | null = null;
  error: string = '';
  success: string = '';

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.fetchRoomDetails();
  }


  showError(msg: string) {
    this.error = msg;
    setTimeout(() => {
      this.error = "";
    }, 4000);
  }

  // Fetch room details and room types
  fetchRoomDetails() {
    this.apiService.getRoomById(this.id).subscribe({
      next: (roomResponse: any) => {
        this.roomDetails = {
          roomNumber: roomResponse.room.roomNumber,
          type: roomResponse.room.type,
          price: roomResponse.room.price,
          capacity: roomResponse.room.capacity,
          description: roomResponse.room.description,
          imageUrl: roomResponse.room.imageUrl,
          isActive: roomResponse.room.isActive !== undefined ? roomResponse.room.isActive : true,
        };
      },
      error: (error) => {
        this.showError(error?.error?.message || 'Error fetching room details');
      }
  });

    this.apiService.getRoomTypes().subscribe({
      next:(types: string[]) => {
        this.roomTypes = types;
      },
      error:(error) => {
        this.showError(error?.error?.message || 'Error fetching room types');
      }
  });
  }

  // Handle form input changes
  handleChange(event: Event): void {
    const { name, value } = <HTMLInputElement>event.target;
    this.roomDetails = { ...this.roomDetails, [name]: value };
  }

  // Handle file input change (image upload)
  handleFileChange(event: Event): void {
    const input = <HTMLInputElement>event.target;
    const selectedFile = input.files ? input.files[0] : null;
    if (selectedFile) {
      this.file = selectedFile;
      this.preview = URL.createObjectURL(selectedFile);
    } else {
      this.file = null;
      this.preview = null;
    }
  }

  // Update room details
  handleUpdate(): void {
    const formData = new FormData();
    formData.append('type', this.roomDetails.type);
    formData.append('price', this.roomDetails.price);
    formData.append('description', this.roomDetails.description);
    formData.append('capacity', this.roomDetails.capacity);
    formData.append('id', this.id);

    if (this.file) {
      formData.append('imageFile', this.file);
    }

    this.apiService.updateRoom(formData).subscribe({
      next:(response) => {
        this.success = 'Room updated successfully.';
        setTimeout(() => {
          this.router.navigate(['/admin/manage-rooms']);
        }, 3000);
      },
      error:(error) => {
        this.showError(error?.error?.message || 'Error updating room');
      }
  });
  }

  // Toggle room active status
  handleToggleActive(): void {
    const action = this.roomDetails.isActive ? 'deactivate' : 'reactivate';
    const confirmMessage = this.roomDetails.isActive 
      ? 'Do you want to deactivate this room?' 
      : 'Do you want to reactivate this room?';
    
    if (window.confirm(confirmMessage)) {
      const apiCall = this.roomDetails.isActive 
        ? this.apiService.deactivateRoom(this.id)
        : this.apiService.reactivateRoom(this.id);
      
      apiCall.subscribe({
        next: (response: any) => {
          this.roomDetails.isActive = !this.roomDetails.isActive;
          this.success = `Room ${action}d successfully.`;
          setTimeout(() => {
            this.router.navigate(['/admin/manage-rooms']);
          }, 3000);
        },
        error: (error: any) => {
          this.showError(error?.error?.message || `Error ${action}ing room`);
        }
      });
    }
  }

  // Method to get full image URL
  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return 'assets/images/no-image.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:7070${imageUrl}`;
  }
  
}
