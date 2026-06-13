import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MedicineService } from '../../services/medicine.service';
import { Medicine } from '../../models/medicine.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-medications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen p-4 md:p-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-400">
            My Medications
          </h1>
          <p class="text-gray-600 font-semibold mt-2">Manage your medicine schedule and tracking</p>
        </div>
        <button routerLink="/add-medicine" class="btn btn-lg bg-gradient-to-r from-amber-400 to-indigo-400 text-white border-0 hover:opacity-90 font-bold shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-5 w-5 inline-block mr-2">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Medicine
        </button>
      </div>

      <!-- Loading State -->
      @if (isLoading) {
        <div class="flex justify-center items-center h-64">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading && medicines.length === 0) {
        <div class="card bg-white shadow-xl rounded-2xl p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-24 w-24 mx-auto text-gray-300 mb-4">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 class="text-xl font-bold text-gray-800 mb-2">No Medications Yet</h3>
          <p class="text-gray-600 mb-6">Start by adding your first medication to track</p>
          <button routerLink="/add-medicine" class="btn btn-primary">
            Add Your First Medicine
          </button>
        </div>
      }

      <!-- Medicines List -->
      @if (!isLoading && medicines.length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (medicine of medicines; track medicine.id) {
            <div class="card bg-white shadow-xl hover:shadow-2xl transition-shadow rounded-2xl overflow-hidden border border-gray-100">
              <!-- Card Header -->
              <div class="bg-gradient-to-r from-emerald-50 to-indigo-50 p-6">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-4">
                    <div class="avatar placeholder">
                      <div class="bg-gradient-to-r from-amber-400 to-indigo-400 text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl">
                        {{ medicine.name.charAt(0) }}
                      </div>
                    </div>
                    <div>
                      <h3 class="font-bold text-lg text-gray-800">{{ medicine.name }}</h3>
                      <p class="text-sm text-gray-600">{{ medicine.dosage || 'As prescribed' }}</p>
                    </div>
                  </div>
                  <div class="dropdown dropdown-end">
                    <button tabindex="0" class="btn btn-ghost btn-sm btn-circle">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-white rounded-box w-52">
                      <li><a (click)="editMedicine(medicine.id)">Edit</a></li>
                      <li><a (click)="toggleReminder(medicine.id)" class="justify-between">
                        Reminder
                        @if (medicine.reminderActive) {
                          <span class="badge badge-success badge-sm">ON</span>
                        } @else {
                          <span class="badge badge-ghost badge-sm">OFF</span>
                        }
                      </a></li>
                      <li><a (click)="deleteMedicine(medicine.id)" class="text-error">Delete</a></li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Card Body -->
              <div class="p-6 space-y-4">
                <!-- Frequency -->
                <div class="flex items-center justify-between">
                  <span class="text-gray-600 text-sm">Frequency</span>
                  <span class="badge badge-primary font-bold">{{ formatFrequency(medicine.frequency) }}</span>
                </div>

                <!-- Duration -->
                <div class="flex items-center justify-between">
                  <span class="text-gray-600 text-sm">Duration</span>
                  <span class="font-semibold text-gray-800">{{ medicine.durationDays }} days</span>
                </div>

                <!-- Pills -->
                <div class="flex items-center justify-between">
                  <span class="text-gray-600 text-sm">Pills</span>
                  <span class="font-semibold text-gray-800">{{ medicine.pillsPerDose }} per dose</span>
                </div>

                <!-- Progress -->
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Progress</span>
                    <span class="font-semibold" [class.text-emerald-600]="getProgress(medicine) > 50" [class.text-amber-600]="getProgress(medicine) <= 50 && getProgress(medicine) > 20" [class.text-red-600]="getProgress(medicine) <= 20">
                      {{ getProgress(medicine) }}%
                    </span>
                  </div>
                  <progress class="progress progress-primary w-full" value="{{ getProgress(medicine) }}" max="100"></progress>
                  <p class="text-xs text-gray-500">{{ medicine.totalPills }} pills remaining</p>
                </div>
              </div>

              <!-- Card Footer -->
              <div class="card-actions bg-gray-50 px-6 py-4 justify-between">
                <button (click)="viewHistory(medicine.id)" class="btn btn-sm btn-ghost">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-4 w-4 mr-1">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  History
                </button>
                <button (click)="markTaken(medicine.id)" class="btn btn-sm btn-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-4 w-4 mr-1">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Mark Taken
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class MedicationsComponent implements OnInit {
  medicines: Medicine[] = [];
  isLoading = false;
  userEmail = '';

  constructor(
    private router: Router,
    private medicineService: MedicineService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.userEmail = user.email;
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.isLoading = true;
    this.medicineService.getMedicinesByUserEmail(this.userEmail).subscribe({
      next: (medicines) => {
        this.medicines = medicines;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading medicines:', err);
        this.isLoading = false;
      }
    });
  }

  formatFrequency(frequency: string): string {
    const doses = frequency.split('-').map((d: string) => parseInt(d) || 0);
    const times = ['Morning', 'Afternoon', 'Evening'];
    const activeTimes = times.filter((_, i) => doses[i] === 1);
    return activeTimes.join(' + ');
  }

  getProgress(medicine: Medicine): number {
    if (medicine.originalTotalPills === 0) return 100;
    return Math.round((medicine.totalPills / medicine.originalTotalPills) * 100);
  }

  editMedicine(id: string): void {
    this.router.navigate(['/update-medicine', id]);
  }

  viewHistory(id: string): void {
    this.router.navigate(['/reports', id]);
  }

  markTaken(id: string): void {
    const today = new Date().toISOString().split('T')[0];
    const taken = '1-1-1'; // Mark all doses as taken

    this.medicineService.setMedicineTakenDay(id, { date: today, taken }).subscribe({
      next: () => {
        // Show success message
        console.log('Medicine marked as taken');
      },
      error: (err) => {
        console.error('Error marking medicine as taken:', err);
      }
    });
  }

  toggleReminder(id: string): void {
    this.medicineService.getReminderStatus(id).subscribe({
      next: (reminder) => {
        this.medicineService.toggleReminderStatus(id, { isActive: !reminder.isActive }).subscribe({
          next: () => {
            this.loadMedicines();
          },
          error: (err) => {
            console.error('Error toggling reminder:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error getting reminder status:', err);
      }
    });
  }

  deleteMedicine(id: string): void {
    if (confirm('Are you sure you want to delete this medicine?')) {
      this.medicineService.deleteMedicine(id).subscribe({
        next: () => {
          this.loadMedicines();
        },
        error: (err) => {
          console.error('Error deleting medicine:', err);
        }
      });
    }
  }
}
