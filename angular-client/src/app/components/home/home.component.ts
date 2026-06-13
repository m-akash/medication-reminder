import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { MedicineService } from '../../services/medicine.service';
import { Medicine } from '../../models/medicine.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen p-4 md:p-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-400">
            Welcome back, {{ getCurrentUser()?.name || 'User' }}! 👋
          </h1>
          <p class="text-gray-600 font-semibold mt-2">Here's your medicine overview for today</p>
        </div>
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
            <div class="w-10 rounded-full bg-gradient-to-r from-amber-400 to-indigo-400">
              <span class="text-white font-bold text-lg">{{ getInitials() }}</span>
            </div>
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-white rounded-box w-52">
            <li><a class="justify-between" routerLink="/settings">
              Settings
            </a></li>
            <li><a (click)="logout()">Logout</a></li>
          </ul>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="stat bg-white shadow-lg rounded-2xl border-l-4 border-l-emerald-400">
          <div class="stat-figure text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="stat-title">Total Medicines</div>
          <div class="stat-value text-emerald-500">{{ medicines.length }}</div>
          <div class="stat-desc">Active medications</div>
        </div>

        <div class="stat bg-white shadow-lg rounded-2xl border-l-4 border-l-amber-400">
          <div class="stat-figure text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="stat-title">Due Today</div>
          <div class="stat-value text-amber-500">{{ getDueTodayCount() }}</div>
          <div class="stat-desc">Doses scheduled</div>
        </div>

        <div class="stat bg-white shadow-lg rounded-2xl border-l-4 border-l-indigo-400">
          <div class="stat-figure text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div class="stat-title">Refill Alerts</div>
          <div class="stat-value text-indigo-500">{{ refillReminders.length }}</div>
          <div class="stat-desc">Need attention</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button routerLink="/medications" class="btn btn-lg bg-white hover:bg-gray-50 border-2 border-gray-200 shadow-lg rounded-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-8 w-8 mx-auto mb-2 text-indigo-500">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span class="block font-bold text-gray-700">My Medicines</span>
        </button>

        <button routerLink="/add-medicine" class="btn btn-lg bg-gradient-to-r from-amber-400 to-indigo-400 text-white border-0 hover:opacity-90 shadow-lg rounded-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-8 w-8 mx-auto mb-2">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="block font-bold">Add Medicine</span>
        </button>

        <button routerLink="/reports" class="btn btn-lg bg-white hover:bg-gray-50 border-2 border-gray-200 shadow-lg rounded-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-8 w-8 mx-auto mb-2 text-emerald-500">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span class="block font-bold text-gray-700">Reports</span>
        </button>

        <button routerLink="/settings" class="btn btn-lg bg-white hover:bg-gray-50 border-2 border-gray-200 shadow-lg rounded-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-8 w-8 mx-auto mb-2 text-amber-500">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="block font-bold text-gray-700">Settings</span>
        </button>
      </div>

      <!-- Today's Schedule -->
      <div class="bg-white shadow-xl rounded-2xl p-6 mb-6" *ngIf="getTodaySchedule().length > 0">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">📅 Today's Schedule</h2>
        <div class="space-y-3">
          @for (item of getTodaySchedule(); track item.medicine.id) {
            <div class="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-indigo-50 rounded-xl border border-gray-200">
              <div class="flex items-center gap-4">
                <div class="avatar placeholder">
                  <div class="bg-emerald-400 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
                    {{ item.medicine.name.charAt(0) }}
                  </div>
                </div>
                <div>
                  <h3 class="font-bold text-gray-800">{{ item.medicine.name }}</h3>
                  <p class="text-sm text-gray-600">
                    {{ item.medicine.dosage || 'As prescribed' }} • {{ item.time }}
                  </p>
                </div>
              </div>
              <input type="checkbox" class="checkbox checkbox-primary checkbox-lg" />
            </div>
          }
        </div>
      </div>

      <!-- Refill Reminders -->
      <div class="bg-white shadow-xl rounded-2xl p-6" *ngIf="refillReminders.length > 0">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">⚠️ Refill Reminders</h2>
        <div class="space-y-3">
          @for (reminder of refillReminders; track reminder.id) {
            <div class="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-red-50 rounded-xl border border-amber-200">
              <div>
                <h3 class="font-bold text-gray-800">{{ reminder.name }}</h3>
                <p class="text-sm text-gray-600">
                  <span class="text-amber-600 font-bold">{{ reminder.pillsLeft }} pills</span> remaining •
                  <span class="text-red-600 font-bold">{{ reminder.daysLeft }} days</span> left
                </p>
              </div>
              <button (click)="refillMedicine(reminder.id)" class="btn btn-sm btn-primary">Refill</button>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  medicines: Medicine[] = [];
  refillReminders: any[] = [];
  userEmail = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private medicineService: MedicineService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.userEmail = user.email;
    this.loadData();
  }

  loadData(): void {
    this.medicineService.getMedicinesByUserEmail(this.userEmail).subscribe({
      next: (medicines) => {
        this.medicines = medicines;
      },
      error: (err) => {
        console.error('Error loading medicines:', err);
      }
    });

    this.medicineService.getRefillReminders(this.userEmail).subscribe({
      next: (reminders) => {
        this.refillReminders = reminders;
      },
      error: (err) => {
        console.error('Error loading refill reminders:', err);
      }
    });
  }

  getCurrentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  getInitials(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '?';
    return user.name.charAt(0).toUpperCase();
  }

  getDueTodayCount(): number {
    // Calculate how many doses are due today based on medicine frequency
    return this.medicines.reduce((total, med) => {
      const doses = med.frequency.split('-').map((d: string) => parseInt(d) || 0);
      return total + doses.reduce((a: number, b: number) => a + b, 0);
    }, 0);
  }

  getTodaySchedule(): any[] {
    const schedule: any[] = [];
    const times = ['Morning', 'Afternoon', 'Evening'];

    this.medicines.forEach(med => {
      const doses = med.frequency.split('-');
      doses.forEach((dose, index) => {
        if (dose === '1' && times[index]) {
          schedule.push({
            medicine: med,
            time: times[index]
          });
        }
      });
    });

    return schedule;
  }

  refillMedicine(id: string): void {
    this.medicineService.refillMedicine(id).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        console.error('Error refilling medicine:', err);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
