import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicineService } from '../../services/medicine.service';
import { MedicineTakenDay } from '../../models/medicine.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen p-4 md:p-8">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button routerLink="/home" class="btn btn-circle btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-400">
            Medicine Reports
          </h1>
          <p class="text-gray-600 font-semibold mt-1">Track your medicine adherence over time</p>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading) {
        <div class="flex justify-center items-center h-64">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      }

      <!-- Report Content -->
      @if (!isLoading) {
        <div class="card bg-white shadow-2xl rounded-2xl p-6 md:p-8">
          <!-- Medicine Info -->
          <div class="mb-8 pb-6 border-b border-gray-200">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ medicineName }}</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p class="text-sm text-gray-600">Total Days</p>
                <p class="text-xl font-bold text-indigo-600">{{ totalDays }} days</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Days Tracked</p>
                <p class="text-xl font-bold text-emerald-600">{{ history.length }} days</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Doses Taken</p>
                <p class="text-xl font-bold text-amber-600">{{ totalDosesTaken }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Adherence</p>
                <p class="text-xl font-bold" [class.text-emerald-600]="adherenceRate >= 80" [class.text-amber-600]="adherenceRate < 80 && adherenceRate >= 50" [class.text-red-600]="adherenceRate < 50">
                  {{ adherenceRate }}%
                </p>
              </div>
            </div>
          </div>

          <!-- Calendar View -->
          <div>
            <h3 class="text-xl font-bold text-gray-800 mb-4">📊 Daily History</h3>

            @if (history.length === 0) {
              <div class="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-16 w-16 mx-auto text-gray-300 mb-4">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p class="text-gray-500">No history data available for this medicine</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="table table-zebra">
                  <thead>
                    <tr class="bg-gradient-to-r from-emerald-50 to-indigo-50">
                      <th>Date</th>
                      <th>Doses Taken</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of history; track item.id) {
                      <tr>
                        <td class="font-semibold">{{ formatDate(item.date) }}</td>
                        <td>
                          <div class="flex gap-2">
                            @for (dose of getDoseBreakdown(item.taken); track $index) {
                              <span class="badge" [class.badge-success]="dose === '1'" [class.badge-error]="dose === '0'">
                                {{ getDoseTimeName($index) }}: {{ dose === '1' ? 'Taken' : 'Missed' }}
                              </span>
                            }
                          </div>
                        </td>
                        <td>
                          @if (getCompletionPercentage(item.taken) === 100) {
                            <span class="badge badge-success">Complete</span>
                          } @else if (getCompletionPercentage(item.taken) >= 50) {
                            <span class="badge badge-warning">Partial</span>
                          } @else {
                            <span class="badge badge-error">Missed</span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>

          <!-- Summary Stats -->
          @if (history.length > 0) {
            <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="stat bg-emerald-50 rounded-xl p-4">
                <div class="stat-title text-gray-600">Days Completed</div>
                <div class="stat-value text-emerald-600 text-2xl">{{ getCompletedDays() }}</div>
              </div>
              <div class="stat bg-amber-50 rounded-xl p-4">
                <div class="stat-title text-gray-600">Days Partially Completed</div>
                <div class="stat-value text-amber-600 text-2xl">{{ getPartialDays() }}</div>
              </div>
              <div class="stat bg-red-50 rounded-xl p-4">
                <div class="stat-title text-gray-600">Days Missed</div>
                <div class="stat-value text-red-600 text-2xl">{{ getMissedDays() }}</div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ReportsComponent implements OnInit {
  medicineId = '';
  medicineName = '';
  history: MedicineTakenDay[] = [];
  isLoading = false;
  totalDays = 30;
  totalDosesTaken = 0;
  adherenceRate = 0;
  userEmail = '';

  constructor(
    private route: ActivatedRoute,
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
    this.medicineId = this.route.snapshot.paramMap.get('id') || '';

    if (this.medicineId) {
      this.loadMedicineHistory();
    } else {
      // No medicine ID, show all medicines summary
      this.router.navigate(['/medications']);
    }
  }

  loadMedicineHistory(): void {
    this.isLoading = true;

    // Get medicine details first
    this.medicineService.getMedicineById(this.medicineId).subscribe({
      next: (medicine) => {
        this.medicineName = medicine.name;
        this.totalDays = medicine.durationDays;

        // Get history for the last 30 days
        const from = new Date();
        from.setDate(from.getDate() - this.totalDays);
        const to = new Date();

        this.medicineService.getMedicineTakenHistory(
          this.medicineId,
          from.toISOString().split('T')[0],
          to.toISOString().split('T')[0]
        ).subscribe({
          next: (history) => {
            this.history = history;
            this.calculateStats();
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error loading history:', err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error loading medicine:', err);
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    let totalTaken = 0;
    let totalScheduled = 0;

    this.history.forEach(item => {
      if (item.taken) {
        const doses = item.taken.split('-');
        totalTaken += doses.filter(d => d === '1').length;
        totalScheduled += doses.length;
      }
    });

    this.totalDosesTaken = totalTaken;
    this.adherenceRate = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  getDoseBreakdown(takenStr: string | undefined): string[] {
    if (!takenStr) return ['0', '0', '0'];
    return takenStr.split('-');
  }

  getDoseTimeName(index: number): string {
    const times = ['Morning', 'Afternoon', 'Evening'];
    return times[index] || `Dose ${index + 1}`;
  }

  getCompletionPercentage(takenStr: string | undefined): number {
    if (!takenStr) return 0;
    const doses = takenStr.split('-');
    const taken = doses.filter(d => d === '1').length;
    return doses.length > 0 ? Math.round((taken / doses.length) * 100) : 0;
  }

  getCompletedDays(): number {
    return this.history.filter(item => this.getCompletionPercentage(item.taken) === 100).length;
  }

  getPartialDays(): number {
    return this.history.filter(item => {
      const pct = this.getCompletionPercentage(item.taken);
      return pct > 0 && pct < 100;
    }).length;
  }

  getMissedDays(): number {
    return this.history.filter(item => this.getCompletionPercentage(item.taken) === 0).length;
  }
}
