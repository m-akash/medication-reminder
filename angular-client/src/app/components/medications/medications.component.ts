import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MedicineService } from '../../services/medicine.service';
import { Medicine } from '../../models/medicine.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-medications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <button routerLink="/home" class="btn btn-sm btn-ghost mb-2 flex items-center gap-1 font-semibold text-gray-600 hover:bg-white/30 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Back to Dashboard
          </button>
          <h1 class="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 tracking-tight">
            My Medications
          </h1>
          <p class="text-gray-600 font-semibold mt-1">Manage your medicine schedule and tracking</p>
        </div>
        <button routerLink="/add-medicine" class="btn bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 text-white border-0 hover:opacity-90 font-bold shadow-lg rounded-2xl px-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5 mr-2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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
        <div class="card bg-white/70 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl p-12 text-center max-w-lg mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-24 w-24 mx-auto text-gray-300 mb-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">No Medications Yet</h3>
          <p class="text-gray-500 mb-8 max-w-sm mx-auto">Start by adding your first medication to your schedule to begin tracking.</p>
          <button routerLink="/add-medicine" class="btn bg-gradient-to-r from-amber-400 to-indigo-500 text-white border-0 hover:opacity-90 font-bold px-8 rounded-2xl">
            Add Your First Medicine
          </button>
        </div>
      }

      <!-- Medicines List -->
      @if (!isLoading && medicines.length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (medicine of medicines; track medicine.id) {
            <div class="card bg-white/70 backdrop-blur-md border border-white/40 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 rounded-3xl">
              <!-- Card Header -->
              <div class="bg-gradient-to-r from-emerald-50/60 to-indigo-50/60 p-6 border-b border-white/20 rounded-t-3xl">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-4">
                    <div class="avatar placeholder">
                      <div class="bg-gradient-to-br from-amber-400 via-pink-400 to-indigo-500 text-white rounded-2xl w-14 h-14 flex items-center justify-center font-extrabold text-xl shadow-md">
                        {{ medicine.name.charAt(0).toUpperCase() }}
                      </div>
                    </div>
                    <div>
                      <h3 class="font-bold text-lg text-gray-800 tracking-tight">{{ medicine.name }}</h3>
                      <span class="badge badge-sm badge-outline text-gray-500 border-gray-200 mt-1">{{ medicine.dosage || 'As prescribed' }}</span>
                    </div>
                  </div>
                  <div class="relative flex-shrink-0">
                    <button (click)="toggleDropdown(medicine.id, $event)" class="btn btn-ghost btn-sm btn-circle hover:bg-white/50">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="h-6 w-6 text-gray-600">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                      </svg>
                    </button>
                    @if (activeDropdownId === medicine.id) {
                      <ul (click)="$event.stopPropagation()" class="absolute right-0 mt-2 z-[10] p-2 shadow-2xl bg-white/90 backdrop-blur-lg border border-white/40 rounded-2xl w-52 space-y-1">
                        <li class="px-4 py-2 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Actions</li>
                        <li><a class="flex items-center gap-3 py-2.5 px-4 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-indigo-600 hover:text-white rounded-xl transition-all duration-200 font-bold text-gray-700 cursor-pointer" (click)="editMedicine(medicine.id); closeDropdown()">
                          Edit Details
                        </a></li>
                        <li><a class="flex items-center gap-3 py-2.5 px-4 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-indigo-600 hover:text-white rounded-xl transition-all duration-200 font-bold text-gray-700 cursor-pointer" (click)="toggleReminder(medicine.id); closeDropdown()">
                          <span>Reminders</span>
                          @if (medicine.reminderActive) {
                            <span class="badge badge-success badge-sm font-bold text-[10px] text-white">ON</span>
                          } @else {
                            <span class="badge badge-ghost badge-sm font-bold text-[10px]">OFF</span>
                          }
                        </a></li>
                        <li><a class="flex items-center gap-3 py-2.5 px-4 hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-600 hover:text-white rounded-xl transition-all duration-200 font-bold text-rose-600 hover:text-white cursor-pointer" (click)="deleteMedicine(medicine.id); closeDropdown()">
                          Delete
                        </a></li>
                      </ul>
                    }
                  </div>
                </div>
              </div>

              <!-- Card Body -->
              <div class="p-6 space-y-5">
                <!-- Frequency -->
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 font-semibold">Frequency</span>
                  <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">{{ formatFrequency(medicine.frequency) }}</span>
                </div>

                <!-- Duration -->
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 font-semibold">Duration</span>
                  <span class="font-bold text-gray-800">{{ medicine.durationDays }} days remaining</span>
                </div>

                <!-- Pills -->
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 font-semibold">Dose Size</span>
                  <span class="font-bold text-gray-800">{{ medicine.pillsPerDose }} pill(s) per dose</span>
                </div>

                <!-- Progress -->
                <div class="space-y-2 pt-2 border-t border-gray-100">
                  <div class="flex justify-between text-xs font-bold">
                    <span class="text-gray-500">Inventory Status</span>
                    <span [class.text-emerald-600]="getProgress(medicine) > 50" [class.text-amber-600]="getProgress(medicine) <= 50 && getProgress(medicine) > 20" [class.text-red-600]="getProgress(medicine) <= 20">
                      {{ getProgress(medicine) }}%
                    </span>
                  </div>
                  <progress class="progress w-full" 
                            [class.progress-success]="getProgress(medicine) > 50"
                            [class.progress-warning]="getProgress(medicine) <= 50 && getProgress(medicine) > 20"
                            [class.progress-error]="getProgress(medicine) <= 20"
                            value="{{ getProgress(medicine) }}" max="100"></progress>
                  <p class="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                    <span>📦</span> {{ medicine.totalPills }} of {{ medicine.originalTotalPills }} pills remaining
                  </p>
                </div>
              </div>

              <!-- Card Footer -->
              <div class="flex flex-col sm:flex-row gap-3 items-center justify-between bg-gradient-to-r from-gray-50/50 to-indigo-50/30 px-6 py-4 border-t border-white/20 rounded-b-3xl">
                <button (click)="viewHistory(medicine.id)" class="btn btn-sm btn-ghost hover:bg-white text-gray-600 font-bold rounded-xl transition-all w-full sm:w-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-4 w-4 mr-1 inline">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0 1 3 18.375v-5.25ZM9 9.75c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v8.625c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0 1 9 18.375V9.75ZM15 5.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v12.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V5.625Z" />
                  </svg>
                  Adherence History
                </button>
                <button (click)="markTaken(medicine.id)" class="btn btn-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white border-0 font-bold rounded-xl shadow-md transition-all w-full sm:w-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="h-4 w-4 mr-1 inline">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
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
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/medications' } });
      return;
    }

    this.userEmail = user.email;
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.isLoading = true;
    this.medicineService.getMedicines().subscribe({
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
        console.log('Medicine marked as taken');
        this.loadMedicines();
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

  activeDropdownId: string | null = null;

  toggleDropdown(id: string, event: Event): void {
    event.stopPropagation();
    if (this.activeDropdownId === id) {
      this.activeDropdownId = null;
    } else {
      this.activeDropdownId = id;
    }
  }

  closeDropdown(): void {
    this.activeDropdownId = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.activeDropdownId = null;
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
